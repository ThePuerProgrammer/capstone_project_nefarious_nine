/* NOTE this is in /view because it is a persistent view component
 * while there are clear similarities for the setup of this component and pages,
 * there is a distinct difference for the way this component is treated */

import * as Elements from './elements.js'
import { UserTimer } from '../model/user_timer.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import { User } from '../model/user.js';


let timerStateClosed;
let userTimer;

// Important for the pausing logic so that min/sec values don't get messed up
let startButtonClicked = false;

export function addEventListeners() {

    /* For future work, the UserTimer class constructor can be called with
     * arguments that can be used as custom profiles! */ 
    userTimer = new UserTimer;

    // First time timer is open
    let firstTimeOpened = true;

    // For toggle state checking of the timer popup
    timerStateClosed = true;

    // TIMER POPUP
    //------------------------------------------------------------------------//
    Elements.pomoTimerToggleButton.addEventListener('click', async () => {
        if (timerStateClosed) {

            // raise button position 
            document.getElementById('pomo-timer-popup-div').style.height = "480px";

            // set default
            if (firstTimeOpened) {
                firstTimeOpened = false;
                let defaultTimerSetting = await FirebaseController.getUserTimerDefault(uid);
                let totalTime = defaultTimerSetting[0];
                let studyRelaxTime = defaultTimerSetting[1];
                console.log(totalTime);
                console.log(studyRelaxTime);
                Elements.totalTimeIntervalSlider.value = totalTime;
                Elements.studyRelaxIntervalSlider.value = studyRelaxTime;
            }


            // Initialize the thumb values and positions using absolute divs
            setThumb0ValueAndPosition();
            setThumb1ValueAndPosition();

            // make contents visible
            document.getElementById('play-controls').style.display = "flex";
            document.getElementById('pomo-timer-min-sec').style.display = "block";
            document.getElementById('pomo-timer-min-sec').childNodes[0].nextSibling.style.display = "flex";
            Elements.timerIntervalSettingsSliders.style.display = "block";
            Elements.timerModeDisplay.style.display = "block";
            Elements.timerModeDisplayToggle.style.display = "block";
            Elements.pomoTimerMakeSettingDefaultButton.style.display = "block";

            // flip button icon orientation ^ to v
            Elements.pomoTimerToggleButton.childNodes[0].nextSibling.childNodes[0].nextSibling.src = `./assets/images/collapse.svg`;

            // Add a drop shadow to the popup to give it some depth for standing out on the page
            document.getElementById('pomo-timer').style.filter = "drop-shadow(1px 2px 2px #2C1320)";

            // Make sure the display target is the enhanced timer
            userTimer.setMinimizedTimerDisplay(false);
            Elements.pomoTimerInnerDiv.innerHTML = "Pomobyte Timer";

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
            Elements.timerModeDisplayToggle.style.display = "none";

            // flip button icon orientation v to ^
            Elements.pomoTimerToggleButton.childNodes[0].nextSibling.childNodes[0].nextSibling.src = `./assets/images/expand.svg`;

            // Remove drop shadow from popup
            document.getElementById('pomo-timer').style.filter = "none";

            // If timer is playing, show in minized view!
            if (startButtonClicked) {
                userTimer.setMinimizedTimerDisplay(true);
            }

            // toggle timer state
            timerStateClosed = true;
        }
    });
    //------------------------------------------------------------------------//

    // TIMER INTERVAL ADJUSTMENT SLIDERS
    //------------------------------------------------------------------------//
    Elements.totalTimeIntervalSlider.addEventListener('input', () => {
        let click = new Audio('../assets/sounds/click.mp3');
        click.volume = 0.5;
        click.play();
        setThumb0ValueAndPosition();
    });

    Elements.studyRelaxIntervalSlider.addEventListener('input', () => {
        let click = new Audio('../assets/sounds/click.mp3');
        click.volume = 0.5;
        click.play();
        setThumb1ValueAndPosition();
    });
    //------------------------------------------------------------------------//

    // PLAYER BUTTONS
    //------------------------------------------------------------------------//
    Elements.pomoTimerStartButton.addEventListener('click', () => {
        let click = new Audio('../assets/sounds/start.mp3');
        click.volume = 0.5;
        click.play();
        if (!startButtonClicked) {
            userTimer.startTimer();
        }
        startButtonClicked = true;
    });

    Elements.pomoTimerPauseButton.addEventListener('click', () => {
        let click = new Audio('../assets/sounds/pause.mp3');
        click.volume = 0.5;
        click.play();
        if (startButtonClicked) {
            userTimer.pauseTimer();
            startButtonClicked = false;
        }
    });

    Elements.pomoTimerResetButton.addEventListener('click', () => {
        let click = new Audio('../assets/sounds/click.mp3');
        click.volume = 0.5;
        click.play();
        startButtonClicked = false;
        userTimer.resetTimer();
    });
    //------------------------------------------------------------------------//

    // DEFAULT BUTTON
    //------------------------------------------------------------------------//
    Elements.pomoTimerMakeSettingDefaultButton.addEventListener('click', async () => {
        let total = Elements.totalTimeIntervalSlider.value;
        let range = Elements.studyRelaxIntervalSlider.value;
        const key = User.defaultTimerSetting;
        const updateMap = {};
        updateMap[key] = [total, range];
        FirebaseController.updateUserInfo(firebase.auth().currentUser.uid, updateMap );
    });
    //------------------------------------------------------------------------//


}

function setThumb0ValueAndPosition() {
    let slider0Value = Elements.totalTimeIntervalSlider.value;
    let slider0Position = "";

    // Weird solution to set the positioning of the div on top of the thumb
    // It's S C I E N C E
    switch (slider0Value) {
        case "10": {
            slider0Position = "8.3%";
            break;
        }
        
        case "20": {
            slider0Position = "23.9%";
            break;
        }

        case "30": {
            slider0Position = "39%";
            break;
        }

        case "40": {
            slider0Position = "54%";
            break;
        }

        case "50": {
            slider0Position = "69.4%";
            break;
        }

        case "60": {
            slider0Position = "84.5%";
            break;
        }
    }

    Elements.timerThumb0.innerHTML = slider0Value;
    Elements.timerThumb0.style.left = slider0Position;

    let interval = Elements.studyRelaxIntervalSlider.value;
    let studyTime;
    let relaxTime;

    // Uses floating point values to create fractions of the total time
    switch (interval) {
        case "1": {
            studyTime = 0.8;
            relaxTime = 0.2;
            break;
        }

        case "2": {
            studyTime = 0.6;
            relaxTime = 0.4;
            break;
        }

        case "3": {
            studyTime = 0.4;
            relaxTime = 0.6;
            break;
        }

        case "4": {
            studyTime = 0.2;
            relaxTime = 0.8;
            break;
        }
    }

    // Update timer settings (if stopped will update display)
    userTimer.adjustStudyTime(studyTime);
    userTimer.adjustRelaxTime(relaxTime);
    // Set the timer values based on the slider values
    userTimer.adjustTimeInterval(slider0Value);
}

function setThumb1ValueAndPosition() {
    let slider1Value = Elements.studyRelaxIntervalSlider.value;
    let slider1Position = "";
    let thumb1Text = "";
    let studyTime;
    let relaxTime;

    // Uses floating point values to create fractions of the total time
    switch (slider1Value) {
        case "1": {
            slider1Position = "3.5%";
            thumb1Text = "80/20";
            studyTime = 0.8;
            relaxTime = 0.2;
            break;
        }
        
        case "2": {
            slider1Position = "28.6%";
            thumb1Text = "60/40";
            studyTime = 0.6;
            relaxTime = 0.4;
            break;
        }

        case "3": {
            slider1Position = "54.2%";
            thumb1Text = "40/60";
            studyTime = 0.4;
            relaxTime = 0.6;
            break;
        }

        case "4": {
            slider1Position = "79.5%";
            thumb1Text = "20/80";
            studyTime = 0.2;
            relaxTime = 0.8;
            break;
        }
    }

    // Update the thumb value
    Elements.timerThumb1.innerHTML = thumb1Text;
    Elements.timerThumb1.style.left = slider1Position;

    // update the timer values (if stopped it will update the display)
    userTimer.adjustStudyTime(studyTime);
    userTimer.adjustRelaxTime(relaxTime);
    userTimer.adjustTimeInterval(Elements.totalTimeIntervalSlider.value);
}