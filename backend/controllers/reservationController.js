const bcrypt = require('bcryptjs');
const reservationModel = require('../models/reservationModel');

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1, easy to read out loud

// Makes an 8-character code like "K3F9X2QD"
function generateReservationCode() {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

// CREATE - POST /api/reservations
async function createReservation(req, res, next) {
  try {
    const { lockerId, mobileNumber, pin } = req.body;

    // Step 1: try to atomically claim the locker
    const claimed = await reservationModel.tryReserveLocker(lockerId);
    if (!claimed) {
      return res.status(409).json({ message: 'Sorry, this locker was just taken. Please pick another one.' });
    }

    // Step 2: hash the PIN
    const pinHash = await bcrypt.hash(pin, 10);

    // Step 3: work out expiry time (24 hours from now)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);

    const reservationCode = generateReservationCode();

    await reservationModel.createReservation({
      lockerId,
      mobileNumber,
      pinHash,
      reservationCode,
      expiryTime
    });

    // Fetch back the full row to return
    const reservation = await reservationModel.getReservationByCode(reservationCode);
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
}

// READ - GET /api/reservations/:code
async function getReservationByCode(req, res, next) {
  try {
    const reservation = await reservationModel.getReservationByCode(req.params.code);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }
    res.json(reservation);
  } catch (err) {
    next(err);
  }
}

// UPDATE - PUT /api/reservations/:code
async function updateReservation(req, res, next) {
  try {
    const { code } = req.params;
    const { mobileNumber, pin, password } = req.body;

    const newMobile = mobileNumber;
    const newPin = pin || password;

    if (!newMobile) {
      return res.status(400).json({ message: 'Mobile number is required.' });
    }

    // Hash the new PIN if provided
    let pinHash = null;
    if (newPin) {
      pinHash = await bcrypt.hash(newPin, 10);
    }

    // Call database method to update details
    await reservationModel.updateReservationDetails(code, newMobile, pinHash);

    const updated = await reservationModel.getReservationByCode(code);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE - DELETE /api/reservations/:code
async function cancelReservation(req, res, next) {
  try {
    const { code } = req.params;

    // 1. Fetch reservation from SQL to get the LockerID
    const reservation = await reservationModel.getReservationRawByCode(code);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation code not found.' });
    }

    // 2. Mark reservation status as 'Cancelled'
    await reservationModel.cancelReservation(code);

    // 3. Release locker back to 'Available'
    await reservationModel.releaseLocker(reservation.LockerID);

    res.json({ message: 'Reservation cancelled and locker released.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReservation, getReservationByCode, updateReservation, cancelReservation };