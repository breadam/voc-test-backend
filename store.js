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

    static getAll(resource){
        const json = this.loadResource(resource);
        return json;
    }

    static getPage(resource,pageId,pageSize){
        const json = this.loadResource(resource);
        const startIndex = (pageId - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return json.slice(startIndex,endIndex);
    }

    static getOne(resource,id){
        const json = this.loadResource(resource);
        return json.find((item) => item.id === id);
    }

    static getMany(resource,ids){
        const json = this.loadResource(resource);
        return ids.map((id) => json.find((item) => item.id === id));
    }

    static find(resource,search){
        return this.getAll(resource);
    }

    static createOne(resource,data){
        const json = this.loadResource(resource);
        data.id = json.length;
        json.push(data);
        this.saveResource(resource,json);
        return data;
    }

    static updateOne(resource,id,data){
        const json = this.loadResource(resource);
        const item = json.find((item) => item.id === id);

        for(let key in data){
            item[key] = data[key];
        }

        this.saveResource(resource,json);
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
}
