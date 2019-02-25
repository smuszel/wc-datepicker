import { startOfMonth, addDays, addMonths } from 'date-fns';

export const generateDatesForDaysInMonth = (d, minimumLength) => {
    const targetMonthStart = startOfMonth(d);
    const start = addDays(targetMonthStart, targetMonthStart.getDay() * - 1);
    const range = Array(minimumLength).fill(0);
    const resDates = range.map((_, ix) => addDays(start, ix));

    return resDates;
}

export const previousMonth = d => {
    return addMonths(d, -1).toISOString();
}

export const nextMonth = d => {
    return addMonths(d, 1).toISOString();
}