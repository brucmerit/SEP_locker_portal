// Grab the HTML elements we need to work with
const stationContainer = document.getElementById('stationContainer');
const loadingMessage = document.getElementById('loadingMessage');
const emptyMessage = document.getElementById('emptyMessage');
const heroImage = document.getElementById('heroImage');


// ---------------- Station list ----------------

// GET all stations from the API and display them as cards
function loadStations() {
  fetch(API + '/stations')
    .then(function (response) {
      return response.json();
    })
    .then(function (stations) {
      loadingMessage.classList.add('hidden');
      showStations(stations);
    })
    .catch(function (error) {
      loadingMessage.textContent = 'Could not load stations. Is the API running?';
      console.error('Error loading stations:', error);
    });
}

// Take the list of stations and turn them into cards, each with a photo
function showStations(stations) {
  stationContainer.innerHTML = ''; // clear out whatever was there before

  if (stations.length === 0) {
    emptyMessage.classList.remove('hidden');
    return;
  }

  for (let i = 0; i < stations.length; i++) {
    const station = stations[i];

    const card = document.createElement('div');
    card.className = 'station-card bg-white rounded-2xl shadow overflow-hidden cursor-pointer';
    card.onclick = function () {
      goToStation(station.StationID);
    };

    const availabilityColor = station.AvailableLockers > 0 ? 'text-green-600' : 'text-red-600';

    card.innerHTML = `
      <div class="h-40 w-full overflow-hidden">
      <img src="${UPLOADS_BASE}${station.ImageUrl}" alt="${station.StationName}" class="w-full h-full object-cover" />
      </div>
      <div class="p-5">
        <h3 class="font-bold text-lg mb-1">${station.StationName}</h3>
        <p class="text-slate-500 text-sm mb-3">${station.Address}</p>
        <p class="font-semibold ${availabilityColor}">
          ${station.AvailableLockers}/${station.TotalLockers} available
        </p>
      </div>
    `;

    stationContainer.appendChild(card);
  }
}

// Go to the station detail page, passing the station id in the URL
function goToStation(stationId) {
  window.location.href = 'station.html?stationId=' + stationId;
}

// ---------------- Hero banner upload ----------------

// Show the current hero image (if one has been uploaded before)
function loadHeroImage() {
  fetch(API + '/upload/hero')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.imageUrl) {
        heroImage.src = UPLOADS_BASE + data.imageUrl + '?t=' + Date.now(); // cache-bust
        heroImage.classList.remove('hidden');
      }
    })
    .catch(function (error) {
      console.error('Error loading hero image:', error);
    });
};


// Kick things off when the page loads
loadStations();
loadHeroImage();
