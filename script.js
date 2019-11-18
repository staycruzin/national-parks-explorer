'use strict';

const parksArray = Array.from(nationalParksData);

const NPS_URL = 'https://developer.nps.gov/api/v1/';
const HIKING_PROJECT_URL = 'https://www.hikingproject.com/data/';
const WEATHERBIT_URL = 'https://api.weatherbit.io/v2.0/forecast/daily';

const NPS_API_KEY = 'xBRqVrGeEgzB8HiOJy82A69FLrhMQgd5FSX9fIH0';
const HIKING_PROJECT_API_KEY = '7101314-2db36463e31e0bf91b2c49919876d9dc';
const WEATHERBIT_API_KEY = '221b43c97f2b4875a8d27a00c7c7d105';

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
    const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let day = new Date(formatDate(dateString));

    return daysOfTheWeek[day.getDay()];
}

function displayWeather(responseJson) {
    console.log(responseJson);

    $('.detail-content').append(`
        <p><strong>Current Weather:</strong></p>
        <div class="weather-forecast">
            <div class="daily-weather">
                <p><strong>${getDayOfWeek(responseJson.data[0].datetime)}</strong></p>
                <img class="weather-icon" src="assets/weather-icons/${responseJson.data[0].weather.icon}.png" alt="An image representing the weather on this day"/>
                <p>${responseJson.data[0].max_temp}&#176; / ${responseJson.data[0].min_temp}&#176;</p>
            </div>
            <div class="daily-weather">
                <p><strong>${getDayOfWeek(responseJson.data[1].datetime)}</strong></p>
                <img class="weather-icon" src="assets/weather-icons/${responseJson.data[1].weather.icon}.png" alt="An image representing the weather on this day"/>
                <p>${responseJson.data[1].max_temp}&#176; / ${responseJson.data[1].min_temp}&#176;</p>
            </div>
            <div class="daily-weather">
                <p><strong>${getDayOfWeek(responseJson.data[2].datetime)}</strong></p>
                <img class="weather-icon" src="assets/weather-icons/${responseJson.data[2].weather.icon}.png" alt="An image representing the weather on this day"/>
                <p>${responseJson.data[2].max_temp}&#176; / ${responseJson.data[2].min_temp}&#176;</p>
            </div>
            <div class="daily-weather">
                <p><strong>${getDayOfWeek(responseJson.data[3].datetime)}</strong></p>
                <img class="weather-icon" src="assets/weather-icons/${responseJson.data[3].weather.icon}.png" alt="An image representing the weather on this day"/>
                <p>${responseJson.data[3].max_temp}&#176; / ${responseJson.data[3].min_temp}&#176;</p>
            </div>
            <div class="daily-weather">
                <p><strong>${getDayOfWeek(responseJson.data[4].datetime)}</strong></p>
                <img class="weather-icon" src="assets/weather-icons/${responseJson.data[4].weather.icon}.png" alt="An image representing the weather on this day"/>
                <p>${responseJson.data[4].max_temp}&#176; / ${responseJson.data[4].min_temp}&#176;</p>
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
    $('.heading-detail-screen').removeClass('hidden');
    $('.detail-content').removeClass('hidden');
    
    $('.detail-content').html(
        `
        <h2>${responseJson.data[0].fullName}</h2>
        <img class="park-image" src="assets/park-images/${responseJson.data[0].parkCode}.jpg" alt="A picture of ${responseJson.data[0].fullName}"/>
        <p><strong>State(s):</strong> ${responseJson.data[0].states}</p>
        <p><strong>Description</strong>: ${responseJson.data[0].description}</p>
        <p><strong>Directions Info</strong>: ${responseJson.data[0].directionsInfo} More info <a target="_blank" href="${responseJson.data[0].directionsUrl}">here</a>.</p>
        <p><strong>Weather Info</strong>: ${responseJson.data[0].weatherInfo}</p>   `
    );
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

function watchForm() {
    $('.js-parks-form').submit(event => {
      event.preventDefault();
      const parkCodeSelected = $("#parks-list").val();

      if (parkCodeSelected !== "") {
        getParkDetail(parkCodeSelected);
      }
    });
  }


function initializeSelect2() {
    $('#parks-list').select2({
        placeholder: 'Select a National Park'
    });
}

function populateDropdown() {
    let parksList = document.getElementById("parks-list");

    for (let i = 0; i < parksArray.length; i++) {
        let option = document.createElement("option");

        option.innerHTML = parksArray[i].parkName;
        option.value = parksArray[i].parkCode;

        parksList.appendChild(option);
    }
}

function onPageLoad() {
    populateDropdown();
    initializeSelect2();
    watchForm();
}

$(onPageLoad);
