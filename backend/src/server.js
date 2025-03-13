const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const voteRoutes = require('./routes/voteRoutes');
const statusRoutes = require('./routes/statusRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const setupSwagger = require('./swagger');

const { initModels } = require('./models/index');

require('dotenv').config();
const PORT = process.env.PORT || 4000;

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

setupSwagger(app);

app.use('/auth', authRoutes); 
app.use('/health', healthRoutes);
app.use('/vote', voteRoutes);
app.use('/status', statusRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Votação funcionando!' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    const initialized = await initModels();
    
    if (!initialized) {
      console.error('Falha ao inicializar modelos de banco de dados');
      console.log('Aguardando 5 segundos para nova tentativa...');
      setTimeout(() => startServer(), 5000);
      return;
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();