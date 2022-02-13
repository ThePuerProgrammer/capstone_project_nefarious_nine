/* NOTE this is in /view because it is a persistent view component
 * while there are clear similarities for the setup of this component and pages,
 * there is a distinct difference for the way this component is treated */

import * as Elements from './elements.js'
import { UserTimer } from '../model/user_timer.js'

let timerStateClosed;
let userTimer;

// Important for the pausing logic so that min/sec values don't get messed up
let startButtonClicked = false;

export function addEventListeners() {

    /* For future work, the UserTimer class constructor can be called with
     * arguments that can be used as custom profiles! */ 
    userTimer = new UserTimer;

    // For toggle state checking of the timer popup
    timerStateClosed = true;

    // TIMER POPUP
    //------------------------------------------------------------------------//
    Elements.pomoTimerToggleButton.addEventListener('click', () => {
        if (timerStateClosed) {

            // raise button position 
            document.getElementById('pomo-timer-popup-div').style.height = "450px";

            // make contents visible
            document.getElementById('play-controls').style.display = "flex";
            document.getElementById('pomo-timer-min-sec').style.display = "block";
            document.getElementById('pomo-timer-min-sec').childNodes[0].nextSibling.style.display = "flex";
            Elements.timerIntervalSettingsSliders.style.display = "block";
            Elements.timerModeDisplay.style.display = "block";

            // flip button icon orientation ^ to v
            Elements.pomoTimerToggleButton.childNodes[0].nextSibling.childNodes[0].nextSibling.src = `./assets/images/collapse.svg`;

            // Add a drop shadow to the popup to give it some depth for standing out on the page
            document.getElementById('pomo-timer').style.filter = "drop-shadow(1px 2px 2px #2C1320)";

            // toggle timer state
            timerStateClosed = false;
        } else {

            // replace button at bottom of screen
            document.getElementById('pomo-timer-popup-div').style.height = "0";

            // make contents invisible
            document.getElementById('play-controls').style.display = "none";
            document.getElementById('pomo-timer-min-sec').style.display = "none";
            document.getElementById('pomo-timer-min-sec').childNodes[0].nextSibling.style.display = "none";
            Elements.timerIntervalSettingsSliders.style.display = "none";
            Elements.timerModeDisplay.style.display = "none";

            // flip button icon orientation v to ^
            Elements.pomoTimerToggleButton.childNodes[0].nextSibling.childNodes[0].nextSibling.src = `./assets/images/expand.svg`;

            // Remove drop shadow from popup
            document.getElementById('pomo-timer').style.filter = "none";

            // toggle timer state
            timerStateClosed = true;
        }
    });
    //------------------------------------------------------------------------//

    // PLAYER BUTTONS
    //------------------------------------------------------------------------//
    Elements.pomoTimerStartButton.addEventListener('click', () => {
        if (!startButtonClicked) {
            userTimer.startTimer();
        }
        startButtonClicked = true;
    });

    Elements.pomoTimerPauseButton.addEventListener('click', () => {
        if (startButtonClicked) {
            userTimer.pauseTimer();
            startButtonClicked = false;
        }
    });

    Elements.pomoTimerResetButton.addEventListener('click', () => {
        startButtonClicked = false;
        userTimer.resetTimer();
    });
    //------------------------------------------------------------------------//
}