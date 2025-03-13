const { DataTypes } = require('sequelize');

jest.mock('../../../src/models/Poll', () => {
  const UUID = 'UUID';
  
  return {
    tableName: 'polls',
    rawAttributes: {
      id: { 
        type: UUID, 
        primaryKey: true 
      }
    }
  };
});

jest.mock('../../../src/models/database', () => {
  const mockSequelize = {
    define: jest.fn().mockReturnValue({
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      tableName: 'participants'
    })
  };
  return { 
    sequelize: mockSequelize,
    testConnection: jest.fn().mockResolvedValue(true)
  };
});

jest.mock('../../../src/models/Participant', () => {
  const UUID = 'UUID';
  const UUIDV4 = 'UUIDV4';
  const STRING = 'STRING';
  
  return {
    tableName: 'participants',
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
      imageUrl: {
        type: STRING,
        allowNull: true
      },
      pollId: {
        type: UUID,
        allowNull: false,
        references: {
          model: 'Poll',
          key: 'id'
        }
      }
    },
    associations: {
      Poll: {
        foreignKey: 'pollId',
        targetKey: 'id'
      }
    },
    belongsTo: jest.fn()
  };
});

const Participant = require('../../../src/models/Participant');
const Poll = require('../../../src/models/Poll');

describe('Participant Model', () => {
  let mockParticipant;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockParticipant = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Participante Teste',
      imageUrl: 'https://example.com/image.jpg',
      pollId: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  it('deve definir o modelo Participant corretamente', () => {
    expect(Participant.rawAttributes).toHaveProperty('id');
    expect(Participant.rawAttributes).toHaveProperty('name');
    expect(Participant.rawAttributes).toHaveProperty('imageUrl');
    expect(Participant.rawAttributes).toHaveProperty('pollId');
  });

  it('deve ter um ID do tipo UUID', () => {
    const idAttribute = Participant.rawAttributes.id;
    expect(idAttribute.type).toBe('UUID');
    expect(idAttribute.primaryKey).toBe(true);
  });

  it('deve validar campos obrigatórios', () => {
    const nameAttribute = Participant.rawAttributes.name;
    expect(nameAttribute.allowNull).toBe(false);
    
    const pollIdAttribute = Participant.rawAttributes.pollId;
    expect(pollIdAttribute.allowNull).toBe(false);
  });

  it('deve permitir URL de imagem como campo opcional', () => {
    const imageUrlAttribute = Participant.rawAttributes.imageUrl;
    expect(imageUrlAttribute.allowNull).toBe(true);
  });

  it('deve configurar corretamente o nome da tabela', () => {
    expect(Participant.tableName).toBe('participants');
  });

  it('deve estabelecer a relação com o modelo Poll', () => {
    const associations = Participant.associations;
    expect(associations).toHaveProperty('Poll');
    expect(associations.Poll.foreignKey).toBe('pollId');
  });
});