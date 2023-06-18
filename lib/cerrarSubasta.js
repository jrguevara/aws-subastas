import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function cerrarSubasta(subasta) {
    const params = {
        TableName: "SubastasTable",
        Key: { id: subasta.id },
        UpdateExpression: 'SET estado = :estado',
        ExpressionAttributeValues: {
            ':estado': 'CERRADA',
        },
    };

    const result = await dynamo.send(new UpdateCommand(params));
    return result;
}