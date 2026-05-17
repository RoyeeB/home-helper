import { Timestamp } from 'firebase/firestore';
import { Category } from '../constants/colors';

export interface HouseMember {
  uid: string;
  name: string;
}

export interface House {
  id: string;
  name: string;
  code: string;
  memberIds: string[];
  members: HouseMember[];
  createdAt: Timestamp;
}

export interface Expense {
  id: string;
  userId: string;
  userName: string;
  desc: string;
  amount: number;
  category: Category;
  note?: string;
  monthKey: string;
  date: Timestamp;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  type: string;
  dayOfMonth: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  checked: boolean;
  addedBy: string;
  addedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  houseId?: string;
}

export type BudgetMap = Partial<Record<Category, number>>;
