import {connect} from 'mqtt'

const client = connect('mqtt://176.236.189.247:1881',{
    username:'Sttvoc',
    password:'voc956'
});
client.on('connect', function () {    
    client.subscribe('Send', function (err) {});
    client.subscribe('Status', function (err) {});
});
client.on('message', function (topic, message) {
    if(topic === 'Send'){
        const fields = message.toString().split('#');
        console.log(fields);
    }else{

    }
});
client.on('error',function(err){
    console.log(err);
});