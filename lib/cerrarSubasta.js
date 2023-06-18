import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SQS } from "@aws-sdk/client-sqs";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sqs = new SQS({ region: "us-east-1" });

export async function cerrarSubasta(subasta) {
    const params = {
        TableName: "SubastasTable",
        Key: { id: subasta.id },
        UpdateExpression: 'SET estado = :estado',
        ExpressionAttributeValues: {
            ':estado': 'CERRADA',
        },
    };

    await dynamo.send(new UpdateCommand(params));

    const { titulo, vendedor, ofertaMayor } = subasta;
    const { cantidad, comprador } = ofertaMayor;

    if( cantidad === 0 ) {
        await sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: "Subasta cerrada - No se ha vendido su item",
                recipient: vendedor,
                body: `Su item ${titulo} no recibio ofertas. Mejor suerte para la proxima!`,
            }),
        });
        return;
    }

    const notificarVendedor = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: "Subasta cerrada - Su item ha sido vendido!!!",
            recipient: vendedor,
            body: `Su item ${titulo} ha sido vendido a ${comprador} por la cantidad de $${cantidad}!`,
        }),
    });

    const notificarComprador = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: "Subasta cerrada - Ha ganado la subasta!!!",
            recipient: comprador,
            body: `En horabuena! has comprado el item ${titulo} por la cantidad de $${cantidad}!`,
        }),
    });

    return Promise.all([notificarVendedor, notificarComprador]);
}