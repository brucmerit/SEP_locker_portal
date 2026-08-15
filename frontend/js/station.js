// Grab the station id from the URL, e.g. station.html?stationId=1
const urlParams = new URLSearchParams(window.location.search);
const stationId = urlParams.get('stationId');

// Grab the HTML elements we need to work with
const stationImage = document.getElementById('stationImage');
const stationTitle = document.getElementById('stationTitle');
const stationAddress = document.getElementById('stationAddress');
const lockerContainer = document.getElementById('lockerContainer');
const emptyMessage = document.getElementById('emptyMessage');

// Colours for each locker status
const statusColors = {
  Available: 'bg-green-500 hover:bg-green-600 cursor-pointer',
  Reserved: 'bg-yellow-500 cursor-not-allowed opacity-70',
  Occupied: 'bg-red-500 cursor-not-allowed opacity-70'
};

// Stores the active reservation code being edited or cancelled
let currentReservationCode = null;

// GET the station's basic details (we already have the full list from
// the homepage's endpoint, so we just filter it down to this one station)
function loadStationDetails() {
  fetch(API + '/stations')
    .then(function (response) {
      return response.json();
    })
    .then(function (stations) {
      const station = stations.find(function (s) {
        return s.StationID == stationId;
      });

      if (station) {
        stationTitle.textContent = station.StationName;
        stationAddress.textContent = station.Address;
        stationImage.src = station.ImageUrl;
        stationImage.alt = station.StationName;
      } else {
        stationTitle.textContent = 'Station not found';
      }
    });
}

// GET the lockers for this station and display them as a grid
function loadLockers() {
  fetch(API + '/stations/' + stationId + '/lockers')
    .then(function (response) {
      return response.json();
    })
    .then(function (lockers) {
      showLockers(lockers);
    })
    .catch(function (error) {
      console.error('Error loading lockers:', error);
    });
}

// Take the list of lockers and turn them into coloured tiles
function showLockers(lockers) {
  lockerContainer.innerHTML = '';

  if (lockers.length === 0) {
    emptyMessage.classList.remove('hidden');
    return;
  }

  for (let i = 0; i < lockers.length; i++) {
    const locker = lockers[i];
    const colorClass = statusColors[locker.Status] || 'bg-gray-400';

    const tile = document.createElement('div');
    tile.className = 'locker-tile rounded-xl text-white text-center py-6 font-bold ' + colorClass;
    tile.innerHTML = `
      <p class="text-lg">${locker.LockerNumber}</p>
      <p class="text-xs font-normal mt-1">${locker.Size}</p>
    `;

    // Only available lockers can be clicked to start a reservation
    if (locker.Status === 'Available') {
      tile.onclick = function () {
        goToReserve(locker.LockerID, locker.LockerNumber);
      };
    }

    lockerContainer.appendChild(tile);
  }
}

// Go to the reservation form, passing the locker id + number in the URL
function goToReserve(lockerId, lockerNumber) {
  window.location.href = 'reserve.html?lockerId=' + lockerId + '&lockerNumber=' + lockerNumber;
}

// =============================================================
// RESERVATION MANAGEMENT (GET, PUT, DELETE)
// =============================================================


// 1. GET - Fetch reservation details and open popup modal
function manageReservation() {
  const codeInput = document.getElementById('resCodeInput');
  if (!codeInput) return;

  const code = codeInput.value.trim();
  if (!code) {
    alert('Please enter a reservation code.');
    return;
  }

  fetch(API + '/reservations/' + code)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Reservation not found or code invalid.');
      }
      return response.json();
    })
    .then(function (data) {
      currentReservationCode = code;

      const lockerName = data.LockerNumber || data.locker_number || data.LockerID || 'Reserved Locker';
      const mobile = data.MobileNumber || data.mobile || data.Phone || data.phone || '';

      const detailsEl = document.getElementById('modalDetails');
      if (detailsEl) {
        detailsEl.innerHTML = `
          <strong>Locker:</strong> ${lockerName}<br>
          <strong>Reservation Code:</strong> ${code}
        `;
      }

      // Pre-fill fields
      const mobileInput = document.getElementById('updateMobileInput');
      if (mobileInput) mobileInput.value = mobile;

      const passInput = document.getElementById('updatePasswordInput');
      if (passInput) passInput.value = '';

      // Open modal popup by removing 'hidden'
      const modal = document.getElementById('manageModal');
      if (modal) {
        modal.classList.remove('hidden');
      }
    })
    .catch(function (error) {
      console.error('Error fetching reservation:', error);
      alert(error.message);
    });
}

// 2. PUT - Save updated mobile number & PIN/password
function updateReservation() {
  if (!currentReservationCode) return;

  const newMobile = document.getElementById('updateMobileInput').value.trim();
  const newPassword = document.getElementById('updatePasswordInput').value.trim();

  if (!newMobile || !newPassword) {
    alert('Please enter both mobile number and PIN/password.');
    return;
  }

  const payload = {
    mobileNumber: newMobile, // Mobile number for middleware check & update
    pin: newPassword,        // Middleware explicitly expects 'pin'!
    newMobileNumber: newMobile,
    newPin: newPassword
  };

  fetch(API + '/reservations/' + currentReservationCode, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (data) {
          throw new Error(data.message || 'Failed to update reservation details.');
        });
      }
      return response.json();
    })
    .then(function () {
      alert('Mobile number and password updated successfully!');
      closeManageModal();
      loadLockers();
    })
    .catch(function (error) {
      alert(error.message);
    });
}

// 3. DELETE - Cancel reservation
function cancelReservation() {
  if (!currentReservationCode) return;

  const mobile = document.getElementById('updateMobileInput').value.trim();
  const password = document.getElementById('updatePasswordInput').value.trim();

  if (!mobile || !password) {
    alert('Please enter your mobile number and PIN/password.');
    return;
  }

  if (!confirm('Are you sure you want to cancel this reservation?')) return;

  fetch(API + '/reservations/' + currentReservationCode, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobileNumber: mobile,
      pin: password,
      password: password
    })
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (data) {
          throw new Error(data.message || 'Failed to cancel reservation.');
        });
      }
      return response.json();
    })
    .then(function () {
      alert('Reservation cancelled successfully!');
      
      // 1. Close the manage modal
      closeManageModal();

      // 2. Refresh locker list so A01 turns green (Available)
      if (typeof loadLockers === 'function') {
        loadLockers();
      } else {
        location.reload(); // Fallback hard-refresh
      }
    })
    .catch(function (error) {
      alert(error.message);
    });
}

// 4. Close modal popup
function closeManageModal() {
  const modal = document.getElementById('manageModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

loadStationDetails();
loadLockers();

// 5. Connect buttons to functions using addEventListener
document.addEventListener('DOMContentLoaded', function () {
  const manageBtn = document.getElementById('manageBtn');
  const updateResBtn = document.getElementById('updateResBtn');
  const cancelResBtn = document.getElementById('cancelResBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (manageBtn) manageBtn.addEventListener('click', manageReservation);
  if (updateResBtn) updateResBtn.addEventListener('click', updateReservation);
  if (cancelResBtn) cancelResBtn.addEventListener('click', cancelReservation);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeManageModal);
});