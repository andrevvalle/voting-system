const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

/**
 * @swagger
 * /status/{pollId}:
 *   get:
 *     summary: Obtém o status de uma votação específica
 *     description: Retorna informações sobre a votação e os resultados atuais
 *     tags: [Status]
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
 *         description: Status da votação obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 poll:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       votes:
 *                         type: number
 *                 totalVotes:
 *                   type: number
 *       404:
 *         description: Votação não encontrada
 */
router.get('/:pollId', statusController.getPollStatus);

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Lista todas as votações ativas
 *     description: Retorna uma lista de todas as votações que estão atualmente ativas
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Lista de votações ativas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   totalVotes:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', statusController.getActivePolls);

module.exports = router;