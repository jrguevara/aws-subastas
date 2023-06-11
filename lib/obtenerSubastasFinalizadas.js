import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function obtenerSubastasFinalizadas() {
    const now = new Date();
    console.log(now.toISOString());
    const params = {
        TableName: "SubastasTable",
        IndexName: "estadoFechaFinIndex",
        KeyConditionExpression: 'estado = :estado AND fechaFin <= :now',
        ExpressionAttributeValues: {
            ':estado': 'ABIERTA',
            ':now': now.toISOString(),
        },
    };

    const result = await dynamo.send(new QueryCommand(params));
    return result.Items;
};