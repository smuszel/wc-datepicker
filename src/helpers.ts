import { startOfMonth, addDays, differenceInMonths } from 'date-fns';
/* tslint:disable */

export const generateDatesForDaysInMonth = (d: Date, minimumWeeks: number) => {
    const targetMonthStart = startOfMonth(d);
    const start = addDays(targetMonthStart, targetMonthStart.getDay() * - 1);
    const range = Array(minimumWeeks * 7).fill(0);
    const resDates = range.map((_, ix) => addDays(start, ix));

    return resDates;
}

export const monthsFromNow = date => {
    if (!date) {
        return 0;
    } else {
        return 0
        // return differenceInMonths(new Date(), date);
    }
}