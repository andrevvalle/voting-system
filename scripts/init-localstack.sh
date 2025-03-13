#!/bin/bash

echo "Iniciando setup do LocalStack..."

echo "Aguardando LocalStack ficar pronto..."
sleep 20

export AWS_ACCESS_KEY_ID=localstack
export AWS_SECRET_ACCESS_KEY=localstack
export AWS_DEFAULT_REGION=us-east-1

LOCALSTACK_URL="http://localhost:4566"

echo "Criando fila SQS para votos..."
aws --endpoint-url=${LOCALSTACK_URL} sqs create-queue --queue-name votes-queue

echo "Criando fila DLQ..."
aws --endpoint-url=${LOCALSTACK_URL} sqs create-queue --queue-name votes-dlq

aws --endpoint-url=${LOCALSTACK_URL} sqs set-queue-attributes \
    --queue-url ${LOCALSTACK_URL}/000000000000/votes-queue \
    --attributes '{
        "VisibilityTimeout": "30",
        "MessageRetentionPeriod": "86400",
        "ReceiveMessageWaitTimeSeconds": "20"
    }'

echo "Verificando filas SQS..."
aws --endpoint-url=${LOCALSTACK_URL} sqs list-queues

echo "LocalStack configurado com sucesso!"