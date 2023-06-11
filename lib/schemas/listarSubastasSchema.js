const schema = {
    type: 'object',
    properties: {
        queryStringParameters: {
            type: 'object',
            properties: {
                estado: {
                    type: 'string',
                    enum: ['ABIERTA', 'CERRADA'],
                    default: 'ABIERTA',
                },
            },
        },
    },
    required: ['queryStringParameters'],
};

export default schema;