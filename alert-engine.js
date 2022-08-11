function compareTrigger(comparatorId,reading,value){
    switch(comparatorId){
        case '1':
            return reading > value; 
        case '2':
            return reading >= value;
        case '3':
            return reading < value;
        case '4':
            return reading <= value;
        case '5':
            return reading == value;
    }
}

function compareSensors(sensorId,comparatorId,reading,value){
    switch(sensorId){
        case '1':
            return compareTrigger(comparatorId,reading.temperature,value);
        case '2':
            return compareTrigger(comparatorId,reading.humidity,value);
        case '3':
            return compareTrigger(comparatorId,reading.iaq,value);
    }
}

function checkTriggers(triggerIds,reading){

    return triggerIds.filter(({sensorId,comparatorId,value}) => compareSensors(sensorId,comparatorId,reading,value));
}

function isTargetDevice(rule,device){

    if(rule.deviceIds.includes(device.id)){
        return true;
    }

    if(rule.placeIds.includes(device.placeId)){
        return true;
    }

    const commonTags = device.tagIds.filter(tagId => rule.tagIds.includes(tagId));

    if(commonTags.length >= 1){
        return true;
    }

    return false;
}

export {
    isTargetDevice,
    checkTriggers
};