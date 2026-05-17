import { format } from 'date-fns';

export function getCurrentMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, 'MMMM yyyy');
}

export function getLast12Months(): string[] {
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(format(d, 'yyyy-MM'));
  }
  return months;
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(format(d, 'yyyy-MM'));
  }
  return months;
}
