const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Sistema de Votação',
      version: '1.0.0',
      description: 'Documentação da API do Sistema de Votação',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.votacao-example.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Documentação Swagger disponível em /api-docs');
};

module.exports = setupSwagger;