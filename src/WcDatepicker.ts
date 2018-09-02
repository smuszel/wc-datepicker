const cssClasses = {
    launcher: 'launcher',
    callendarBody: 'callendar-body',
    nextMonth: 'next-month',
    previousMonth: 'previous-month',
    save: 'save',
    cancel: 'cancel',
}

export class WcDatepicker extends HTMLElement {

    launcher: HTMLDivElement;
    callendarBody: HTMLDivElement;
    previousMonth: HTMLButtonElement;
    nextMonth: HTMLButtonElement;
    days: HTMLSpanElement[];
    save: HTMLButtonElement;
    cancel: HTMLButtonElement;

    daysOnSigleDisplay = 42;
    clickLog: string[];
    
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['value'];
    }

    attributeChangedCallback(name, oldV, newV) {
        console.log(name, oldV, newV);
    }

    connectedCallback() {
        this.setUpInnerDOM();
        this.addEventListener('click', this.clickDelegate.bind(this));
        // this.addEventListener('focusout', this.resetClickLog.bind(this));
        this.resetClickLog();
    }

    setUpInnerDOM() {
        const createElements = () => {
            this.launcher = document.createElement('div');
            this.callendarBody = document.createElement('div');
            this.previousMonth = document.createElement('button');
            this.nextMonth = document.createElement('button');
            this.save = document.createElement('button');
            this.cancel = document.createElement('button');
            this.days = Array(this.daysOnSigleDisplay).fill(undefined)
                .map(_ => document.createElement('span'));
        }
    
        const append = () => {
            this.appendChild(this.launcher);
    
            this.callendarBody.appendChild(this.previousMonth);
            this.callendarBody.appendChild(this.nextMonth);
            this.days.forEach(d => this.callendarBody.appendChild(d));
            this.callendarBody.appendChild(this.cancel);
            this.callendarBody.appendChild(this.save);
        
            this.appendChild(this.callendarBody)
        }
    
        const setText = () => {
            this.previousMonth.textContent = '<';
            this.nextMonth.textContent = '>';
            this.days.forEach((d, ix) => d.innerText = `${ix}`);
            this.cancel.textContent = 'cancel'
            this.save.textContent = 'save'
        }

        const applyClasses = () => {
            Object.entries(cssClasses).forEach(([propName, cls]) => {
                this[propName].classList.add(cls);
            });

            this.days.forEach((d, ix) => d.classList.add('day', `day-${ix}`));
        }

        const misc = () => {
            this.launcher.tabIndex = 1;
            this.callendarBody.tabIndex = 2;
        }

        createElements();
        applyClasses();
        setText();
        append();
        misc();
    }

    clickDelegate(ev: MouseEvent) {
        //@ts-ignore
        const lst = ev.target.classList;
        switch (lst[0]) {
            case cssClasses.previousMonth:
                return this.clickLog.push(lst[0]);
            case cssClasses.nextMonth:
                return this.clickLog.push(lst[0]);
            case cssClasses.cancel:
                return this.clickLog.push(lst[0]);
            case cssClasses.save:
                return this.clickLog.push(lst[0]);
            case 'day':
                return this.clickLog.push(lst[1]);
            default: return;
        }
    }

    resetClickLog() {
        const prox = new Proxy([], {
            get: (tgt, prop) => {
                return tgt[prop]
            },
            set: (tgt, prop, value) => {
                console.log(tgt, prop, value);
                tgt[prop] = value
                
                return true
            }
        })
        
        this.clickLog = prox;
    }
}
