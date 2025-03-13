function errorHandler(err, req, res, next) {
  console.error('Erro na aplicação:', err);

  const statusCode = err.statusCode || 500;
  
  const errorResponse = {
    error: true,
    message: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;