const schema = {
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                titulo: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100,
                },
                descripcion: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 500,
                },
            },
            required: ['titulo', 'descripcion'],
        },
    },
    required: ['body'],
};

export default schema;