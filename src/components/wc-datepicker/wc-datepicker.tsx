import { Component, Prop } from '@stencil/core';

@Component({
    tag: 'wc-datepicker',
    styleUrl: 'wc-datepicker.scss',
    shadow: true
})
export class WcDatepicker {
    
    @Prop({ reflectToAttr: true, mutable: true })
    value: string = new Date().toISOString();
    
    render() {
        return (
            <div>
                Abc {this.value}
            </div>
        );
    }
}
