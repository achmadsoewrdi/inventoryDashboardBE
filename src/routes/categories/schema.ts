export const getCategoriesSchema ={
    response: {
        200:{
            type: 'array',
            items:{
                type: 'object',
                properties:{
                    id : {type: 'number'},
                    name: {type:'string'},
                    subCategory: {type:'string'},
                    createdAt: {type: 'string'},
                    updatedAt: {type:'string'}
                }
            }
        }
    }
}