const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica a saúde do sistema
 *     description: Endpoint para verificar se todos os serviços e dependências estão funcionando corretamente
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Sistema está saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   description: Tempo de execução em segundos
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: boolean
 *                     redis:
 *                       type: boolean
 *                     sqs:
 *                       type: boolean
 *       500:
 *         description: Problema detectado em um ou mais serviços
 */
router.get('/', healthController.checkHealth);

module.exports = router;