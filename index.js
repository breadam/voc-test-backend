import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import json from 'koa-json';

import index from './routes/index.js'
import api from './routes/api.js'

import extractHeaders from './middlewares/extract-headers.js';

import mqtt from './mqtt.js';
import checkStatus from './check-status.js';
import MongoDB from './mongodb.js';

(async() => {

    await MongoDB.setup();

    const app = new Koa();

    app.use(function(ctx,next){
        ctx.store = MongoDB;
        return next();
    });

    app.use(cors());
    app.use(koaBody());
    app.use(json());
    app.use(extractHeaders);
    app.use(index.routes());
    app.use(api.routes());

    app.listen(process.env.PORT || 3000);

    console.log('Start MQTT');

    mqtt({
        url: 'mqtt://176.236.189.247:1881',
        username: 'Sttvoc',
        password: 'voc956',
    },MongoDB);
    
    console.log('Start Status Check');

    const runStatusCheck = checkStatus(MongoDB);

    runStatusCheck();
})();