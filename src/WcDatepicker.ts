import { addMonths, format, differenceInCalendarMonths } from 'date-fns'; 
import { generateDatesForDaysInMonth, monthsFromNow } from './helpers';

const dayNames = [
    'Su',
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
]

const cssClasses = {
    launcher: 'launcher',
    calendarBody: 'calendar-body',
    daysContainer: 'days-container',
    nextMonth: 'next-month',
    previousMonth: 'previous-month',
    save: 'save',
    cancel: 'cancel',
}

const attributes = {
    opened: 'opened',
    value: 'value',
    valueNotSaved: 'value-not-saved'
}

const childAttributes = {
    selected: 'selected',
}

interface HTMLDayElement extends HTMLSpanElement {
    date: string
}

export class WcDatepicker extends HTMLElement {

    launcher: HTMLDivElement;
    calendarBody: HTMLDivElement;
    previousMonth: HTMLButtonElement;
    nextMonth: HTMLButtonElement;
    daysContainer: HTMLDivElement;
    daysOfWeek: HTMLSpanElement[];
    days: HTMLDayElement[];
    save: HTMLButtonElement;
    cancel: HTMLButtonElement;

    valueFormat = 'DD.MM.YYYY'
    daysOnSigleDisplay = 42;
    minimumWeeks = 6;
    _monthOffset = 0;
    dispose: () => void;
    
    constructor() {
        super();
    }

    static get observedAttributes() {
        return Object.values(attributes);
    }

    clickDelegate(ev: MouseEvent) {
        const tgt = ev.target as any;
        const lst = tgt.classList;

        switch (lst[0]) {
            case cssClasses.previousMonth:
                this.monthOffset--; break
            case cssClasses.nextMonth:
                this.monthOffset++; break
            case cssClasses.cancel:
                this.opened = false; break
            case cssClasses.save:
                this.value = this.valueNotSaved;
                this.opened = false;
                break
            case 'day':
                this.valueNotSaved = tgt.date; break
            default: return;
        }
    }

    refreshDaysDisplay(jsDays: Date[], htmlDays: HTMLDayElement [], targetedDate: string) {
        const evaluatePossesedDate = (jsday, ix) => {
                const d = htmlDays[ix];
                d.date = jsday.toISOString();
                d.innerText = `${jsday.getDate()}`;
            };
    
        const evaluateSelectedState = htmlday => {
            htmlday.removeAttribute(childAttributes.selected);

            if (htmlday.date === targetedDate) {
                htmlday.setAttribute(childAttributes.selected, 'true');
            }
        }
        
        jsDays.forEach(evaluatePossesedDate);
        htmlDays.forEach(evaluateSelectedState);
    }

    connectedCallback() {
        this.setUpInnerDOM();
        this.addEventListener('click', this.clickDelegate.bind(this));
        this.dispose = this.setUpOpeningAndClosing();
    }

    disconnectedCallback() {
        this.dispose();
    }

    setUpOpeningAndClosing() {
        const helper = ev => {
            this.opened = this.contains(ev.target);
        }

        document.addEventListener('focusin', helper)
        document.addEventListener('focusin', console.log)

        return () => document.removeEventListener('focusin', helper);
    }

    setUpInnerDOM() {
        const createElements = () => {
            this.launcher = document.createElement('div');
            this.calendarBody = document.createElement('div');
            this.previousMonth = document.createElement('button');
            this.nextMonth = document.createElement('button');
            this.daysContainer = document.createElement('div');
            this.daysOfWeek = Array(7).fill(undefined)
                .map(_ => document.createElement('span'));
            //@ts-ignore
            this.days = Array(this.daysOnSigleDisplay).fill(undefined)
                .map(_ => document.createElement('span'));
            this.save = document.createElement('button');
            this.cancel = document.createElement('button');
        }
    
        const append = () => {
            this.daysOfWeek.forEach(d => this.daysContainer.appendChild(d));
            this.days.forEach(d => this.daysContainer.appendChild(d));
    
            this.calendarBody.appendChild(this.previousMonth);
            this.calendarBody.appendChild(this.nextMonth);
            this.calendarBody.appendChild(this.daysContainer);
            this.calendarBody.appendChild(this.cancel);
            this.calendarBody.appendChild(this.save);

            this.appendChild(this.launcher);
            this.appendChild(this.calendarBody)
        }
    
        const setText = () => {
            this.previousMonth.textContent = '<';
            this.nextMonth.textContent = '>';
            this.cancel.textContent = 'cancel'
            this.save.textContent = 'save'
            this.daysOfWeek.forEach((d, ix) => d.innerText = dayNames[ix]);
        }

        const applyClasses = () => {
            Object.entries(cssClasses).forEach(([propName, cls]) => {
                this[propName].classList.add(cls);
            });

            this.daysOfWeek.forEach(d => d.classList.add('day-of-week'));
            this.days.forEach(d => d.classList.add('day'));
        }

        const misc = () => {
            this.launcher.tabIndex = 1;
            this.calendarBody.tabIndex = 2;
        }

        createElements();
        applyClasses();
        setText();
        append();
        misc();
    }

    get monthOffset() {
        return this._monthOffset;
    }

    set monthOffset(v) {
        this._monthOffset = v;
        const d = this.valueNotSaved || this.value;

        this.refreshDaysDisplay(this.daysForCurrentContext, this.days, d);
    }
    
    set opened(v) {
        const fromClosedToOpened = !this.opened && v;
        const fromOpenedToClosed = this.opened && !v;

        if (fromClosedToOpened) {
            this.monthOffset = monthsFromNow(this.value);
            this.refreshDaysDisplay(this.daysForCurrentContext, this.days, this.value);

            this.setAttribute(attributes.opened, 'true');
        } else if (fromOpenedToClosed) {
            this.valueNotSaved = '';
            this.removeAttribute(attributes.opened)            
        }
    }

    get opened() {
        return !!this.getAttribute(attributes.opened);
    }

    set valueNotSaved(v) {
        if (v === '') {
            this.removeAttribute(this.valueNotSaved);
        } else {
            this.refreshDaysDisplay(this.daysForCurrentContext, this.days, v);
    
            this.setAttribute(attributes.valueNotSaved, v);
        }
    }

    get valueNotSaved() {
        const v = this.getAttribute(attributes.valueNotSaved);

        return v;
    }

    set value(v) {
        this.launcher.innerText = format(v, this.valueFormat);
        this.valueNotSaved = v;
        this.setAttribute(attributes.value, v);
    }

    get value() {
        const v = this.getAttribute(attributes.value);

        return v || new Date().toISOString();
    }

    get monthContext() {
        const d = this.value || new Date();

        return addMonths(d, this.monthOffset || 0);
    }

    get daysForCurrentContext() {
        return generateDatesForDaysInMonth(this.monthContext, this.minimumWeeks); 
    }
}
