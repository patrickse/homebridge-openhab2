'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';


//import { platform } from 'os';

export class TemperatureSensor extends AbstractAccessory {

    setOtherServices() {

        this.otherService = this.getService(this.hapService.TemperatureSensor, this.displayName);

        this.getCharacteristic(this.hapCharacteristic.CurrentTemperature, this.otherService)
            .setProps({
            format: this.hapCharacteristic.Formats.FLOAT,
            unit: this.hapCharacteristic.Units.CELSIUS,
            maxValue: 100,
            minValue: -100,
            minStep: 0.1,
            perms: [this.hapCharacteristic.Perms.READ, this.hapCharacteristic.Perms.NOTIFY]
            })
            .setValue(Number(this.state), () => { }, 'init');

    };

    static isValid(device) {

        var result = false

        if (device.tags.indexOf('CurrentTemperature') > -1) {
            result = ['Number'].indexOf(device.type) > -1
        }
        
        return result 

    };

    getCurrentTemperature(callback) {
        this.platform.log(`iOS - request power state from <${this.name}>`);
    
        this.getItemState()
          .then(state => callback(null, Number(state)));
      };
    

    getItemState() {
        return this.platform.openHAB2Client.getDeviceProperties(this.name)
          .then((device: OpenHAB2DeviceInterface) => {
            this.platform.log(`OpenHAB2 HTTP - response from <${this.name}>: ${device.state}`);
            return device.state;
          })
          .catch((err) => {
            this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
            return Promise.reject(err);
          });
      };

      updateCharacteristics(message: string) {

        let characteristicTemperatureDeferred: Deferred<string> = new Deferred<string>();
        let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
        let characteristicsUpdated : [Promise<string>,Promise<string>] = [characteristicTemperatureDeferred.promise, characteristicOnDeferred.promise];
  
        this.platform.log(`OpenHAB2 SSE - message from <${this.name}>: ${message}`);
  
        const temperature = Number(message);
  
        this.getCharacteristic(this.hapCharacteristic.CurrentTemperature, this.otherService)
          .setValue(temperature, () => {
            this.state = message;
            characteristicTemperatureDeferred.resolve(message);
          }, 'remote');
  
          /**
        this.getCharacteristic(this.hapCharacteristic.On, this.otherService)
          .setValue(brightness > 0, () => {
            this.state = message;
            characteristicOnDeferred.resolve(message);
          }, 'remote');
   */
        return Promise.all<string, string>(characteristicsUpdated);
    };

}