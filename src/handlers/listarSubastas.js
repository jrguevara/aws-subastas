import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "../../lib/commonMiddleware";
import createError from "http-errors";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const listarSubastas = async (event, context) => {
  try {
    let subastas;

    const result = await dynamo.send(new ScanCommand({
      TableName: "SubastasTable",
    }));

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

export const handler = commonMiddleware(listarSubastas);