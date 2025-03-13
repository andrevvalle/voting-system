const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminAuth } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da votação
 *         title:
 *           type: string
 *           description: Título da votação
 *         description:
 *           type: string
 *           description: Descrição detalhada da votação
 *         isActive:
 *           type: boolean
 *           description: Indica se a votação está ativa
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     Participant:
 *       type: object
 *       required:
 *         - name
 *         - pollId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do participante
 *         name:
 *           type: string
 *           description: Nome do participante
 *         pollId:
 *           type: string
 *           format: uuid
 *           description: ID da votação associada
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Apply admin auth middleware to all admin routes
router.use(verifyAdminAuth);

/**
 * @swagger
 * /admin/polls:
 *   post:
 *     summary: Cria uma nova votação
 *     description: Cria uma nova votação com os dados fornecidos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título da votação
 *               description:
 *                 type: string
 *                 description: Descrição detalhada da votação
 *     responses:
 *       201:
 *         description: Votação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       400:
 *         description: Dados inválidos ou faltando
 *       401:
 *         description: Não autorizado
 */
router.post('/polls', adminController.createPoll);

/**
 * @swagger
 * /admin/polls:
 *   get:
 *     summary: Lista todas as votações
 *     description: Retorna uma lista de todas as votações, incluindo ativas e inativas
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de votações obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *       401:
 *         description: Não autorizado
 */
router.get('/polls', adminController.getAllPolls);

/**
 * @swagger
 * /admin/polls/{pollId}:
 *   get:
 *     summary: Obtém detalhes de uma votação específica
 *     description: Retorna informações detalhadas sobre uma votação específica
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da votação
 *     responses:
 *       200:
 *         description: Detalhes da votação obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Votação não encontrada
 */
router.get('/polls/:pollId', adminController.getPollById);

/**
 * @swagger
 * /admin/polls/{pollId}:
 *   put:
 *     summary: Atualiza uma votação
 *     description: Atualiza os dados de uma votação existente
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da votação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título da votação
 *               description:
 *                 type: string
 *                 description: Descrição detalhada da votação
 *     responses:
 *       200:
 *         description: Votação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Votação não encontrada
 */
router.put('/polls/:pollId', adminController.updatePoll);

/**
 * @swagger
 * /admin/polls/{pollId}:
 *   delete:
 *     summary: Remove uma votação
 *     description: Remove uma votação e todos seus participantes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da votação
 *     responses:
 *       200:
 *         description: Votação removida com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Votação não encontrada
 */
router.delete('/polls/:pollId', adminController.deletePoll);

/**
 * @swagger
 * /admin/polls/{pollId}/participants:
 *   post:
 *     summary: Adiciona um participante a uma votação
 *     description: Cria um novo participante para uma votação específica
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da votação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do participante
 *     responses:
 *       201:
 *         description: Participante adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Dados inválidos ou faltando
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Votação não encontrada
 */
router.post('/polls/:pollId/participants', adminController.addParticipant);

/**
 * @swagger
 * /admin/polls/{pollId}/participants/{participantId}:
 *   delete:
 *     summary: Remove um participante
 *     description: Remove um participante de uma votação
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da votação
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do participante
 *     responses:
 *       200:
 *         description: Participante removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Votação ou participante não encontrados
 */
router.delete('/polls/:pollId/participants/:participantId', adminController.removeParticipant);

/**
 * @swagger
 * /admin/polls/{pollId}/start:
 *   post:
 *     summary: Inicia uma votação
 *     description: Ativa uma votação para que os usuários possam votar
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da votação
 *     responses:
 *       200:
 *         description: Votação iniciada com sucesso
 *       400:
 *         description: Votação já está ativa
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Votação não encontrada
 */
router.post('/polls/:pollId/start', adminController.startPoll);

/**
 * @swagger
 * /admin/polls/{pollId}/end:
 *   post:
 *     summary: Encerra uma votação
 *     description: Desativa uma votação para que novos votos não sejam aceitos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da votação
 *     responses:
 *       200:
 *         description: Votação encerrada com sucesso
 *       400:
 *         description: Votação já está inativa
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Votação não encontrada
 */
router.post('/polls/:pollId/end', adminController.endPoll);

module.exports = router;