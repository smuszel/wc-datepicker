import { Component, Prop } from '@stencil/core';

@Component({
    tag: 'wc-datepicker',
    styleUrl: 'wc-datepicker.scss',
    shadow: true
})
export class WcDatepicker {
    
    @Prop() first: string;
    @Prop() last: string;
    
    render() {
        return (
            <div>
                Hello, World! I'm {this.first} {this.last}
            </div>
        );
    }
}
