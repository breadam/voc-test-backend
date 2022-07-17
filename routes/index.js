import Router from 'koa-router';

const router = new Router({
	prefix: '/'
});

router.get('/',(ctx,next) => {
    ctx.redirect('/api');
    next();
});

export default router;