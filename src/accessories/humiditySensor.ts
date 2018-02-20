'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
//import { platform } from 'os';

export class HumiditySensor extends AbstractAccessory {

    setOtherServices() {

        this.otherService = this.getService(this.hapService.HumiditySensor, this.displayName);
        
        this.getCharacteristic(this.hapCharacteristic.CurrentRelativeHumidity, this.otherService)
            .setValue(+this.state, () => { }, 'init');

    };

    static isValid(device) {

        var result = false

        if (device.tags.indexOf('CurrentHumidity') > -1) {
            result = ['Number'].indexOf(device.type) > -1
        }
        
        return result 

    };

}