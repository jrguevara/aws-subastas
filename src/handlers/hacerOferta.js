import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "../../lib/commonMiddleware";
import createError from "http-errors";
import { obtenerSubastaPorId } from "./obtenerSubasta";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const hacerOferta = async (event, context) => {

    let subastaActualizada;
    const { id } = event.pathParameters;
    const { cantidad } = event.body;

    const subasta = await obtenerSubastaPorId(id);

    if (subasta.status !== 'ABIERTA') {
        throw new createError.Forbidden(`La subasta con id: ${id} no está abierta.`);
    };

    if (cantidad <= subasta.ofertaMayor.cantidad) {
        throw new createError.Forbidden(`La oferta debe ser mayor a la oferta actual de $${subasta.ofertaMayor.cantidad}`);
    };

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    try {
        const result = await dynamo.send(new UpdateCommand({
            TableName: "SubastasTable",
            Key: { id },
            UpdateExpression: "SET ofertaMayor.cantidad = :cantidad",
            ExpressionAttributeValues: {
                ":cantidad": cantidad,
            },
            ReturnValues: "ALL_NEW",
        }));

        subastaActualizada = result.Attributes;
    }
    catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(subastaActualizada),
    };
};

export const handler = commonMiddleware(hacerOferta);