'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
//import { platform } from 'os';

export class ThermostatAccessory extends AbstractAccessory {

/**

Service.Thermostat = function(displayName, subtype) {
  Service.call(this, displayName, '0000004A-0000-1000-8000-0026BB765291', subtype);

  // Required Characteristics
  
  this.addCharacteristic(Characteristic.TemperatureDisplayUnits);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.CurrentRelativeHumidity);
  this.addOptionalCharacteristic(Characteristic.TargetRelativeHumidity);
  this.addOptionalCharacteristic(Characteristic.CoolingThresholdTemperature);
  this.addOptionalCharacteristic(Characteristic.HeatingThresholdTemperature);
  this.addOptionalCharacteristic(Characteristic.Name);
};

 */

    itemCurrentTemperature: OpenHAB2DeviceInterface
    itemTargetTemperature: OpenHAB2DeviceInterface
    itemHeatingCoolingMode: OpenHAB2DeviceInterface

    setOtherServices() {

        this.otherService = this.getService(this.hapService.Thermostat, this.displayName);

        this.platform.openHAB2Client.getDevice(this.device.name)
            .then((device) => {

                for ( let member of device.members ) {

                    if (member.tags.indexOf('CurrentTemperature') > -1) {
                        this.itemCurrentTemperature = member
                    } else if (member.tags.indexOf('TargetTemperature') > -1) {
                        this.itemTargetTemperature = member
                    } else if (member.tags.indexOf('homekit:HeatingCoolingMode') > -1) {
                        this.itemHeatingCoolingMode = member
                    }
                
                }

                this.getCharacteristic(this.hapCharacteristic.CurrentTemperature, this.otherService)
                    //.on('set', this.setCurrentTemperature.bind(this))
                    //.on('get', this.getCurrentTemperature.bind(this))
                    .setValue(+this.itemCurrentTemperature.state, () => { }, 'init');

                this.getCharacteristic(this.hapCharacteristic.TargetTemperature, this.otherService)
                    .on('set', this.setTargetTemperatureState.bind(this))
                    //.on('get', this.getTargetTemperatureState.bind(this))
                    .setValue(+this.itemTargetTemperature.state, () => { }, 'init');

                this.getCharacteristic(this.hapCharacteristic.TargetHeatingCoolingState, this.otherService)
                    .on('set', this.setTargetHeaterCoolerState.bind(this))
                    // .on('get', this.getTargetHeaterCoolerState.bind(this))
                    .setValue(3, () => { }, 'init'); // FIXED TO AUTO FOR NOW
                                    
                this.getCharacteristic(this.hapCharacteristic.CurrentHeatingCoolingState, this.otherService)
                    .setValue(3, () => {}, 'init')

                this.getCharacteristic(this.hapCharacteristic.TemperatureDisplayUnits, this.otherService)
                    .setValue(0, () => {}, 'init');
            })
            .catch((err) => {
                //this.log('Error getting data from openHAB2: ', err);
            });

    };

    static isValid(device) {

        var result = false

        if (device.tags.indexOf('Thermostat') > -1) {
            result = ['Group'].indexOf(device.type) > -1
        }
        
        return result 

    };

    setTargetHeaterCoolerState(value, callback, context) {
        this.platform.log(`Set Target HeaterCoolerState. Value: ${value} Context: ${context}`)

        if (context === 'remote' || context === 'init') {
            callback(null);
            return;
        }

    }

    setTargetTemperatureState(value, callback, context) {

        this.platform.log(`Set Target Temperature. Value: ${value} Context: ${context}`)

        if (context === 'remote' || context === 'init') {
            callback(null);
            return;
        }

        let command = '' + value;
        let target = this.itemTargetTemperature.name;

        this.platform.log(`iOS - send message to <${target}>: ${command}`);

        this.platform.openHAB2Client.executeUpdateState(target, value)
            .then(() => {
                this.platform.log(`OpenHAB2 HTTP - response from <${target}> for item ${target}: completed.`);
            })
            .catch((err) => {
                this.platform.log(`OpenHAB2 HTTP - error from <${target}>:`, err);
            })
            .then(() => callback(null));

    }
    
}