'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
//import { platform } from 'os';

export class TemperatureSensor extends AbstractAccessory {

    setOtherServices() {

        this.otherService = this.getService(this.hapService.TemperatureSensor, this.displayName);

        this.getCharacteristic(this.hapCharacteristic.CurrentTemperature, this.otherService)
        //.on('set', this.setItemPowerState.bind(this))
        //.on('get', this.getItemPowerState.bind(this))
            .setValue(+this.state, () => { }, 'init');

    };

    static isValid(device) {

        var result = false

        if (device.tags.indexOf('CurrentTemperature') > -1) {
            result = ['Number'].indexOf(device.type) > -1
        }
        
        return result 

    };

}