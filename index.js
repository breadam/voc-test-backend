import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';

import api from './api.js'

const app = new Koa();

app.use(cors());
app.use(koaBody());
app.use(api.routes());
app.listen(3000);