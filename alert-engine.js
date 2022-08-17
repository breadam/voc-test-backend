function compareTrigger(comparatorCode,reading,value){
    switch(comparatorCode){
        case 'gt':
            return reading > value; 
        case 'gte':
            return reading >= value;
        case 'lt':
            return reading < value;
        case 'lte':
            return reading <= value;
        case 'eq':
            return reading == value;
    }
}

function compareSensors(sensorCode,comparatorCode,reading,value){
    switch(sensorCode){
        case 'temperature':
            return compareTrigger(comparatorCode,reading.temperature,value);
        case 'humidity':
            return compareTrigger(comparatorCode,reading.humidity,value);
        case 'iaq':
            return compareTrigger(comparatorCode,reading.iaq,value);
    }
}

function checkTriggers(triggers,reading){
    return triggers.filter(({sensor,comparator,value}) => compareSensors(sensor.code,comparator.code,reading,value));
}

function isTargetDevice(rule,device){

    if(rule.deviceIds.find(id => id.equals(device.id))){
        return true;
    }

    if(rule.placeIds.find(id => id.equals(device.id))){
        return true;
    }

    const commonTags = device.tagIds.filter(tagId => rule.tagIds.find(id => id.equals(tagId)));

    if(commonTags.length >= 1){
        return true;
    }

    return false;
}

export {
    isTargetDevice,
    checkTriggers
};