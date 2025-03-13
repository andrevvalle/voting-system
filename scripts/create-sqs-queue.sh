#!/bin/bash

export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy

echo "Criando fila SQS para votos..."
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs create-queue --queue-name votes-queue

echo "Criando fila DLQ..."
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs create-queue --queue-name votes-dlq

echo "Configurando atributos da fila principal..."
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs set-queue-attributes \
    --queue-url http://localhost:4566/000000000000/votes-queue \
    --attributes '{
        "VisibilityTimeout": "30",
        "MessageRetentionPeriod": "86400",
        "ReceiveMessageWaitTimeSeconds": "20"
    }'

echo "Verificando filas SQS..."
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs list-queues