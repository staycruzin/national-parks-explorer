'use strict';

/*
NPS API Key: xBRqVrGeEgzB8HiOJy82A69FLrhMQgd5FSX9fIH0
Hiking Project API Key: 7101314-2db36463e31e0bf91b2c49919876d9dc
Weatherbit API Key: 221b43c97f2b4875a8d27a00c7c7d105
*/

const PARK_DATA = Array.from(nationalParksData);

function displayParkDetail() {

}

function getParkDetail(parkCodeSelected) {
    console.log(parkCodeSelected);
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

    for (let i = 0; i < PARK_DATA.length; i++) {
        let option = document.createElement("option");

        option.innerHTML = PARK_DATA[i].parkName;
        option.value = PARK_DATA[i].parkCode;

        parksList.appendChild(option);
    }
}

function onPageLoad() {
    populateDropdown();
    initializeSelect2();
    watchForm();
}

$(onPageLoad);
