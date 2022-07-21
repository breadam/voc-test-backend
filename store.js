import {readFileSync,writeFileSync,readdirSync} from 'fs';
import {join} from 'path';


export default class Store{

    static DIR = './db';

    static getResourceList(){
        const files = readdirSync(this.DIR);
        const list = files.map((file) => file.replace('.json',''));
        return list;
    }

    static getResourceFile(resource){
        return join(this.DIR,resource + '.json');
    }

    static loadResource(resource){
        const file = readFileSync(this.getResourceFile(resource));
        return JSON.parse(file);
    }

    static saveResource(resource,json){
        writeFileSync(this.getResourceFile(resource),JSON.stringify(json));
    }

    static getAll(resource,pageId,pageSize){
        const json = this.loadResource(resource);
        return this._getPage(json,pageId,pageSize);
    }

    static getOne(resource,id){
        const json = this.loadResource(resource);
        return json.find((item) => item.id === id);
    }

    static getMany(resource,ids){
        const json = this.loadResource(resource);
        return ids.split(',').map((id) => json.find((item) => item.id === id));
    }

    static findOne(resource,params){
        const items = this.getAll(resource);
        
        return items.find((item) => {
            for(let key in params){
                if(item[key] !== params[key]){
                    return false;
                }
            }
            return true;
        });
    }

    static findMany(resource,params,pageId,pageSize){
        const items = this.getAll(resource);
        
        const ret = items.filter((item) => {
            for(let key in params){
                if(item[key] !== params[key]){
                    return false;
                }
            }
            return true;
        });
        return this._getPage(ret,pageId,pageSize);
    }

    static createOne(resource,data){
        const json = this.loadResource(resource);
        data.id = json.length.toString();
        json.push(data);
        this.saveResource(resource,json);
        return data;
    }

    static updateOne(resource,id,data){
        const json = this.loadResource(resource);
        const item = json.find((item) => item.id === id);

        if(!item){
            return;
        }

        for(let key in data){
            item[key] = data[key];
        }

        this.saveResource(resource,json);

        return data;
    }

    static saveOne(resource,data){
        if(!data.id){
            return this.createOne(resource,data);
        }

        this.updateOne(resource,data.id,data);
    }

    static deleteOne(resource,id){
        const json = this.loadResource(resource);
        const index = json.findIndex((item) => item.id === id);

        if(index !== -1){
            return;
        }

        const item = json.splice(index,1);
        this.saveResource(resource,json);
        return item;
    }

    static parseSearch(query){
        const params = {};
        query.split(',').forEach((q) => {
			const s = q.split(':');
			params[s[0]] = s[1];
		});
        return params;
    }

    static _getPage(list,pageId,pageSize){
        
        if(!pageSize){
            return list;
        }

        const startIndex = (pageId - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return list.slice(startIndex,endIndex);
    }
}
