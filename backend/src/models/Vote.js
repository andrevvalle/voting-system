const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');
const Poll = require('./Poll');
const Participant = require('./Participant');

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
    allowNull: false,
    references: {
      model: Participant,
      key: 'id'
    }
  },
  pollId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Poll,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'votes',
  indexes: [
    {
      fields: ['pollId', 'participantId']
    },
    {
      fields: ['userId', 'pollId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

Vote.belongsTo(Poll, { foreignKey: 'pollId' });
Vote.belongsTo(Participant, { foreignKey: 'participantId' });
Poll.hasMany(Vote, { foreignKey: 'pollId' });
Participant.hasMany(Vote, { foreignKey: 'participantId' });

module.exports = Vote;