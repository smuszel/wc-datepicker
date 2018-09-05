import { addMonths, format } from 'date-fns'; 
import { generateDatesForDaysInMonth } from './helpers';

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
    clickLog: string[] = [];
    monthOffset = 0;
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
                this.monthOffset--; this.initDisplay(); this.evaluateActiveDays(); break
            case cssClasses.nextMonth:
                this.monthOffset++; this.initDisplay(); this.evaluateActiveDays(); break
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

    attributeChangedCallback(name, oldV, newV) {
        switch (name) {
            case attributes.opened:
                if (!oldV && newV) {
                    this.monthOffset = 0;
                    this.initDisplay();
                    this.evaluateActiveDays();
                } break;
            case attributes.valueNotSaved:
                this.evaluateActiveDays(newV);
                break;
            default: return;
        }
    }

    initDisplay() {
        this.daysForCurrentContext.forEach((jsday, ix) => {
            const d = this.days[ix];
            d.date = jsday.toISOString();
            d.innerText = `${jsday.getDate()}`;
        });
    }

    evaluateActiveDays(activeISODate = this.valueNotSaved) {
        this.days.forEach((htmlday) => {
            htmlday.removeAttribute(childAttributes.selected);

            if (htmlday.date === activeISODate) {
                htmlday.setAttribute(childAttributes.selected, 'true');
            }
        })
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
            const outside = !this.contains(ev.target);
            const opened = !!this.opened;
            const closed = !opened;
            const launcherTargeted = ev.target === this.launcher;

            if (launcherTargeted && closed) {
                this.opened = true;
            } else if (outside && opened) {
                this.opened = false;
            }
        }

        document.addEventListener('focusin', helper)

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
    
    set opened(v) {
        v
            ? this.setAttribute(attributes.opened, 'true')
            : this.removeAttribute(attributes.opened);
    }

    get opened() {
        return !!this.getAttribute(attributes.opened);
    }

    set valueNotSaved(v) {
        this.setAttribute(attributes.valueNotSaved, v);
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
