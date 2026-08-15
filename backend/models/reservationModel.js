const { sql, poolPromise } = require('../config/dbConfig');

// Get one locker, joined with its station name
async function getLockerById(lockerId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('lockerId', sql.Int, lockerId)
    .query(`
      SELECT l.LockerID, l.LockerNumber, l.Status, s.StationName
      FROM Locker l
      INNER JOIN LockerStation s ON l.StationID = s.StationID
      WHERE l.LockerID = @lockerId
    `);
  return result.recordset[0];
}

// Atomically flips a locker from Available -> Reserved.
// Returns true only if THIS call is the one that changed it - if two people
// tap the same locker at once, only one UPDATE will match a row. SQL Server
// locks the row for the length of the statement, so the loser gets 0 rows
// affected instead of overwriting the winner's reservation.
async function tryReserveLocker(lockerId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('lockerId', sql.Int, lockerId)
    .query(`
      UPDATE Locker
      SET Status = 'Reserved'
      WHERE LockerID = @lockerId AND Status = 'Available'
    `);
  return result.rowsAffected[0] === 1;
}

// Puts a locker back to Available - used when a reservation is cancelled
async function releaseLocker(lockerId) {
  const pool = await poolPromise;
  await pool.request()
    .input('lockerId', sql.Int, lockerId)
    .query(`
      UPDATE Locker
      SET Status = 'Available'
      WHERE LockerID = @lockerId
    `);
}

// CREATE - insert a new reservation row.
// ReservationID is not an IDENTITY column, so we work out the next id
// ourselves first (same approach used for the seeded data).
async function createReservation(reservation) {
  const pool = await poolPromise;

  const maxIdResult = await pool.request().query(
    'SELECT ISNULL(MAX(ReservationID), 0) + 1 AS NextId FROM Reservation'
  );
  const nextId = maxIdResult.recordset[0].NextId;

  await pool.request()
    .input('id', sql.Int, nextId)
    .input('lockerId', sql.Int, reservation.lockerId)
    .input('mobileNumber', sql.VarChar(8), reservation.mobileNumber)
    .input('pinHash', sql.VarChar(200), reservation.pinHash)
    .input('code', sql.VarChar(10), reservation.reservationCode)
    .input('expiryTime', sql.DateTime, reservation.expiryTime)
    .query(`
      INSERT INTO Reservation (ReservationID, LockerID, MobileNumber, PinHash, ReservationCode, ReservationTime, ExpiryTime, Status)
      VALUES (@id, @lockerId, @mobileNumber, @pinHash, @code, GETDATE(), @expiryTime, 'Active')
    `);

  return nextId;
}

// READ (internal use) - includes PinHash, needed to verify PUT/DELETE requests.
// We never send this version back to the front-end.
async function getReservationRawByCode(code) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('code', sql.VarChar(10), code)
    .query(`
      SELECT ReservationID, LockerID, MobileNumber, PinHash, ReservationCode,
             ReservationTime, ExpiryTime, Status
      FROM Reservation
      WHERE ReservationCode = @code
    `);
  return result.recordset[0];
}

// READ (public use) - joined with locker + station info, no PinHash
async function getReservationByCode(code) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('code', sql.VarChar(10), code)
    .query(`
      SELECT r.ReservationCode, r.LockerID, r.MobileNumber, r.ReservationTime,
             r.ExpiryTime, r.Status, l.LockerNumber, s.StationName
      FROM Reservation r
      INNER JOIN Locker l ON r.LockerID = l.LockerID
      INNER JOIN LockerStation s ON l.StationID = s.StationID
      WHERE r.ReservationCode = @code
    `);
  return result.recordset[0];
}

// UPDATE - extend a reservation's expiry time by a number of hours
async function extendReservation(code, newExpiryTime) {
  const pool = await poolPromise;
  await pool.request()
    .input('code', sql.VarChar(10), code)
    .input('expiryTime', sql.DateTime, newExpiryTime)
    .query(`
      UPDATE Reservation
      SET ExpiryTime = @expiryTime
      WHERE ReservationCode = @code
    `);
}

// DELETE - cancel a reservation (we keep the row for record-keeping and
// just flip its status, rather than actually deleting the row)
async function cancelReservation(code) {
  const pool = await poolPromise;
  await pool.request()
    .input('code', sql.VarChar(10), code)
    .query(`
      UPDATE Reservation
      SET Status = 'Cancelled'
      WHERE ReservationCode = @code
    `);
}

// UPDATE - update MobileNumber and PinHash for an existing reservation
async function updateReservationDetails(code, mobileNumber, pinHash) {
  const pool = await poolPromise;
  
  if (pinHash) {
    // Update both MobileNumber and PinHash if a new PIN was provided
    await pool.request()
      .input('code', sql.VarChar(10), code)
      .input('mobileNumber', sql.VarChar(8), mobileNumber)
      .input('pinHash', sql.VarChar(200), pinHash)
      .query(`
        UPDATE Reservation
        SET MobileNumber = @mobileNumber,
            PinHash = @pinHash
        WHERE ReservationCode = @code
      `);
  } else {
    // Update only MobileNumber if no new PIN was entered
    await pool.request()
      .input('code', sql.VarChar(10), code)
      .input('mobileNumber', sql.VarChar(8), mobileNumber)
      .query(`
        UPDATE Reservation
        SET MobileNumber = @mobileNumber
        WHERE ReservationCode = @code
      `);
  }
}

module.exports = {
  getLockerById,
  tryReserveLocker,
  releaseLocker,
  createReservation,
  getReservationRawByCode,
  getReservationByCode,
  extendReservation,
  cancelReservation,
  updateReservationDetails
};
