const AWS = require('aws-sdk');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const SQS_QUEUE_URL = process.env.SQS_VOTE_QUEUE_URL || 'http://localstack:4566/000000000000/votes-queue';
const BATCH_SIZE = 10;
const WAIT_TIME_SECONDS = 20;
const VISIBILITY_TIMEOUT = 30;

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'localstack',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'localstack'
};

if (process.env.NODE_ENV === 'development') {
  awsConfig.endpoint = process.env.SQS_ENDPOINT || 'http://localstack:4566';
}

const sqs = new AWS.SQS(awsConfig);

const sequelize = new Sequelize({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'voting',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  participantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  pollId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'votes'
});

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

async function processMessages() {
  try {
    console.log('Buscando mensagens da fila...');

    const receiveParams = {
      QueueUrl: SQS_QUEUE_URL,
      MaxNumberOfMessages: BATCH_SIZE,
      WaitTimeSeconds: WAIT_TIME_SECONDS,
      VisibilityTimeout: VISIBILITY_TIMEOUT
    };

    const data = await sqs.receiveMessage(receiveParams).promise();

    if (!data.Messages || data.Messages.length === 0) {
      console.log('Nenhuma mensagem encontrada');
      return 0;
    }

    console.log(`Recebidas ${data.Messages.length} mensagens.`);
    
    for (const message of data.Messages) {
      try {
        if (!message.Body || !message.ReceiptHandle) {
          console.warn('Mensagem inválida recebida, pulando...');
          continue;
        }

        const voteData = JSON.parse(message.Body);
        
        if (!voteData.userId || !voteData.participantId || !voteData.pollId) {
          console.warn('Dados de voto inválidos:', voteData);
          await deleteMessage(message.ReceiptHandle);
          continue;
        }

        await Vote.create({
          userId: voteData.userId,
          participantId: voteData.participantId,
          pollId: voteData.pollId,
          createdAt: voteData.timestamp ? new Date(voteData.timestamp) : new Date()
        });

        await deleteMessage(message.ReceiptHandle);
        
        console.log(`Voto processado: ${voteData.userId} -> ${voteData.participantId}`);
      } catch (error) {
        console.error('Erro ao processar mensagem individual:', error);
      }
    }

    return data.Messages.length;
  } catch (error) {
    console.error('Erro ao processar mensagens:', error);
    return 0;
  }
}

async function deleteMessage(receiptHandle) {
  const deleteParams = {
    QueueUrl: SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle
  };
  
  await sqs.deleteMessage(deleteParams).promise();
}

async function run() {
  console.log('Iniciando worker de processamento de votos...');
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`SQS Queue URL: ${SQS_QUEUE_URL}`);
  
  const dbInitialized = await initDatabase();
  
  if (!dbInitialized) {
    console.error('Falha ao inicializar banco de dados. Worker será encerrado.');
    process.exit(1);
  }
  
  while (true) {
    try {
      await processMessages();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Erro no ciclo de processamento:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

run().catch(error => {
  console.error('Erro fatal no worker:', error);
  process.exit(1);
});