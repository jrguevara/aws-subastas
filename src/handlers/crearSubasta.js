import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import validator from "@middy/validator";
import { transpileSchema } from '@middy/validator/transpile';
import commonMiddleware from "../../lib/commonMiddleware";
import crearSubastaSchema from "../../lib/schemas/crearSubastaSchema";
import createError from "http-errors";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const crearSubasta = async (event, context) => {
  try {
    const subasta = event.body;
    const { email } = event.requestContext.authorizer;
    const now = new Date();
    const fechaFin = new Date();
    fechaFin.setHours(now.getHours() + 1);

    const newSubasta = {
      ...subasta,
      estado: "ABIERTA",
      id: uuid(),
      fechaInicio: now.toISOString(),
      fechaFin: fechaFin.toISOString(),
      ofertaMayor: {
        cantidad: 0,
      },
      vendedor: email,
    };

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    };

    await dynamo.send(new PutCommand({
      TableName: "SubastasTable",
      Item: newSubasta,
    }));

    return {
      statusCode: 201,
      headers: headers,
      body: JSON.stringify(newSubasta),
    };
  }
  catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(crearSubasta).use(
  validator({
      eventSchema: transpileSchema(crearSubastaSchema),
  })
);