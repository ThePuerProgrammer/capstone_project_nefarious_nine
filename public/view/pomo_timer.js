/* NOTE this is in /view because it is a persistent view component
 * while there are clear similarities for the setup of this component and pages,
 * there is a distinct difference for the way this component is treated */

import * as Elements from './elements.js'

let timerStateClosed;
let timerButtonHeight;

export function addEventListeners() {

    // For toggle state checking
    timerStateClosed = true;
    timerButtonHeight = document.getElementById('pomo-timer-button-div').style.height;

    Elements.pomoTimerToggleButton.addEventListener('click', () => {
        if (timerStateClosed) {

            // raise button position 
            document.getElementById('pomo-timer-popup-div').style.height = "400px";

            // flip button icon orientation ^ to v
            Elements.pomoTimerToggleButton.childNodes[0].nextSibling.childNodes[0].nextSibling.src = `./assets/images/collapse.svg`;

            timerStateClosed = false;
        } else {

            // replace button at bottom of screen
            document.getElementById('pomo-timer-popup-div').style.height = "0";

            // flip button icon orientation v to ^
            Elements.pomoTimerToggleButton.childNodes[0].nextSibling.childNodes[0].nextSibling.src = `./assets/images/expand.svg`;

            timerStateClosed = true;
        }
    });
}