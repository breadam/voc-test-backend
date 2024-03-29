const proto = {
    beforeGetAll(){},
    afterGetAll(){},
    beforeGetOne(){},
    afterGetOne(){},
    beforeGetMany(){},
    afterGetMany(){},
    beforeFindMany(){},
    afterFindMany(){},
    beforeCreate(){},
    afterCreate(){},
    beforeUpdate(){},
    afterUpdate(){},
    beforeDelete(){},
    afterDelete(){},
    custom:{}
}

export default (props) => {
    return Object.assign(Object.create(proto),props);
}