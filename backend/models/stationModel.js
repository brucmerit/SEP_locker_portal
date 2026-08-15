const { sql, poolPromise } = require('../config/dbConfig');

// Get every station, with its image and a live count of available lockers
async function getAllStations() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT s.StationID, s.StationName, s.Address, s.TotalLockers, s.ImageUrl,
           SUM(CASE WHEN l.Status = 'Available' THEN 1 ELSE 0 END) AS AvailableLockers
    FROM LockerStation s
    INNER JOIN Locker l ON s.StationID = l.StationID
    GROUP BY s.StationID, s.StationName, s.Address, s.TotalLockers, s.ImageUrl
    ORDER BY s.StationName
  `);
  return result.recordset;
}

// Get every locker belonging to one station
async function getLockersByStation(stationId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('stationId', sql.Int, stationId)
    .query(`
      SELECT LockerID, StationID, LockerNumber, Size, Status
      FROM Locker
      WHERE StationID = @stationId
      ORDER BY LockerNumber
    `);
  return result.recordset;
}

module.exports = { getAllStations, getLockersByStation };
