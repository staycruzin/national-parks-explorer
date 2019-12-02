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


function formatQueryParams(params) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

    return queryString.join('&');
}

// Parses the latitude and longitude from a string and returns both values in an array
function parseLatitudeandLongitude(latLong) {
    let latLongParsed = latLong.replace(/lat:|long:/g, '').split(', ');

    return latLongParsed;
}

function backButtonClicked() {
    $( ".js-back-button" ).click(function() {
        $('#hiking-content').addClass('hidden');
        $('#campground-content').addClass('hidden');
        $('#detail-content').removeClass('hidden');
        window.scrollTo(0, 0);
    });
}

// Displays the data that was fetched from the National Parks Service API call
function displayCampgrounds(responseJson) {
    $('#camping-content-header').html(`${currentParkName} Campgrounds`);
    $('#campgrounds-list').empty();

    if (responseJson.data.length === 0) {
        $('#campgrounds-list').append(`
        <li class="center">
            <h3>No campgrounds found!</h3>
        </li>
    `);     
    }
    
    for (let i = 0; i < responseJson.data.length; i++) {
        $('#campgrounds-list').append(`
            <li class="center">
                <h3>${responseJson.data[i].name}</h3>
                <p>${responseJson.data[i].description}</p>
            </li>
        `);
    }

    $('#detail-content').addClass('hidden');
    $('#campground-content').removeClass('hidden');
}

// Calls the National Parks Service API and fetches a list of the campgrounds in the National Park that was selected
function getCampgrounds(currentParkCode) {
    const params = {
        parkCode: currentParkCode,
        api_key: NPS_API_KEY
    }

    const queryString = formatQueryParams(params);
    const url = NPS_URL + 'campgrounds?' + queryString;
    
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            displayCampgrounds(responseJson);
            window.scrollTo(0, 0);
        })
        .catch(err => {
            $('#campgrounds-list').empty();

            $('#campgrounds-list').append(`
            <li class="center">
                <p class="error-message">Something went wrong: ${err.message}</p>
            </li>
            `);

            $('#detail-content').addClass('hidden');
            $('#campground-content').removeClass('hidden');
        });
}

function campgroundsButtonClicked() {
    $('body').on('click', '.js-camp-button', function() {
        getCampgrounds(currentParkCode);
    });
}

// Displays the data that was fetched from the Hiking Project API call
function displayHikingTrails(responseJson) {
    $('#hiking-content-header').html(`${currentParkName} Hiking Trails`);
    $('#trails-list').empty();

    if (responseJson.trails.length === 0) {
        $('#trails-list').append(`
        <li class="center">
            <h3>No hiking trails found!</h3>
        </li>
    `);     
    }
    
    for (let i = 0; i < responseJson.trails.length; i++) {
        $('#trails-list').append(`
            <li class="center">
                <h3>${responseJson.trails[i].name}</h3>
                <p>${responseJson.trails[i].summary}</p>
                <a target="_blank" href="${responseJson.trails[i].url}">Click here to learn more!</a>
            </li>
        `);
    }

    $('#detail-content').addClass('hidden');
    $('#hiking-content').removeClass('hidden');
}

// Calls the Hiking Project API and fetches a list of the hiking trails in the National Park that was selected
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
    
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            displayHikingTrails(responseJson);
            window.scrollTo(0, 0);
        })
        .catch(err => {
            $('#trails-list').empty();

            $('#trails-list').append(`
            <li class="center">
                <p class="error-message">Something went wrong: ${err.message}</p>
            </li>
            `);

            $('#detail-content').addClass('hidden');
            $('#hiking-content').removeClass('hidden');
        });
}

function hikingTrailsButtonClicked() {
    $('body').on('click', '.js-hike-button', function() {
        getHikingTrails(latLong);
    });
}

// Formats the date string returned by the Weatherbit API call
function formatDate(dateString) {
    let dateArray = dateString.split('-');

    return dateArray[1] + '/' +  dateArray[2] + '/' + dateArray[0];
}

// Returns the 3 letter version of the day of the week from the date string returned by the Weatherbit API call
function getDayOfWeek(dateString) {
    const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let day = new Date(formatDate(dateString));

    return daysOfTheWeek[day.getDay()];
}

// Displays the data that was fetched from the Weatherbit API call
function displayWeather(responseJson) {
    for (let i = 0; i < responseJson.data.length; i++) {
        $('.daily-weather-container').append(`
            <div class="daily-weather">
                <p class="day"><strong>${getDayOfWeek(responseJson.data[i].datetime)}</strong></p>
                <img class="weather-icon" src="assets/weather-icons/${responseJson.data[i].weather.icon}.png" alt="${responseJson.data[i].weather.description}"/>
                <p class="temps"><span class="high">${responseJson.data[i].max_temp}&#176;</span> <span class="low">${responseJson.data[i].min_temp}&#176;</span></p>
            </div>
        `);
    }
}

// Calls the Weatherbit API and fetches the 5 day forecast for the National Park that was selected
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
        .catch(err => {
            $('.daily-weather-container').append(`
                <p class="error-message">Something went wrong: ${err.message}</p>
            `);
        });
}

// Displays the data that was fetched from the National Parks Service API call
function displayParkDetail(responseJson) {
    $('#detail-content').empty();
    
    $('#detail-content').append(`        
        <h2 class="merriweather center">${responseJson.data[0].fullName}</h2>
        <section id="park-image-container" class="detail-section">
            <img class="park-image" src="assets/park-images/${responseJson.data[0].parkCode}.jpg" alt="A picture of ${responseJson.data[0].fullName}"/>
        </section>

        <section id="basic-details" class="detail-section">
            <div class="state">
                <h3 class="merriweather">State(s)</h3>
                <p>${responseJson.data[0].states}</p>
            </div>
            <div class="description">
                <h3 class="merriweather">Description</h3>
                <p>${responseJson.data[0].description}</p>
            </div>
        </section>

        <section id="weather-details" class="detail-section">
            <div class="weather-forecast">
                <h3 class="merriweather">Five Day Forecast</h3>
                <div class="daily-weather-container detail-section">
                </div>
            </div>
            <br>
            <h3 class="merriweather">Weather Information</h3>
            <p>${responseJson.data[0].weatherInfo}</p> 
        </section>

        <section id="directions-and-more" class="detail-section">
            <div>
                <h3 class="merriweather">Directions Information</h3>
                <p>${responseJson.data[0].directionsInfo} More info <a target="_blank" href="${responseJson.data[0].directionsUrl}">here</a>.</p>
            </div>

            <div class="buttons-container">
                <button class="js-camp-button detail-button button" type="button" aria-controls="campground-content">Campgrounds</button>
                <button class="js-hike-button detail-button button" type="button" aria-controls="hiking-content">Hiking Trails</button>
            </div>
        </section>
    `);

    $('#hero-home-screen').addClass('hidden');
    $('#home-content').addClass('hidden');
    $('#hiking-content').addClass('hidden');
    $('#campground-content').addClass('hidden');
    $('#detail-screen-heading').removeClass('hidden');
    $('#detail-content').removeClass('hidden');
}

// Calls the National Parks Service API and fetches the relevant data for the National Park that was selected
function getParkDetail(parkCodeSelected) {
    currentParkCode = parkCodeSelected;

    const params = {
        parkCode: parkCodeSelected,
        api_key: NPS_API_KEY
    }

    const queryString = formatQueryParams(params);
    const url = NPS_URL + 'parks?' + queryString;

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
            window.scrollTo(0, 0);
        })
        .catch(err => {
            $('#detail-content').empty();
    
            $('#detail-content').append(` 
                <p class="error-message nps-error-message center">Something went wrong: ${err.message}</p>
            `);

            $('#hero-home-screen').addClass('hidden');
            $('#home-content').addClass('hidden');
            $('#hiking-content').addClass('hidden');
            $('#campground-content').addClass('hidden');
            $('#detail-screen-heading').removeClass('hidden');
            $('#detail-content').removeClass('hidden');
        });
}

// Collapses the Nav when it is open and the user clicks off of it.
function clickedOffNav() {
    $(document).click(function(e) {
         if (viewportWidth <= 1199 && $("#search").is(':visible')) {
              if ($(e.target).closest("#search").length === 0 && $(e.target).closest(".menu-button").length === 0) {
                   $( "#search" ).slideToggle( "slow");
                   $( ".close-button" ).hide();
                   $( ".open-button" ).show();
              }     
         }
    });
}

// Collapses the nav when the close menu button is clicked.
function closeMenuClicked() {
    $( ".close-button" ).click(function() {
         $( "#search" ).slideToggle( "slow");
         $( ".close-button" ).hide();
         $( ".open-button" ).show();
    });
}

// Expands the nav when the open menu button is clicked.
function openMenuClicked() {
    $( ".open-button" ).click(function() {
         $( "#search" ).slideToggle( "slow");
         $( ".open-button" ).hide();
         $( ".close-button" ).show();
    });
}

// Adjusts the nav bar based on the viewPort width.
function setNavBar() {
    if (viewportWidth <= 1199) {
         $(".open-button").show();
         $(".close-button").hide();
         $("#search").hide();
    } else {
         $("#search").show();
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

// Sets the initial viewportWidth and update viewportWidth whenever the viewport is resized.
function setViewportWidth() {
    viewportWidth = window.innerWidth;
}

function homeLinkClicked() {
    $('#home-link').click(function(event){
        event.preventDefault();
    
        $("#parks-list-home").select2("val", "0");
        $("#parks-list-detail").select2("val", "0");
    
        $('#hiking-content').addClass('hidden');
        $('#campground-content').addClass('hidden');
        $('#detail-content').addClass('hidden');
        $('#detail-screen-heading').addClass('hidden');
    
        $('#hero-home-screen').removeClass('hidden');
        $('#home-content').removeClass('hidden');
        window.scrollTo(0, 0);
    });
}

function nextLinkClicked() {
    $('#next-link').click(function(event){
        event.preventDefault();
        document.getElementById('home-content').scrollIntoView({behavior: 'smooth'});
    });
}

function watchForms() {
    $('#js-parks-form-home').submit(event => {
        event.preventDefault();
        const parkCodeSelected = $("#parks-list-home").val();
        
        if (parkCodeSelected !== "") {
            if (viewportWidth <= 1199) {
                $( "#search" ).hide();
                $( ".close-button" ).hide();
                $( ".open-button" ).show();
            }
            
            getParkDetail(parkCodeSelected);
        }
    });

    $('#js-parks-form-detail').change(function() {
        const parkCodeSelected = $("#parks-list-detail").val();

        if (parkCodeSelected !== "" && parkCodeSelected !== null) {
            if (viewportWidth <= 1199) {
                $( "#search" ).slideToggle( "fast");
                $( ".close-button" ).hide();
                $( ".open-button" ).show();
            }

            getParkDetail(parkCodeSelected);
        }
    });
}

// Populates the select options with the list of National Parks
function populateDropdown(elementID) {
    let parksList = document.getElementById(elementID);

    for (let i = 0; i < parksArray.length; i++) {
        let option = document.createElement("option");

        option.innerHTML = parksArray[i].parkName;
        option.value = parksArray[i].parkCode;

        parksList.appendChild(option);
    }
}

// Initializes the select elements
function initializeDropdowns() {
    populateDropdown("parks-list-home");
    populateDropdown("parks-list-detail");

    $('#parks-list-home').select2({
        placeholder: 'Select a National Park'
    });

    $('#parks-list-detail').select2({
        placeholder: 'Select a National Park'
    });
}

function onPageLoad() {
    initializeDropdowns();
    watchForms();
    nextLinkClicked();
    homeLinkClicked();
    setViewportWidth();
    viewportResized();
    setNavBar();
    openMenuClicked();
    closeMenuClicked();
    clickedOffNav();
    hikingTrailsButtonClicked();
    campgroundsButtonClicked();
    backButtonClicked();
}

$(onPageLoad);
