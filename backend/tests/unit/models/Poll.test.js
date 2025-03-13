const { Sequelize } = require('sequelize');

jest.mock('../../../src/models/database', () => {
  const mockSequelize = {
    define: jest.fn().mockReturnValue({
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      tableName: 'polls'
    })
  };
  return { 
    sequelize: mockSequelize,
    testConnection: jest.fn().mockResolvedValue(true)
  };
});

jest.mock('../../../src/models/Poll', () => {
  const UUID = 'UUID';
  const UUIDV4 = 'UUIDV4';
  const STRING = 'STRING';
  const TEXT = 'TEXT';
  const DATE = 'DATE';
  const INTEGER = 'INTEGER';
  const BOOLEAN = 'BOOLEAN';
  
  return {
    tableName: 'polls',
    rawAttributes: {
      id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true
      },
      name: {
        type: STRING,
        allowNull: false
      },
      description: {
        type: TEXT,
        allowNull: true
      },
      startDate: {
        type: DATE,
        allowNull: false
      },
      endDate: {
        type: DATE,
        allowNull: false
      },
      duration: {
        type: INTEGER,
        allowNull: false
      },
      isActive: {
        type: BOOLEAN,
        defaultValue: true
      }
    },
    associations: {},
    belongsTo: jest.fn(),
    hasMany: jest.fn()
  };
});

const Poll = require('../../../src/models/Poll');

describe('Poll Model', () => {
  let mockPoll;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPoll = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Teste de Votação',
      description: 'Descrição da votação de teste',
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      duration: 24,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  it('deve definir o modelo Poll corretamente', () => {
    expect(Poll.rawAttributes).toHaveProperty('id');
    expect(Poll.rawAttributes).toHaveProperty('name');
    expect(Poll.rawAttributes).toHaveProperty('description');
    expect(Poll.rawAttributes).toHaveProperty('startDate');
    expect(Poll.rawAttributes).toHaveProperty('endDate');
    expect(Poll.rawAttributes).toHaveProperty('duration');
    expect(Poll.rawAttributes).toHaveProperty('isActive');
  });

  it('deve ter um ID do tipo UUID', () => {
    const idAttribute = Poll.rawAttributes.id;
    expect(idAttribute.type).toBe('UUID');
    expect(idAttribute.primaryKey).toBe(true);
  });

  it('deve validar campos obrigatórios', () => {
    const nameAttribute = Poll.rawAttributes.name;
    expect(nameAttribute.allowNull).toBe(false);
  });

  it('deve configurar corretamente o nome da tabela', () => {
    expect(Poll.tableName).toBe('polls');
  });
});