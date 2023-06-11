import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import validator from "@middy/validator";
import { transpileSchema } from '@middy/validator/transpile';
import commonMiddleware from "../../lib/commonMiddleware";
import listarSubastasSchema from "../../lib/schemas/listarSubastasSchema";
import createError from "http-errors";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const listarSubastas = async (event, context) => {
  try {
    const { estado } = event.queryStringParameters;
    let subastas;

    const params = {
      TableName: "SubastasTable",
      IndexName: "estadoFechaFinIndex",
      KeyConditionExpression: 'estado = :estado',
      ExpressionAttributeValues: {
        ':estado': estado,
      },
    };

    const result = await dynamo.send(new QueryCommand(params));

    subastas = result.Items;

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    };

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(subastas),
    };
  }
  catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(listarSubastas).use(
  validator({
      eventSchema : transpileSchema(listarSubastasSchema),
      ajvOptions: {
          useDefaults: true,
          strict: false,
      },
  })
);
