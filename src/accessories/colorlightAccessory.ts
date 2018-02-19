'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
//import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
//import { Deferred } from 'ts-deferred';

export class ColorlightAccessory extends AbstractAccessory {

    /**
  setOtherServices() {
    this.otherService = this.getService(this.hapService.Lightbulb, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.On, this.otherService)
      .on('set', this.setItemPowerState.bind(this))
      .on('get', this.getItemPowerState.bind(this))
      .setValue(this.state === 'ON', () => {}, 'init');
  };
 */

    setOtherServices() {
        this.otherService = this.getService(this.hapService.ColorlightAccessory, this.displayName);

        this.getCharacteristic(this.hapCharacteristic.Color, this.otherService)
            .on('set', this.setItemColorState.bind(this))
            .on('get', this.getItemColorState.bind(this));
            
    }

    /**
    updateCharacteristics(message: string) {
        let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
        let characteristicsUpdated : [Promise<string>] = [characteristicOnDeferred.promise];

        this.getCharacteristic(this.hapCharacteristic.On, this.otherService)
            .setValue(message === 'ON', () => {
            this.state = message;
            characteristicOnDeferred.resolve(message);
            }, 'remote');

        return Promise.all<string>(characteristicsUpdated);
        };
 */
  static isValid(device) {
    return device.tags.indexOf('Lighting') > -1 && ['Color', 'Dimmer'].indexOf(device.type) > -1
  }

  setItemColorState(callback) {
    this.platform.log(`iOS - send color state of <${this.name}>`);

  }

  getItemColorState(callback) {
    this.platform.log(`iOS - request color state from <${this.name}>`);

  }

}