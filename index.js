import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';

import index from './routes/index.js'
import api from './routes/api.js'

const app = new Koa();

app.use(cors());
app.use(koaBody());
app.use(index.routes());
app.use(api.routes());

app.listen(process.env.PORT || 3000);