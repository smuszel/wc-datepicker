import { format } from 'date-fns'; 
import { generateDatesForDaysInMonth, previousMonth, nextMonth } from './helpers';

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
    monthContext: 'month-context',
    valueNotSaved: 'value-not-saved'
}

const childAttributes = {
    selected: 'selected',
}

interface HTMLDayElement extends HTMLSpanElement {
    date: string
}

interface HTMLContextDisplayElement extends HTMLSpanElement {
    format: string
}

export class WcDatepicker extends HTMLElement {

    launcher: HTMLDivElement;
    calendarBody: HTMLDivElement;
    previousMonth: HTMLButtonElement;
    nextMonth: HTMLButtonElement;
    contextDisplay: HTMLContextDisplayElement;
    daysContainer: HTMLDivElement;
    daysOfWeek: HTMLSpanElement[];
    days: HTMLDayElement[];
    save: HTMLButtonElement;
    cancel: HTMLButtonElement;

    defaultContextFormat = 'MMMM YYYY';
    defaultValueFormat = 'DD.MM.YYYY';
    default
    daysOnSigleDisplay = 42;
    minimumWeeks = 6;
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
                this.monthContext = previousMonth(this.monthContext);
                break;
            case cssClasses.nextMonth:
                this.monthContext = nextMonth(this.monthContext);
                break;
            case cssClasses.cancel:
                this.opened = false;
                break;
            case cssClasses.save:
                this.value = this.valueNotSaved;
                this.opened = false;
                break;
            case 'day':
                this.valueNotSaved = tgt.date;
                break;
            default: return;
        }
    }

    refreshDisplay() {
        setTimeout(
            this._refreshDisplay(
                this.monthContext,
                this.valueNotSaved || this.value || new Date().toISOString(),
                this.days,
                this.contextDisplay
            ), 0
        )
    }

    _refreshDisplay(
        monthContext: string,
        selectedDate: string,
        htmlDays: HTMLDayElement[],
        contextDisplay: HTMLContextDisplayElement
    ) {
        const jsDays = generateDatesForDaysInMonth(monthContext, htmlDays.length);

        const evaluatePossesedDate = htmlDays => (jsday, ix) => {
                const d = htmlDays[ix];
                d.date = jsday.toISOString();
                d.innerText = `${jsday.getDate()}`;
            };
    
        const evaluateSelectedState = selectedDate => htmlday => {
            htmlday.removeAttribute(childAttributes.selected);

            if (htmlday.date === selectedDate) {
                htmlday.setAttribute(childAttributes.selected, 'true');
            }
        }
        
        contextDisplay.innerText = format(monthContext, contextDisplay.format);
        jsDays.forEach(evaluatePossesedDate(htmlDays));
        htmlDays.forEach(evaluateSelectedState(selectedDate));
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

        return () => document.removeEventListener('focusin', helper);
    }

    setUpInnerDOM() {
        const createElements = () => {
            this.launcher = document.createElement('div');
            this.calendarBody = document.createElement('div');
            this.previousMonth = document.createElement('button');
            //@ts-ignore
            this.contextDisplay = document.createElement('span');
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
            this.calendarBody.appendChild(this.contextDisplay);
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
            this.contextDisplay.format = this.defaultContextFormat
        }

        createElements();
        applyClasses();
        setText();
        append();
        misc();
    }
    
    set opened(v) {
        const fromClosedToOpened = !this.opened && v;
        const fromOpenedToClosed = this.opened && !v;

        if (fromClosedToOpened) {
            this.monthContext = this.value;
            this.refreshDisplay();

            this.setAttribute(attributes.opened, 'true');
        } else if (fromOpenedToClosed) {
            this.monthContext = '';
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
            this.setAttribute(attributes.valueNotSaved, v);
            this.refreshDisplay();
        }
    }

    get valueNotSaved() {
        const v = this.getAttribute(attributes.valueNotSaved);

        return v;
    }

    set value(v) {
        this.launcher.innerText = format(v, this.defaultValueFormat);
        this.valueNotSaved = v;
        this.setAttribute(attributes.value, v);
    }

    get value() {
        const v = this.getAttribute(attributes.value);

        return v;
    }

    set monthContext(v) {
        if (v) {
            this.setAttribute(attributes.monthContext, v);
            this.refreshDisplay();
        } else {
            this.removeAttribute(attributes.monthContext);
        }
    }

    get monthContext() {
        const ctx = this.getAttribute(attributes.monthContext);

        if (!ctx) {
            const todayInISO = new Date().toISOString();
            this.monthContext = todayInISO;

            return todayInISO;
        } else {
            return ctx;
        }
    }
}
