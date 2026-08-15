const stationModel = require('../models/stationModel');

// GET /api/stations
async function getAllStations(req, res, next) {
  try {
    const stations = await stationModel.getAllStations();
    res.json(stations);
  } catch (err) {
    next(err); // hand off to the error-handling middleware
  }
}

// GET /api/stations/:stationId/lockers
async function getLockersByStation(req, res, next) {
  try {
    const lockers = await stationModel.getLockersByStation(req.params.stationId);
    res.json(lockers);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllStations, getLockersByStation };
