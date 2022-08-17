import Router from 'koa-router';

const router = new Router({
	prefix: ''
});

router.get('/deviceRom/update',async (ctx,next) => {
	const Store = ctx.store;
	const {uuid,romVersion} = ctx.query;

	const device = await Store.findOne('devices',{code:uuid});

	if(!device){
		ctx.body = "none";
		return next();
	}

	const rom = await Store.getOne('roms',device.romId);

	if(romVersion === rom.name){
		ctx.body = 'none';
	}else if(rom.url){
		ctx.body = rom.url;
	}else{
		ctx.body = 'none';
	}

	return next();
});

router.get('/calibration/calibration',async(ctx,next) => {

	// deactivate calibration after query 
	const Store = ctx.store;
	const {uuid,temp,hum,iaq} = ctx.query;
	
	const device = await Store.findOne('devices',{code:uuid});
	
	if(!device){
		ctx.body = 'none';
		return next();
	}

	if(!device.calibrationId){
		ctx.body = 'none';
		return next();
	}

	const calibration = await Store.getOne('calibration',device.calibrationId);

	if(!calibration){
		ctx.body = 'none';
		return next();
	}

	await Store.updateOne('devices',device.id,{
		calibrationId:null
	});


	const cTemperature = calibration.temperature;
	const cHumidity = calibration.humidity;
	const cIaq = calibration.iaq;

	let ret = '';
	
	if(temp && cTemperature !== temp){
		const deltaTemperature = cTemperature - temp;
		ret += deltaTemperature;
	}

	if(hum && cHumidity !== hum){
		const deltaHumidity = cHumidity - hum;
		ret += '#' + deltaHumidity;
	}

	if(iaq && cIaq !== iaq){
		const deltaIaq = cIaq - iaq;
		ret += '#' + deltaIaq;
	}

	if(!ret){
		ctx.body = 'none';
	}else{
		ctx.body = ret;
	}
	next();
});


export default router;