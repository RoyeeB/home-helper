import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  deleteField,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { House, Expense, FixedCost, ShoppingItem, BudgetMap } from '../types';
import { Category } from '../constants/colors';
import { getCurrentMonthKey } from '../hooks/useMonthKey';
import { useAuth } from './AuthContext';

interface ExpenseInput {
  desc: string;
  amount: number;
  category: Category;
  note?: string;
}

interface AddFixedCostInput {
  name: string;
  amount: number;
  type: string;
  dayOfMonth: number;
}

interface HouseContextType {
  house: House | null;
  expenses: Expense[];
  fixedCosts: FixedCost[];
  shoppingItems: ShoppingItem[];
  budgets: BudgetMap;
  loadingHouse: boolean;
  addExpense: (input: ExpenseInput) => Promise<void>;
  updateExpense: (id: string, input: ExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addFixedCost: (input: AddFixedCostInput) => Promise<void>;
  updateFixedCost: (id: string, input: Partial<AddFixedCostInput>) => Promise<void>;
  deleteFixedCost: (id: string) => Promise<void>;
  addShoppingItem: (name: string, qty: string) => Promise<void>;
  toggleShoppingItem: (id: string, checked: boolean) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  setBudget: (category: Category, amount: number) => Promise<void>;
  removeBudget: (category: Category) => Promise<void>;
}

const HouseContext = createContext<HouseContextType>({} as HouseContextType);

export function HouseProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [house, setHouse] = useState<House | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetMap>({});
  const [loadingHouse, setLoadingHouse] = useState(true);

  const unsubsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    unsubsRef.current.forEach((u) => u());
    unsubsRef.current = [];

    if (!profile?.houseId) {
      setHouse(null);
      setExpenses([]);
      setFixedCosts([]);
      setShoppingItems([]);
      setBudgets({});
      setLoadingHouse(false);
      return;
    }

    setLoadingHouse(true);
    const houseId = profile.houseId;

    const unsubHouse = onSnapshot(doc(db, 'houses', houseId), (snap) => {
      if (snap.exists()) {
        setHouse({ id: snap.id, ...snap.data() } as House);
      }
      setLoadingHouse(false);
    });

    const expensesQ = query(
      collection(db, 'houses', houseId, 'expenses'),
      orderBy('date', 'desc')
    );
    const unsubExpenses = onSnapshot(expensesQ, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense)));
    });

    const unsubFixed = onSnapshot(collection(db, 'houses', houseId, 'fixedCosts'), (snap) => {
      setFixedCosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FixedCost)));
    });

    const shoppingQ = query(
      collection(db, 'houses', houseId, 'shopping'),
      orderBy('addedAt', 'asc')
    );
    const unsubShopping = onSnapshot(shoppingQ, (snap) => {
      setShoppingItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShoppingItem)));
    });

    const unsubBudgets = onSnapshot(doc(db, 'houses', houseId, 'settings', 'budgets'), (snap) => {
      setBudgets(snap.exists() ? (snap.data() as BudgetMap) : {});
    });

    unsubsRef.current = [unsubHouse, unsubExpenses, unsubFixed, unsubShopping, unsubBudgets];
    return () => {
      unsubsRef.current.forEach((u) => u());
    };
  }, [profile?.houseId]);

  async function addExpense({ desc, amount, category, note }: ExpenseInput) {
    if (!profile?.houseId || !profile) return;
    await addDoc(collection(db, 'houses', profile.houseId, 'expenses'), {
      userId: profile.uid,
      userName: profile.displayName,
      desc,
      amount,
      category,
      note: note || '',
      monthKey: getCurrentMonthKey(),
      date: serverTimestamp(),
    });
  }

  async function updateExpense(id: string, { desc, amount, category, note }: ExpenseInput) {
    if (!profile?.houseId) return;
    await updateDoc(doc(db, 'houses', profile.houseId, 'expenses', id), {
      desc,
      amount,
      category,
      note: note || '',
    });
  }

  async function deleteExpense(id: string) {
    if (!profile?.houseId) return;
    await deleteDoc(doc(db, 'houses', profile.houseId, 'expenses', id));
  }

  async function addFixedCost(input: AddFixedCostInput) {
    if (!profile?.houseId) return;
    await addDoc(collection(db, 'houses', profile.houseId, 'fixedCosts'), input);
  }

  async function updateFixedCost(id: string, input: Partial<AddFixedCostInput>) {
    if (!profile?.houseId) return;
    await updateDoc(doc(db, 'houses', profile.houseId, 'fixedCosts', id), input);
  }

  async function deleteFixedCost(id: string) {
    if (!profile?.houseId) return;
    await deleteDoc(doc(db, 'houses', profile.houseId, 'fixedCosts', id));
  }

  async function addShoppingItem(name: string, qty: string) {
    if (!profile?.houseId) return;
    await addDoc(collection(db, 'houses', profile.houseId, 'shopping'), {
      name,
      qty,
      checked: false,
      addedBy: profile.displayName,
      addedAt: serverTimestamp(),
    });
  }

  async function toggleShoppingItem(id: string, checked: boolean) {
    if (!profile?.houseId) return;
    await updateDoc(doc(db, 'houses', profile.houseId, 'shopping', id), { checked });
  }

  async function clearCheckedItems() {
    if (!profile?.houseId) return;
    const toDelete = shoppingItems.filter((i) => i.checked);
    await Promise.all(
      toDelete.map((i) => deleteDoc(doc(db, 'houses', profile!.houseId!, 'shopping', i.id)))
    );
  }

  async function setBudget(category: Category, amount: number) {
    if (!profile?.houseId) return;
    await setDoc(
      doc(db, 'houses', profile.houseId, 'settings', 'budgets'),
      { [category]: amount },
      { merge: true }
    );
  }

  async function removeBudget(category: Category) {
    if (!profile?.houseId) return;
    await setDoc(
      doc(db, 'houses', profile.houseId, 'settings', 'budgets'),
      { [category]: deleteField() },
      { merge: true }
    );
  }

  return (
    <HouseContext.Provider
      value={{
        house,
        expenses,
        fixedCosts,
        shoppingItems,
        budgets,
        loadingHouse,
        addExpense,
        updateExpense,
        deleteExpense,
        addFixedCost,
        updateFixedCost,
        deleteFixedCost,
        addShoppingItem,
        toggleShoppingItem,
        clearCheckedItems,
        setBudget,
        removeBudget,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
}

export const useHouse = () => useContext(HouseContext);
