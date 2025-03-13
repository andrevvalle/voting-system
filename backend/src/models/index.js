const { sequelize, testConnection } = require('./database');
const Poll = require('./Poll');
const Participant = require('./Participant');
const Vote = require('./Vote');
const Admin = require('./Admin');

const adminSeed = require('./seeds/adminSeed');

const models = {
  Poll,
  Participant,
  Vote,
  Admin: Admin(sequelize)
};

Poll.hasMany(Participant, { foreignKey: 'pollId' });
Participant.belongsTo(Poll, { foreignKey: 'pollId' });

Poll.hasMany(Vote, { foreignKey: 'pollId' });
Vote.belongsTo(Poll, { foreignKey: 'pollId' });

Participant.hasMany(Vote, { foreignKey: 'participantId' });
Vote.belongsTo(Participant, { foreignKey: 'participantId' });

async function initModels() {
  try {
    let connected = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!connected && attempts < maxAttempts) {
      attempts++;
      console.log(`Tentativa ${attempts} de conectar ao banco de dados...`);
      connected = await testConnection();
      
      if (!connected && attempts < maxAttempts) {
        console.log(`Conexão falhou. Aguardando 2 segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!connected) {
      console.error(`Não foi possível inicializar os modelos após ${maxAttempts} tentativas`);
      return false;
    }

    console.log('Conexão com o banco de dados estabelecida com sucesso');

    const force = process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true';
    try {
      await sequelize.sync({ force });
      console.log(`Modelos sincronizados ${force ? '(tabelas recriadas)' : ''}`);
    } catch (syncError) {
      console.error('Erro ao sincronizar modelos:', syncError);
      return false;
    }
    
    try {
      await adminSeed(models);
      console.log('Dados iniciais inseridos com sucesso');
    } catch (seedError) {
      console.error('Erro ao inserir dados iniciais:', seedError);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar modelos:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  ...models,
  initModels
};