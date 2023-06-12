import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "../../lib/commonMiddleware";
import validator from "@middy/validator";
import { transpileSchema } from '@middy/validator/transpile';
import createError from "http-errors";
import { obtenerSubastaPorId } from "./obtenerSubasta";
import hacerOfertaSchema from "../../lib/schemas/hacerOfertaSchema";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const hacerOferta = async (event, context) => {
    let subastaActualizada;
    const { id } = event.pathParameters;
    const { cantidad } = event.body;
    const { email } = event.requestContext.authorizer;

    const subasta = await obtenerSubastaPorId(id);

    // Validacion de identidad de usuario
    if (subasta.vendedor === email) {
        throw new createError.Forbidden(`No puedes hacer una oferta en tu propia subasta.`);
    };

    //Validacion para evitar doble oferta
    if (subasta.ofertaMayor.comprador === email) {
        throw new createError.Forbidden(`Ya has hecho una oferta en esta subasta.`);
    };

    // Validacion de estado de subasta
    if (subasta.estado !== 'ABIERTA') {
        throw new createError.Forbidden(`La subasta con id: ${id} no está abierta.`);
    };

    // Validacion de cantidad de oferta
    if (cantidad <= subasta.ofertaMayor.cantidad ) {
        throw new createError.Forbidden(`La oferta debe ser mayor a la oferta actual de $${subasta.ofertaMayor.cantidad}.`);
    };

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    try {
        const result = await dynamo.send(new UpdateCommand({
            TableName: "SubastasTable",
            Key: { id },
            UpdateExpression: 'SET ofertaMayor.cantidad = :cantidad, ofertaMayor.comprador = :comprador',
            ExpressionAttributeValues: {
                ':cantidad': cantidad,
                ':comprador': email,
            },
            ReturnValues: 'ALL_NEW'
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

export const handler = commonMiddleware(hacerOferta).use(
    validator({
        eventSchema: transpileSchema(hacerOfertaSchema),
    })
);