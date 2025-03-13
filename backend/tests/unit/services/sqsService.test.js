const AWS = require('aws-sdk');
const sqsService = require('../../../src/services/sqsService');

jest.mock('aws-sdk', () => {
  const mockSendMessage = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({ MessageId: 'mock-message-id' })
  });
  
  const mockGetQueueAttributes = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Attributes: { QueueArn: 'arn:aws:sqs:us-east-1:000000000000:votes-queue' }
    })
  });
  
  const mockCreateQueue = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({ QueueUrl: 'http://localstack:4566/000000000000/votes-queue' })
  });
  
  return {
    SQS: jest.fn().mockImplementation(() => ({
      sendMessage: mockSendMessage,
      getQueueAttributes: mockGetQueueAttributes,
      createQueue: mockCreateQueue
    }))
  };
});

describe('SQS Service', () => {
  let sqsMock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    sqsMock = sqsService.sqs;
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('deve enviar mensagem para a fila SQS', async () => {
    const messageBody = {
      userId: 'user123',
      participantId: 'participant123',
      pollId: 'poll123',
      timestamp: '2023-03-09T12:34:56.789Z'
    };
    
    await sqsService.sendMessage(messageBody);
    
    expect(sqsMock.sendMessage).toHaveBeenCalledWith({
      QueueUrl: sqsService.queueUrl,
      MessageBody: JSON.stringify(messageBody),
      DelaySeconds: 0
    });
  });
  
  it('deve verificar se a fila existe antes de enviar a mensagem', async () => {
    const messageBody = { userId: 'user123' };
    
    await sqsService.sendMessage(messageBody);
    
    expect(sqsMock.getQueueAttributes).toHaveBeenCalledWith({
      QueueUrl: sqsService.queueUrl,
      AttributeNames: ['QueueArn']
    });
    
    expect(sqsMock.createQueue).not.toHaveBeenCalled();
  });
  
  it('deve criar a fila se ela não existir', async () => {
    sqsMock.getQueueAttributes.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue({
        code: 'AWS.SimpleQueueService.NonExistentQueue'
      })
    });
    
    const messageBody = { userId: 'user123' };
    
    await sqsService.sendMessage(messageBody);
    
    expect(sqsMock.createQueue).toHaveBeenCalledWith({
      QueueName: 'votes-queue',
      Attributes: {
        DelaySeconds: '0',
        MessageRetentionPeriod: '86400'
      }
    });
    
    expect(sqsMock.sendMessage).toHaveBeenCalledWith({
      QueueUrl: sqsService.queueUrl,
      MessageBody: JSON.stringify(messageBody),
      DelaySeconds: 0
    });
  });
  
  it('deve propagar erros diferentes de fila não existente', async () => {
    const connectionError = new Error('Connection failed');
    connectionError.code = 'NetworkingError';
    
    sqsMock.getQueueAttributes.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(connectionError)
    });
    
    const messageBody = { userId: 'user123' };
    
    await expect(sqsService.sendMessage(messageBody)).rejects.toThrow('Connection failed');
    
    expect(sqsMock.createQueue).not.toHaveBeenCalled();
    
    expect(sqsMock.sendMessage).not.toHaveBeenCalled();
  });
  
  it('deve realizar health check com sucesso', async () => {
    const result = await sqsService.healthCheck();
    
    expect(result).toBe(true);
    
    expect(sqsMock.getQueueAttributes).toHaveBeenCalledWith({
      QueueUrl: sqsService.queueUrl,
      AttributeNames: ['QueueArn']
    });
  });
  
  it('deve falhar no health check quando há erro de conexão', async () => {
    sqsMock.getQueueAttributes.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('Connection failed'))
    });
    
    const result = await sqsService.healthCheck();
    
    expect(result).toBe(false);
  });
});