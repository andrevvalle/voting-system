const redisService = require('../services/redisService');
const { Poll, Participant } = require('../models');

async function getPollStatus(req, res, next) {
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

    const results = [];

    for (const participant of poll.Participants) {
      const voteKey = `vote:${pollId}:${participant.id}`;
      const votesStr = await redisService.get(voteKey);
      const votes = parseInt(votesStr || '0');

      results.push({
        id: participant.id,
        name: participant.name,
        imageUrl: participant.imageUrl,
        votes
      });
    }

    const totalVotesStr = await redisService.get(`votes:poll:${pollId}`) || '0';
    const totalVotes = parseInt(totalVotesStr);

    results.sort((a, b) => b.votes - a.votes);

    if (totalVotes > 0) {
      for (const result of results) {
        result.percentage = Math.round((result.votes / totalVotes) * 100);
      }
    }

    return res.json({
      poll: {
        id: poll.id,
        name: poll.name,
        description: poll.description,
        isActive: poll.isActive,
        startDate: poll.startDate,
        endDate: poll.endDate
      },
      results,
      totalVotes,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar status da votação:', error);
    next(error);
  }
}

async function getActivePolls(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const filterActive = req.query.filterActive === 'true';
    
    const where = filterActive ? { isActive: true } : {};
    
    const { count, rows: polls } = await Poll.findAndCountAll({
      where,
      include: [{ model: Participant }],
      order: [['startDate', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.json({
      polls: polls.map(poll => ({
        id: poll.id,
        name: poll.name,
        description: poll.description,
        isActive: poll.isActive,
        startDate: poll.startDate,
        endDate: poll.endDate,
        participants: poll.Participants.map(participant => ({
          id: participant.id,
          name: participant.name,
          imageUrl: participant.imageUrl
        })),
        participantsCount: poll.Participants.length
      })),
      meta: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar votações:', error);
    next(error);
  }
}

module.exports = {
  getPollStatus,
  getActivePolls
};