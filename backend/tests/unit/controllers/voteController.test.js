const { registerVote } = require('../../../src/controllers/voteController');
const redisService = require('../../../src/services/redisService');
const sqsService = require('../../../src/services/sqsService');
const { Participant, Poll } = require('../../../src/models');
const jwt = require('jsonwebtoken');

jest.mock('../../../src/services/redisService');
jest.mock('../../../src/services/sqsService');
jest.mock('../../../src/models');
jest.mock('jsonwebtoken');

describe('VoteController', () => {
  let req, res, next;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {
        userId: 'user123',
        participantId: 'participant123',
        pollId: 'poll123',
        voteToken: 'token123',
        recaptchaToken: 'recaptcha123'
      },
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '127.0.0.1'
      },
      recaptchaScore: 0.9
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    Participant.findOne = jest.fn().mockResolvedValue({
      id: 'participant123',
      name: 'Participante Teste',
      pollId: 'poll123'
    });
    
    Poll.findByPk = jest.fn().mockResolvedValue({
      id: 'poll123',
      name: 'Votação Teste',
      isActive: true
    });
    
    redisService.increment = jest.fn()
      .mockResolvedValueOnce(1)
      .mockResolvedValue(1);    
    
    redisService.setWithExpiry = jest.fn().mockResolvedValue('OK');
    sqsService.sendMessage = jest.fn().mockResolvedValue({ MessageId: 'msg123' });
    
    jwt.verify = jest.fn().mockReturnValue({
      userId: 'user123',
      participantId: 'participant123',
      pollId: 'poll123',
      exp: Math.floor(Date.now() / 1000) + 3600
    });
  });
  
  it('deve registrar um voto com sucesso', async () => {
    await registerVote(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Voto registrado com sucesso'
    }));
    
    expect(redisService.increment).toHaveBeenCalledTimes(4);
    expect(redisService.setWithExpiry).toHaveBeenCalledTimes(1);
    expect(sqsService.sendMessage).toHaveBeenCalledTimes(1);
  });
  
  it('deve retornar erro quando participantId ou pollId não são fornecidos', async () => {
    req.body.participantId = undefined;
    
    await registerVote(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: expect.stringContaining('obrigatórios')
    }));
  });
  
  it('deve validar o token JWT corretamente', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Token inválido');
    });
    
    await registerVote(req, res, next);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao verificar token de voto:'),
      expect.any(Error)
    );
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: expect.stringContaining('Token de voto inválido')
    }));
    
    console.error = originalConsoleError;
  });
  
  it('deve rejeitar token expirado', async () => {
    jwt.verify.mockReturnValueOnce({
      userId: 'user123',
      participantId: 'participant123',
      pollId: 'poll123',
      exp: Math.floor(Date.now() / 1000) - 3600
    });
    
    await registerVote(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: expect.stringContaining('Token de voto expirado')
    }));
  });
  
  it('deve rejeitar token com dados incorretos', async () => {
    jwt.verify.mockReturnValueOnce({
      userId: 'user123',
      participantId: 'participant-DIFERENTE',
      pollId: 'poll123',
      exp: Math.floor(Date.now() / 1000) + 3600
    });
    
    await registerVote(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: expect.stringContaining('Token de voto inválido ou adulterado')
    }));
  });
  
  it('deve retornar erro quando o participante não existe', async () => {
    Participant.findOne.mockResolvedValueOnce(null);
    
    await registerVote(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: expect.stringContaining('Participante não encontrado')
    }));
  });
  
  it('deve retornar erro quando a votação não está ativa', async () => {
    Poll.findByPk.mockResolvedValueOnce({
      id: 'poll123',
      name: 'Votação Teste',
      isActive: false
    });
    
    await registerVote(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: expect.stringContaining('não está ativa')
    }));
  });
  
  it('deve aplicar rate limiting para usuários', async () => {
    redisService.increment.mockReset();
    redisService.increment.mockResolvedValueOnce(21);
    
    await registerVote(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: expect.stringContaining('Limite de votos por minuto excedido')
    }));
  });
  
  it('deve criar um ID temporário se userId não for fornecido', async () => {
    req.body.userId = undefined;
    
    jwt.verify.mockReturnValue({
      participantId: 'participant123',
      pollId: 'poll123',
      exp: Math.floor(Date.now() / 1000) + 3600
    });
    
    await registerVote(req, res, next);
    
    expect(sqsService.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: expect.stringContaining('temp-user-'),
      })
    );
  });
  
  it('deve continuar mesmo se ocorrer erro ao enviar para SQS', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    sqsService.sendMessage.mockRejectedValueOnce(new Error('SQS error'));
    
    await registerVote(req, res, next);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao enviar para SQS'),
      expect.any(Error)
    );
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));
    
    console.error = originalConsoleError;
  });
});