require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const stationController = require('./controllers/stationController');
const reservationController = require('./controllers/reservationController');
const uploadController = require('./controllers/uploadController');

const validateReservation = require('./middleware/validateReservation');
const checkReservationOwner = require('./middleware/checkReservationOwner');
const uploadHero = require('./middleware/uploadMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());          // allow the front-end (opened with Live Server) to call this API
app.use(express.json());  // parse JSON request bodies

// Serve uploaded images (e.g. the hero banner) as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Station routes ----------
app.get('/api/stations', stationController.getAllStations);
app.get('/api/stations/:stationId/lockers', stationController.getLockersByStation);

// ---------- Reservation routes (full CRUD) ----------
app.post('/api/reservations', validateReservation, reservationController.createReservation);
app.get('/api/reservations/:code', reservationController.getReservationByCode);
app.put('/api/reservations/:code', reservationController.updateReservation);
app.delete('/api/reservations/:code', reservationController.cancelReservation);

// ---------- Hero image upload routes ----------
app.get('/api/upload/hero', uploadController.getHeroImage);
app.post('/api/upload/hero', uploadHero.single('heroImage'), uploadController.uploadHeroImage);

// Error-handling middleware must be registered LAST
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log('Server running on http://localhost:' + PORT);
});
