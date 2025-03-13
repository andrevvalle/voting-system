const { Poll, Participant, sequelize } = require('../models');
const redisService = require('../services/redisService');

async function createPoll(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { name, description, participants, startDate, endDate, duration } = req.body;

    if (!name || !participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({
        error: true,
        message: 'Nome e pelo menos 2 participantes são obrigatórios'
      });
    }
    
    const start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : null;
    
    if (duration && !end) {
      end = new Date(start);
      end.setHours(end.getHours() + parseInt(duration));
    }

    const poll = await Poll.create({
      name,
      description,
      startDate: start,
      endDate: end,
      duration: duration ? parseInt(duration) : null,
      isActive: true
    }, { transaction });

    const createdParticipants = await Promise.all(
      participants.map(p => Participant.create({
        name: p.name,
        imageUrl: p.imageUrl,
        pollId: poll.id
      }, { transaction }))
    );

    await transaction.commit();

    await redisService.setWithExpiry(`poll:${poll.id}:active`, '1', 60 * 60 * 24 * 30); // 30 dias
    
    for (const participant of createdParticipants) {
      await redisService.setWithExpiry(`vote:${poll.id}:${participant.id}`, '0', 60 * 60 * 24 * 30);
    }

    return res.status(201).json({
      success: true,
      poll: {
        id: poll.id,
        name: poll.name,
        description: poll.description,
        isActive: poll.isActive,
        startDate: poll.startDate,
        endDate: poll.endDate,
        duration: poll.duration,
        participants: createdParticipants.map(p => ({
          id: p.id,
          name: p.name,
          imageUrl: p.imageUrl
        }))
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar votação:', error);
    next(error);
  }
}

async function getAllPolls(req, res, next) {
  try {
    const polls = await Poll.findAll({
      include: [{ model: Participant }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      count: polls.length,
      polls: polls.map(poll => ({
        id: poll.id,
        name: poll.name,
        isActive: poll.isActive,
        startDate: poll.startDate,
        endDate: poll.endDate,
        participants: poll.Participants.map(p => ({
          id: p.id,
          name: p.name,
          imageUrl: p.imageUrl
        }))
      }))
    });
  } catch (error) {
    console.error('Erro ao listar votações:', error);
    next(error);
  }
}

async function getPollById(req, res, next) {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId, {
      include: [{ model: Participant }]
    });

    if (!poll) {
      return res.status(404).json({
        error: true,
        message: 'Votação não encontrada'
      });
    }

    return res.json({
      id: poll.id,
      name: poll.name,
      isActive: poll.isActive,
      startDate: poll.startDate,
      endDate: poll.endDate,
      participants: poll.Participants.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar votação:', error);
    next(error);
  }
}

async function updatePoll(req, res, next) {
  try {
    const { pollId } = req.params;
    const { name, isActive, endDate } = req.body;

    const poll = await Poll.findByPk(pollId);

    if (!poll) {
      return res.status(404).json({
        error: true,
        message: 'Votação não encontrada'
      });
    }

    if (name) poll.name = name;
    if (isActive !== undefined) {
      poll.isActive = isActive;
      await redisService.setWithExpiry(`poll:${poll.id}:active`, isActive ? '1' : '0', 60 * 60 * 24 * 30);
    }
    if (endDate) poll.endDate = new Date(endDate);

    await poll.save();

    return res.json({
      success: true,
      poll: {
        id: poll.id,
        name: poll.name,
        isActive: poll.isActive,
        startDate: poll.startDate,
        endDate: poll.endDate
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar votação:', error);
    next(error);
  }
}

async function deletePoll(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId, {
      include: [{ model: Participant }]
    });

    if (!poll) {
      return res.status(404).json({
        error: true,
        message: 'Votação não encontrada'
      });
    }

    await redisService.redis.del(`poll:${pollId}:active`);
    
    if (poll.Participants && poll.Participants.length > 0) {
      for (const participant of poll.Participants) {
        await redisService.redis.del(`vote:${pollId}:${participant.id}`);
      }
    }

    await Participant.destroy({
      where: { pollId },
      transaction
    });

    await poll.destroy({ transaction });

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Votação excluída com sucesso'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao excluir votação:', error);
    next(error);
  }
}

async function addParticipant(req, res, next) {
  try {
    const { pollId } = req.params;
    const { name, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({
        error: true,
        message: 'Nome do participante é obrigatório'
      });
    }

    const poll = await Poll.findByPk(pollId);

    if (!poll) {
      return res.status(404).json({
        error: true,
        message: 'Votação não encontrada'
      });
    }

    const participant = await Participant.create({
      name,
      imageUrl,
      pollId
    });

    await redisService.setWithExpiry(`vote:${pollId}:${participant.id}`, '0', 60 * 60 * 24 * 30);

    return res.status(201).json({
      success: true,
      participant: {
        id: participant.id,
        name: participant.name,
        imageUrl: participant.imageUrl,
        pollId: participant.pollId
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    next(error);
  }
}

async function removeParticipant(req, res, next) {
  try {
    const { pollId, participantId } = req.params;

    const participant = await Participant.findOne({
      where: { id: participantId, pollId }
    });

    if (!participant) {
      return res.status(404).json({
        error: true,
        message: 'Participante não encontrado nesta votação'
      });
    }

    await participant.destroy();

    return res.json({
      success: true,
      message: 'Participante removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover participante:', error);
    next(error);
  }
}

async function startPoll(req, res, next) {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId);

    if (!poll) {
      return res.status(404).json({
        error: true,
        message: 'Votação não encontrada'
      });
    }

    poll.isActive = true;
    poll.startDate = new Date();
    await poll.save();

    await redisService.setWithExpiry(`poll:${poll.id}:active`, '1', 60 * 60 * 24 * 30);

    return res.json({
      success: true,
      message: 'Votação iniciada com sucesso',
      poll: {
        id: poll.id,
        name: poll.name,
        isActive: poll.isActive,
        startDate: poll.startDate
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar votação:', error);
    next(error);
  }
}

async function endPoll(req, res, next) {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId);

    if (!poll) {
      return res.status(404).json({
        error: true,
        message: 'Votação não encontrada'
      });
    }

    poll.isActive = false;
    poll.endDate = new Date();
    await poll.save();

    await redisService.setWithExpiry(`poll:${poll.id}:active`, '0', 60 * 60 * 24 * 30);

    return res.json({
      success: true,
      message: 'Votação encerrada com sucesso',
      poll: {
        id: poll.id,
        name: poll.name,
        isActive: poll.isActive,
        endDate: poll.endDate
      }
    });
  } catch (error) {
    console.error('Erro ao encerrar votação:', error);
    next(error);
  }
}

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
  addParticipant,
  removeParticipant,
  startPoll,
  endPoll
};