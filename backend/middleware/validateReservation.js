// Runs before reservationController.createReservation - checks the mobile
// number and PIN are in the right format before we touch the database
function validateReservation(req, res, next) {
  const { lockerId, mobileNumber, pin } = req.body;

  if (!lockerId) {
    return res.status(400).json({ message: 'lockerId is required.' });
  }

  if (!mobileNumber || mobileNumber.length !== 8) {
    return res.status(400).json({ message: 'Mobile number must be 8 digits.' });
  }

  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return res.status(400).json({ message: 'PIN must be exactly 6 digits.' });
  }

  next(); // all good, continue to the controller
}

module.exports = validateReservation;
