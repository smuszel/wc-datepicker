import { format, isSameMonth, isSameDay } from 'date-fns'; 
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
    nextMonth: 'month month-next',
    previousMonth: 'month month-previous',
    contextDisplay: 'context-display',
    daysContainer: 'days-container',
    days: 'day',
    daysOfWeek: 'day-of-week',
}

const attributes = {
    opened: 'opened',
    value: 'value',
    monthContext: 'month-context',
    valueNotSaved: 'value-not-saved'
}

const childAttributes = {
    selected: 'selected',
    distant: 'distant',
    disabled: 'disabled'
}

export class WcDatepicker extends HTMLElement {
    
    constructor() {
        super();

        this.options = {
            contextFormat: 'MMMM YYYY',
            valueFormat: 'DD.MM.YYYY',
            isDateDisabled: date => false,
            defaultMonthContext: new Date().toISOString()
        }

        this.daysOnSigleDisplay = 42;
        this.minimumWeeks = 6;
    }

    clickDelegate(ev) {
        const tgt = ev.target;
        const cls = tgt.className;

        switch (cls) {
            case cssClasses.previousMonth:
                this.monthContext = previousMonth(this.monthContext);
                break;
            case cssClasses.nextMonth:
                this.monthContext = nextMonth(this.monthContext);
                break;
            case cssClasses.days:
                this.value = tgt.date;
                this.opened = false;
                break;
            default: return;
        }
    }

    refreshDisplay() {
        setTimeout(
            this._refreshDisplay(
                this.monthContext,
                this.value,
                this.launcher,
                this.days,
                this.contextDisplay,
                this.options
            ), 0
        )
    }

    _refreshDisplay(
        monthContext,
        selectedDate,
        launcher,
        htmlDays,
        contextDisplay,
        options
    ) {
        if (!monthContext || monthContext === 'null') {
            monthContext = options.defaultMonthContext;
        }

        const refreshDay = ([date, day]) => {
            const distant = !isSameMonth(date, monthContext);
            const selected = isSameDay(date, selectedDate);
            const disabled = options.isDateDisabled(date);

            if (selected) {
                day.setAttribute(childAttributes.selected, 'true');
            } else {
                day.removeAttribute(childAttributes.selected);
            }
            
            if (distant) {
                day.setAttribute(childAttributes.distant, 'true')
            } else {
                day.removeAttribute(childAttributes.distant);
            }

            if (disabled) {
                day.setAttribute(childAttributes.disabled, 'true')
            } else {
                day.removeAttribute(childAttributes.disabled);
            }

            day.date = date.toISOString();
            day.innerText = date.getDate();
        }

        const jsDates = generateDatesForDaysInMonth(monthContext, htmlDays.length);
        const dayPairs = jsDates.map((jsDate, ix) => [jsDate, htmlDays[ix]]);

        dayPairs.forEach(refreshDay);
        contextDisplay.innerText = format(monthContext, options.contextFormat);

        if (selectedDate) {
            launcher.innerText = format(selectedDate, options.valueFormat);
        }
    }

    connectedCallback() {
        this.setUpInnerDOM();
        this.addEventListener('click', this.clickDelegate.bind(this));
        this.disposeExternalListeners = this.setUpOpeningAndClosing();
    }

    disconnectedCallback() {
        this.disposeExternalListeners();
    }

    setUpOpeningAndClosing() {
        const helper = ev => {
            this.opened = this.contains(ev.target);
        }

        document.addEventListener('focusin', helper)

        return () => document.removeEventListener('focusin', helper);
    }

    setUpInnerDOM() {
        const create = () => {
            this.launcher = document.createElement('div');
            this.calendarBody = document.createElement('div');
            this.previousMonth = document.createElement('button');
            this.contextDisplay = document.createElement('span');
            this.nextMonth = document.createElement('button');
            this.daysContainer = document.createElement('div');
            this.daysOfWeek = Array(7).fill(undefined)
                .map(_ => document.createElement('span'));
            this.days = Array(this.daysOnSigleDisplay).fill(undefined)
                .map(_ => document.createElement('span'));
            this.save = document.createElement('button');
        }
    
        const append = () => {
            this.daysOfWeek.forEach(d => this.daysContainer.appendChild(d));
            this.days.forEach(d => this.daysContainer.appendChild(d));
    
            this.calendarBody.appendChild(this.previousMonth);
            this.calendarBody.appendChild(this.contextDisplay);
            this.calendarBody.appendChild(this.nextMonth);
            this.calendarBody.appendChild(this.daysContainer);

            this.appendChild(this.launcher);
            this.appendChild(this.calendarBody)
        }
    
        const setText = () => {
            this.daysOfWeek.forEach((d, ix) => d.innerText = dayNames[ix]);
        }

        const applyClasses = () => {
            const f = ([name, cls]) => {
                const elx = this[name];

                if (elx instanceof Array) {
                    elx.forEach(el => el.className = cls);
                } else {
                    elx.className = cls;
                }
            }

            Object.entries(cssClasses).forEach(f);
        }

        const misc = () => {
            this.launcher.tabIndex = 1;
            this.calendarBody.tabIndex = 2;
        }

        create();
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
            this.setAttribute(attributes.opened, 'true');
        } else if (fromOpenedToClosed) {
            this.monthContext = '';
            this.removeAttribute(attributes.opened);
        }
    }

    get opened() {
        return !!this.getAttribute(attributes.opened);
    }

    set value(v) {
        this.setAttribute(attributes.value, v);
        this.refreshDisplay();
    }

    get value() {
        return this.getAttribute(attributes.value);
    }

    set monthContext(v) {
        if (v === '') {
            this.removeAttribute(attributes.monthContext);
        } else {
            this.setAttribute(attributes.monthContext, v);
            this.refreshDisplay();
        }
    }

    get monthContext() {
        return this.getAttribute(attributes.monthContext);
    }
}