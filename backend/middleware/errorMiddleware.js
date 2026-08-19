const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = errorHandler;
