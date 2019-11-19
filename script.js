'use strict';

const parksArray = Array.from(nationalParksData);

const NPS_URL = 'https://developer.nps.gov/api/v1/';
const HIKING_PROJECT_URL = 'https://www.hikingproject.com/data/';
const WEATHERBIT_URL = 'https://api.weatherbit.io/v2.0/forecast/daily';

const NPS_API_KEY = 'xBRqVrGeEgzB8HiOJy82A69FLrhMQgd5FSX9fIH0';
const HIKING_PROJECT_API_KEY = '7101314-2db36463e31e0bf91b2c49919876d9dc';
const WEATHERBIT_API_KEY = '221b43c97f2b4875a8d27a00c7c7d105';

let viewportWidth = window.innerWidth;
let latLong;
let currentParkName;
let currentParkCode;

// Need to implement error handling code in all catch blocks instead of just a console log
// Figure out a way to get rid of the duplicate "parseLatitudeAndLongitude" calls?

function formatQueryParams(params) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

    return queryString.join('&');
}

function parseLatitudeandLongitude(latLong) {
    let latLongParsed = latLong.replace(/lat:|long:/g, '').split(', ');

    return latLongParsed;
}

function backButtonClicked() {
    
    $( ".js-back-button" ).click(function() {
        $('.hiking-content').addClass('hidden');
        $('.campground-content').addClass('hidden');
        $('.detail-content').removeClass('hidden');
    });
}

function displayCampgrounds(responseJson) {
    console.log(responseJson);
}

function getCampgrounds(currentParkCode) {
    const params = {
        parkCode: currentParkCode,
        api_key: NPS_API_KEY
    }

    const queryString = formatQueryParams(params);
    const url = NPS_URL + 'campgrounds?' + queryString;
    
    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            displayCampgrounds(responseJson);
        })
        .catch(error => {
            console.log(error.message);
        });
}

function campgroundsButtonClicked() {
    $('body').on('click', '.js-camp-button', function() {
        getCampgrounds(currentParkCode);
    });
}

function displayHikingTrails(responseJson) {
    console.log(responseJson);
    console.log(currentParkName);

    $('#hiking-content-header').html(`${currentParkName} Hiking Trails`);

    $('#trails-list').empty();
    
    for (let i = 0; i < responseJson.trails.length; i++) {
        $('#trails-list').append(`
            <li>
                <h3>${responseJson.trails[i].name}</h3>
                <p>${responseJson.trails[i].summary}</p>
                <p><a target="_blank" href="${responseJson.trails[i].url}">Click here to learn more!</a></p>
            </li>
        `);
    }

    $('.detail-content').addClass('hidden');
    $('.hiking-content').removeClass('hidden');
}

function getHikingTrails(latLong) {
    let latLongParsed = parseLatitudeandLongitude(latLong);
    let latitude = latLongParsed[0];
    let longitude = latLongParsed[1];

    const params = {
        lat: latitude,
        lon: longitude,
        maxDistance: 50,
        key: HIKING_PROJECT_API_KEY
    }

    const queryString = formatQueryParams(params);
    const url = HIKING_PROJECT_URL + 'get-trails?' + queryString;
    
    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            displayHikingTrails(responseJson);
        })
        .catch(error => {
            console.log(error.message);
        });
}

function hikingTrailsButtonClicked() {
    $('body').on('click', '.js-hike-button', function() {
        getHikingTrails(latLong);
    });
}

function formatDate(dateString) {
    let dateArray = dateString.split('-');

    return dateArray[1] + '/' +  dateArray[2] + '/' + dateArray[0];
}

function getDayOfWeek(dateString) {
    const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let day = new Date(formatDate(dateString));

    return daysOfTheWeek[day.getDay()];
}

function displayWeather(responseJson) {
    console.log(responseJson);

    for (let i = 0; i < responseJson.data.length; i++) {
        $('.daily-weather-container').append(`
            <div class="daily-weather">
                <p class="day"><strong>${getDayOfWeek(responseJson.data[i].datetime)}</strong></p>
                <img class="weather-icon" src="assets/weather-icons/${responseJson.data[i].weather.icon}.png" alt="${responseJson.data[i].weather.description}"/>
                <p class="temps">${responseJson.data[i].max_temp}&#176; / ${responseJson.data[i].min_temp}&#176;</p>
            </div>
        `);
    }
}

function getParkWeather(latLong) {
    let latLongParsed = parseLatitudeandLongitude(latLong);
    let latitude = latLongParsed[0];
    let longitude = latLongParsed[1];

    const params = {
        lat: latitude,
        lon: longitude,
        units: 'I',
        days: 5,
        key: WEATHERBIT_API_KEY
    }

    const queryString = formatQueryParams(params);
    const url = WEATHERBIT_URL + '?' + queryString;

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            displayWeather(responseJson);
        })
        .catch(error => {
            console.log(error.message);
        });
}

function displayParkDetail(responseJson) {
    console.log(responseJson);
    
    $('.detail-content').append(`        
        <h2>${responseJson.data[0].fullName}</h2>
        <section class="park-image-container detail-section">
            <img class="park-image" src="assets/park-images/${responseJson.data[0].parkCode}.jpg" alt="A picture of ${responseJson.data[0].fullName}"/>
        </section>

        <section class="basic-details detail-section">
            <div class="state">
                <h3>State(s)</h3>
                <p>${responseJson.data[0].states}</p>
            </div>
            <div class="description">
                <h3>Description</h3>
                <p>${responseJson.data[0].description}</p>
            </div>
        </section>

        <section class="weather-details detail-section">
            <div class="weather-forecast">
                <h3>Five Day Forecast</h3>
                <div class="daily-weather-container detail-section">
                </div>
            </div>
            <br>
            <h3>Weather Information</h3>
            <p>${responseJson.data[0].weatherInfo}</p> 
        </section>

        <section class="directions-and-more detail-section">
            <h3>Directions Information</h3>
            <p>${responseJson.data[0].directionsInfo} More info <a target="_blank" href="${responseJson.data[0].directionsUrl}">here</a>.</p>
            <div class="buttons-container">
                <button class="js-camp-button detail-button" type="button">Campgrounds</button>
                <button class="js-hike-button detail-button" type="button">Hiking Trails</button>
            </div>
        </section>
    `);

    $('.hero-home-screen').addClass('hidden');
    $('.home-content').addClass('hidden');
    $('.hiking-content').addClass('hidden');
    $('.campground-content').addClass('hidden');
    $('.detail-content').removeClass('hidden');
    $('.detail-screen-heading').removeClass('hidden');
}

function getParkDetail(parkCodeSelected) {
    currentParkCode = parkCodeSelected;

    const params = {
        parkCode: parkCodeSelected,
        api_key: NPS_API_KEY
    }

    const queryString = formatQueryParams(params);
    const url = NPS_URL + 'parks?' + queryString;

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            latLong = responseJson.data[0].latLong;
            currentParkName = responseJson.data[0].fullName;

            displayParkDetail(responseJson);
            getParkWeather(latLong);
        })
        .catch(error => {
            console.log(error.message);
        });
}

// Sets the viewportWidth whenever the viewport is resized.
function setViewportWidth() {
     viewportWidth = window.innerWidth;
}

// Adjusts the nav bar based on the viewPort width.
function setNavBar() {
     if (viewportWidth <= 1024) {
          $(".open-button").show();
          $(".close-button").hide();
          $(".search").hide();
     } else {
          $(".search").show();
          $(".open-button").hide();
          $(".close-button").hide();
     }
}

// Listens for viewport resize events and adjusts the nav bar and the viewportWidth accordingly.
function viewportResized() {
     window.addEventListener('resize', function () {
          setViewportWidth();
          setNavBar();
     });
}

// Expands the nav when the open menu button is clicked.
function openMenuClicked() {
     $( ".open-button" ).click(function() {
          $( ".search" ).slideToggle( "slow");
          $( ".open-button" ).hide();
          $( ".close-button" ).show();
     });
}

// Collapses the nav when the close menu button is clicked.
function closeMenuClicked() {
     $( ".close-button" ).click(function() {
          $( ".search" ).slideToggle( "slow");
          $( ".close-button" ).hide();
          $( ".open-button" ).show();
     });
}

// Collapses the Nav when it is open and the user clicks off of it.
function clickedOffNav() {
    $(document).click(function(e) {
         if (viewportWidth <= 1024 && $(".search").is(':visible')) {
              if ($(e.target).closest(".search").length === 0 && $(e.target).closest(".menu-button").length === 0) {
                   $( ".search" ).slideToggle( "slow");
                   $( ".close-button" ).hide();
                   $( ".open-button" ).show();
              }     
         }
    });
}

function watchForms() {
    $('.js-parks-form-home').submit(event => {
      event.preventDefault();
      const parkCodeSelected = $("#parks-list-home").val();

      if (parkCodeSelected !== "") {
        getParkDetail(parkCodeSelected);
      }
    });

    $('.js-parks-form-detail').change(function() {
        const parkCodeSelected = $("#parks-list-detail").val();
  
        if (parkCodeSelected !== "") {
            if (viewportWidth <= 1024) {
                $( ".search" ).slideToggle( "fast");
                $( ".close-button" ).hide();
                $( ".open-button" ).show();
            }

            $('.detail-content').empty();
            getParkDetail(parkCodeSelected);
        }
      });
  }

function populateDropdown(elementID) {
    let parksList = document.getElementById(elementID);

    for (let i = 0; i < parksArray.length; i++) {
        let option = document.createElement("option");

        option.innerHTML = parksArray[i].parkName;
        option.value = parksArray[i].parkCode;

        parksList.appendChild(option);
    }
}

function initializeDetailScreenDropdown() {
    populateDropdown("parks-list-detail");

    $('#parks-list-detail').select2({
        placeholder: 'Select a National Park'
    });
}

function initializeHomeScreenDropdown() {
    populateDropdown("parks-list-home");

    $('#parks-list-home').select2({
        placeholder: 'Select a National Park'
    });
}

function onPageLoad() {
    initializeHomeScreenDropdown();
    initializeDetailScreenDropdown();
    setViewportWidth();
    setNavBar();
    viewportResized();
    openMenuClicked();
    closeMenuClicked();
    clickedOffNav();
    watchForms();
    hikingTrailsButtonClicked();
    campgroundsButtonClicked();
    backButtonClicked()
}

$(onPageLoad);
