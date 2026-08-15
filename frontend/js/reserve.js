// Grab the locker id + number from the URL
const urlParams = new URLSearchParams(window.location.search);
const lockerId = urlParams.get('lockerId');
const lockerNumber = urlParams.get('lockerNumber');

// Grab the HTML elements we need to work with
const reserveForm = document.getElementById('reserveForm');
const lockerNumberLabel = document.getElementById('lockerNumberLabel');
const errorMessage = document.getElementById('errorMessage');
const submitBtn = document.getElementById('submitBtn');

// Show which locker we're reserving
lockerNumberLabel.textContent = lockerNumber;

// Handle the form submission
reserveForm.addEventListener('submit', function (event) {
  event.preventDefault(); // stop the page from refreshing

  errorMessage.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Reserving...';

const mobileInput = document.getElementById('mobileNumber') || document.getElementById('MobileNumber');
const pinInput = document.getElementById('pin') || document.getElementById('pinHash');

const newReservation = {
  lockerId: parseInt(lockerId),
  mobileNumber: mobileInput ? mobileInput.value.trim() : '',
  pin: pinInput ? pinInput.value.trim() : ''
};

  // POST /api/reservations
  fetch(API + '/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newReservation)
  })
    .then(function (response) {
      // If the API returned an error status (e.g. 400/409), read the message
      // out of the body and throw it so the .catch() below handles it
      if (!response.ok) {
        return response.json().then(function (body) {
          throw new Error(body.message || 'Something went wrong.');
        });
      }
      return response.json();
    })
    .then(function (result) {
      // Success - go to the confirmation page with the reservation code
      window.location.href = 'confirmation.html?code=' + result.ReservationCode;
    })
    .catch(function (error) {
      errorMessage.textContent = error.message;
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reserve This Locker';
    });
});
