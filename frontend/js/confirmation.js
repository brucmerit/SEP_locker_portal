// Grab the reservation code from the URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

// Grab the HTML elements we need to work with
const reservationCodeEl = document.getElementById('reservationCode');
const details = document.getElementById('details');
const extendBtn = document.getElementById('extendBtn');
const cancelBtn = document.getElementById('cancelBtn');
const verifyForm = document.getElementById('verifyForm');
const verifyLabel = document.getElementById('verifyLabel');
const verifyMobile = document.getElementById('verifyMobile');
const verifyPin = document.getElementById('verifyPin');
const verifyError = document.getElementById('verifyError');
const verifySubmitBtn = document.getElementById('verifySubmitBtn');

let pendingAction = null; // 'extend' or 'cancel' - which button was clicked

// ---------------- Load reservation (GET) ----------------

function loadReservation() {
  reservationCodeEl.textContent = code;

  fetch(API + '/reservations/' + code)
    .then(function (response) {
      return response.json();
    })
    .then(function (reservation) {
      showDetails(reservation);
    })
    .catch(function (error) {
      console.error('Error loading reservation:', error);
    });
}

function showDetails(reservation) {
  const reservedAt = new Date(reservation.ReservationTime).toLocaleString();
  const expiresAt = new Date(reservation.ExpiryTime).toLocaleString();

  details.innerHTML = `
    <p><span class="font-semibold">Station:</span> ${reservation.StationName}</p>
    <p><span class="font-semibold">Locker:</span> ${reservation.LockerNumber}</p>
    <p><span class="font-semibold">Reserved at:</span> ${reservedAt}</p>
    <p><span class="font-semibold">Expires at:</span> ${expiresAt}</p>
    <p><span class="font-semibold">Status:</span> ${reservation.Status}</p>
  `;

  // Hide the manage buttons once a reservation is no longer active
  if (reservation.Status !== 'Active') {
    extendBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
  }
}

// ---------------- Manage buttons open the verify form ----------------

extendBtn.addEventListener('click', function () {
  pendingAction = 'extend';
  verifyLabel.textContent = 'Enter your mobile number and PIN to extend this reservation by 24 hours.';
  openVerifyForm();
});

cancelBtn.addEventListener('click', function () {
  pendingAction = 'cancel';
  verifyLabel.textContent = 'Enter your mobile number and PIN to cancel this reservation.';
  openVerifyForm();
});

function openVerifyForm() {
  verifyForm.classList.remove('hidden');
  verifyError.classList.add('hidden');
}

// ---------------- Submit the verify form (PUT or DELETE) ----------------

verifyForm.addEventListener('submit', function (event) {
  event.preventDefault();

  verifyError.classList.add('hidden');
  verifySubmitBtn.disabled = true;
  verifySubmitBtn.textContent = 'Please wait...';

  const body = {
    mobileNumber: verifyMobile.value,
    pin: verifyPin.value
  };

  const method = pendingAction === 'extend' ? 'PUT' : 'DELETE';

  fetch(API + '/reservations/' + code, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (data) {
          throw new Error(data.message || 'Something went wrong.');
        });
      }
      return response.json();
    })
    .then(function () {
      // Reload the reservation details to show the updated expiry/status
      verifyForm.classList.add('hidden');
      loadReservation();
    })
    .catch(function (error) {
      verifyError.textContent = error.message;
      verifyError.classList.remove('hidden');
    })
    .finally(function () {
      verifySubmitBtn.disabled = false;
      verifySubmitBtn.textContent = 'Confirm';
    });
});

// Kick things off when the page loads
loadReservation();
