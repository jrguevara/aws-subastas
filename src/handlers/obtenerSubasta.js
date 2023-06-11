import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "../../lib/commonMiddleware";
import createError from "http-errors";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function obtenerSubastaPorId(id) {
    let subasta;
    try {
        const result = await dynamo.send(new GetCommand({
            TableName: "SubastasTable",
            Key: { id }
        }));

        subasta = result.Item;
    }
    catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    if (!subasta) {
        throw new createError.NotFound(`Subasta con id: ${id} no encontrada.`);
    }

    return subasta;
}

const obtenerSubasta = async (event, context) => {
    const { id } = event.pathParameters;
    const subasta = await obtenerSubastaPorId(id);

    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };
    
    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(subasta),
    };
};

export const handler = commonMiddleware(obtenerSubasta);