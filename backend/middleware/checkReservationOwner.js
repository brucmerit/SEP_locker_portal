const bcrypt = require('bcryptjs');
const reservationModel = require('../models/reservationModel');

// Runs before PUT/DELETE on a reservation. Since there is no login system,
// the mobile number + PIN together act as proof that this request is coming
// from whoever made the original booking.
async function checkReservationOwner(req, res, next) {
  try {
    const { mobileNumber, pin } = req.body;
    const code = req.params.code;

    if (!mobileNumber || !pin) {
      return res.status(400).json({ message: 'Mobile number and PIN are required.' });
    }

    const reservation = await reservationModel.getReservationRawByCode(code);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    const mobileMatches = reservation.MobileNumber === mobileNumber;
    const pinMatches = await bcrypt.compare(pin, reservation.PinHash);

    if (!mobileMatches || !pinMatches) {
      return res.status(401).json({ message: 'Mobile number or PIN is incorrect.' });
    }

    // Stash the reservation on the request so the controller doesn't have
    // to look it up a second time
    req.reservation = reservation;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkReservationOwner;
