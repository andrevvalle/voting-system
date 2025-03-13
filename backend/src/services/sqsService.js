const AWS = require('aws-sdk');

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'localstack',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'localstack'
};

if (process.env.NODE_ENV !== 'production') {
  awsConfig.endpoint = process.env.SQS_ENDPOINT || 'http://localstack:4566';
}

const sqs = new AWS.SQS(awsConfig);
const queueUrl = process.env.SQS_VOTE_QUEUE_URL || 'http://localstack:4566/000000000000/votes-queue';

async function sendMessage(messageBody) {
  try {
    await ensureQueueExists();
    
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
      DelaySeconds: 0
    };

    const result = await sqs.sendMessage(params).promise();
    console.log(`Mensagem enviada para SQS: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error('Erro ao enviar mensagem para SQS:', error);
    throw error;
  }
}

async function ensureQueueExists() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const params = {
        QueueUrl: queueUrl,
        AttributeNames: ['QueueArn']
      };
      await sqs.getQueueAttributes(params).promise();
    } catch (queueError) {
      if (queueError.code === 'AWS.SimpleQueueService.NonExistentQueue') {
        console.log('Fila não encontrada, criando fila...');
        const createParams = {
          QueueName: 'votes-queue',
          Attributes: {
            DelaySeconds: '0',
            MessageRetentionPeriod: '86400'
          }
        };
        await sqs.createQueue(createParams).promise();
        console.log('Fila criada com sucesso');
      } else {
        throw queueError;
      }
    }
  }
}

async function healthCheck() {
  try {
    await ensureQueueExists();
    
    const params = {
      QueueUrl: queueUrl,
      AttributeNames: ['QueueArn']
    };
    await sqs.getQueueAttributes(params).promise();
    return true;
  } catch (error) {
    console.error('Erro no health check do SQS:', error);
    return false;
  }
}

module.exports = {
  sqs,
  sendMessage,
  healthCheck,
  queueUrl
};