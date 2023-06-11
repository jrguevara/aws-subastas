const schema = {
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                cantidad: {
                    type: 'number',
                },
            },
            required: ['cantidad'],
        },
    },
    required: ['body'],
};

export default schema;