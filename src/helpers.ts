import { startOfMonth, addDays } from 'date-fns';
/* tslint:disable */

export const generateDatesForDaysInMonth = (d: Date, minimumWeeks: number) => {
    const targetMonthStart = startOfMonth(d);
    const start = addDays(targetMonthStart, targetMonthStart.getDay() * - 1);
    const range = Array(minimumWeeks * 7).fill(0);
    const resDates = range.map((_, ix) => addDays(start, ix));

    return resDates;
}