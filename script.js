'use strict';

const parksArray = Array.from(nationalParksData);

const NPS_URL = 'https://developer.nps.gov/api/v1/';
const HIKING_PROJECT_URL = 'https://www.hikingproject.com/data/';
const WEATHERBIT_URL = 'https://api.weatherbit.io/v2.0/forecast/daily';

const NPS_API_KEY = 'xBRqVrGeEgzB8HiOJy82A69FLrhMQgd5FSX9fIH0';
const HIKING_PROJECT_API_KEY = '7101314-2db36463e31e0bf91b2c49919876d9dc';
const WEATHERBIT_API_KEY = '221b43c97f2b4875a8d27a00c7c7d105';

let viewportWidth = window.innerWidth;

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

function displayHikingTrails(responseJson) {
    console.log(responseJson);
}

function getHikingTrails(latLong) {
    let latLongParsed = parseLatitudeandLongitude(latLong);
    let latitude = latLongParsed[0];
    let longitude = latLongParsed[1];

    const params = {
        lat: latitude,
        lon: longitude,
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

    $('.weather-details').prepend(`
        
        <div class="weather-forecast">
            <h3>Five Day Forecast</h3>
            <div class="daily-weather-container">
                <div class="daily-weather">
                    <p class="day"><strong>${getDayOfWeek(responseJson.data[0].datetime)}</strong></p>
                    <img class="weather-icon" src="assets/weather-icons/${responseJson.data[0].weather.icon}.png" alt="${responseJson.data[0].weather.description}"/>
                    <p class="temps">${responseJson.data[0].max_temp}&#176; / ${responseJson.data[0].min_temp}&#176;</p>
                </div>
                <div class="daily-weather">
                    <p class="day"><strong>${getDayOfWeek(responseJson.data[1].datetime)}</strong></p>
                    <img class="weather-icon" src="assets/weather-icons/${responseJson.data[1].weather.icon}.png" alt="${responseJson.data[1].weather.description}"/>
                    <p class="temps">${responseJson.data[1].max_temp}&#176; / ${responseJson.data[1].min_temp}&#176;</p>
                </div>
                <div class="daily-weather">
                    <p class="day"><strong>${getDayOfWeek(responseJson.data[2].datetime)}</strong></p>
                    <img class="weather-icon" src="assets/weather-icons/${responseJson.data[2].weather.icon}.png" alt="${responseJson.data[2].weather.description}"/>
                    <p class="temps">${responseJson.data[2].max_temp}&#176; / ${responseJson.data[2].min_temp}&#176;</p>
                </div>
                <div class="daily-weather">
                    <p class="day"><strong>${getDayOfWeek(responseJson.data[3].datetime)}</strong></p>
                    <img class="weather-icon" src="assets/weather-icons/${responseJson.data[3].weather.icon}.png" alt="${responseJson.data[3].weather.description}"/>
                    <p class="temps">${responseJson.data[3].max_temp}&#176; / ${responseJson.data[3].min_temp}&#176;</p>
                </div>
                <div class="daily-weather">
                    <p class="day"><strong>${getDayOfWeek(responseJson.data[4].datetime)}</strong></p>
                    <img class="weather-icon" src="assets/weather-icons/${responseJson.data[4].weather.icon}.png" alt="${responseJson.data[4].weather.description}"/>
                    <p class="temps">${responseJson.data[4].max_temp}&#176; / ${responseJson.data[4].min_temp}&#176;</p>
                </div>
            </div>
        </div>
    `);
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

    $('.hero-home-screen').addClass('hidden');
    $('.home-content').addClass('hidden');
    $('.detail-screen-heading').removeClass('hidden');
    
    $('main').append(`
        <section class="detail-content">
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
                <br>
                <h3>Weather Information</h3>
                <p>${responseJson.data[0].weatherInfo}</p> 
            </section>

            <section class="directions-and-more detail-section">
                <h3>Directions Information</h3>
                <p>${responseJson.data[0].directionsInfo} More info <a target="_blank" href="${responseJson.data[0].directionsUrl}">here</a>.</p>
                <div class="buttons-container">
                    <button class="detail-button" type="button">Campgrounds</button>
                    <button class="detail-button" type="button">Hiking Trails</button>
                </div>
            </section>
        </section>  
    `);
}

function getParkDetail(parkCodeSelected) {
    const params = {
        parkCode: parkCodeSelected,
        api_key: NPS_API_KEY
    }

    const queryString = formatQueryParams(params);
    const url = NPS_URL + 'parks?' + queryString;
    let latLong;

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

    $('.js-parks-form-detail').submit(event => {
        event.preventDefault();
        const parkCodeSelected = $("#parks-list-detail").val();
  
        if (parkCodeSelected !== "") {
            if (viewportWidth <= 1024) {
                $( ".search" ).slideToggle( "fast");
                $( ".close-button" ).hide();
                $( ".open-button" ).show();
            }

            $('.detail-content').remove();
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
}

$(onPageLoad);
