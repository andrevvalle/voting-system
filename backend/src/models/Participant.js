const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');
const Poll = require('./Poll');

const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'participants'
});

Participant.belongsTo(Poll, { foreignKey: 'pollId' });
Poll.hasMany(Participant, { foreignKey: 'pollId' });

module.exports = Participant;