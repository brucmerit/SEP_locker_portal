// Catches any error passed to next(err) from a controller and sends back
// a clean JSON response instead of an HTML stack trace.
// Express recognises this as error-handling middleware because it takes 4 parameters.
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
}

module.exports = errorHandler;
