'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';
import { OpenHAB2Platform } from '../platform/openHAB2Platform';

export class LightbulbAccessory extends AbstractAccessory {

  setItemBrightnessStateCalled = false;

  setOtherServices() {
    this.otherService = this.getService(this.hapService.Lightbulb, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.On, this.otherService)
      .on('set', this.setItemPowerState.bind(this))
      .on('get', this.getItemPowerState.bind(this))
      .setValue(this.state === 'ON', () => { }, 'init');

    if (this.device.type === 'Color' || this.device.type === 'Dimmer') {

      this.getCharacteristic(this.hapCharacteristic.Brightness, this.otherService)
        .on('set', this.setItemBrightnessState.bind(this))
        .on('get', this.getItemBrightnessState.bind(this))
        .setValue(+this.state, () => { }, 'init');

      this.getCharacteristic(this.hapCharacteristic.Hue, this.otherService)
        .on('set', this.setItemHueState.bind(this))
        .on('get', this.getItemHueState.bind(this))
        .setValue(+this.state, () => { }, 'init');

      this.getCharacteristic(this.hapCharacteristic.Saturation, this.otherService)
        .on('set', this.setItemSaturationState.bind(this))
        .on('get', this.getItemSaturationState.bind(this))
        .setValue(+this.state, () => { }, 'init');

    }

  };

  updateCharacteristics(message: string) {
    let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
    let characteristicsUpdated: [Promise<string>] = [characteristicOnDeferred.promise];

    this.getCharacteristic(this.hapCharacteristic.On, this.otherService)
      .setValue(message === 'ON', () => {
        this.state = message;
        characteristicOnDeferred.resolve(message);
      }, 'remote');

    if (this.device.type === 'Color' || this.device.type === 'Dimmer') {

      this.getCharacteristic(this.hapCharacteristic.Saturation, this.otherService)
        .setValue(+message, () => {
          this.state = message
          characteristicOnDeferred.resolve(message)
        }, 'remote')

      this.getCharacteristic(this.hapCharacteristic.Brightness, this.otherService)
        .setValue(+message, () => {
          this.state = message;
          characteristicOnDeferred.resolve(message)
        }, 'remote')

      this.getCharacteristic(this.hapCharacteristic.Hue, this.otherService)
        .setValue(+message, () => {
          this.state = message;
          characteristicOnDeferred.resolve(message);
        }, 'remote');
      }

    return Promise.all<string>(characteristicsUpdated);
  };

  static isValid(device) {
    return device.tags.indexOf('Lighting') > -1 && ['Switch', 'Color', 'Dimmer'].indexOf(device.type) > -1
  };

  setItemPowerState(value, callback, context) {

    if (value === false) {
      this.updateItemState(value, 'Power', callback, context);
    } else {
      // if setItemBrightnessStateCalled isn't called in 100ms i should call updateItemState
      setTimeout(() => {
        if (!this.setItemBrightnessStateCalled) {
          this.updateItemState(value, 'Power', callback, context);
        } else {
          this.setItemBrightnessStateCalled = false;
          callback();
        }
      }, 100);
    }
  }

  getItemPowerState(callback) {
    this.getItemState()
      .then(state => callback(null, +state.split(',')[2] > 0));
  }

  setItemBrightnessState(value, callback, context) {
    this.brightness = +value
    this.updateItemState(value, 'Brightness', callback, context);
  }

  getItemBrightnessState(callback) {
    this.getItemState()
      .then(state => callback(null, +state.split(',')[2]));
  }

  setItemHueState(value, callback, context) {
    this.hue = +value
    this.updateItemState(value, 'Hue', callback, context);
  }

  getItemHueState(callback) {
    this.getItemState()
      .then(state => callback(null, +state.split(',')[0]));
  }

  setItemSaturationState(value, callback, context) {
    this.saturation = +value
    this.updateItemState(value, 'Saturation', callback, context);
  }

  getItemSaturationState(callback) {
    this.getItemState()
      .then(state => callback(null, +state.split(',')[1]));
  }


  updateItemState(value: string, type: string, callback: Function, context: string) {

    if (context === 'remote' || context === 'init') {
      callback(null);
      return;
    }

    let command = '' + value;
    if (type === 'Power') {
      command = value ? 'ON' : 'OFF';
    } else {
      command = `${this.hue},${this.saturation},${this.brightness}` // TODO Dimmer is still missing
    }

    this.platform.log(`iOS - send message to <${this.name}>: ${command}`);

    this.platform.openHAB2Client.executeDeviceAction(this.name, command)
      .then(() => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}> for type ${type}: completed.`);
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
      })
      .then(() => callback(null));
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

}