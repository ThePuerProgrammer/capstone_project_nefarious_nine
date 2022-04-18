// Needed for timer display
import * as Elements from '../view/elements.js'

// TODO studymode switch is still showing study mode time for a second!!

export class UserTimer {

    // CONSTRUCTORS
    //------------------------------------------------------------------------//
    constructor(data) {
        if (data != null) {
            // DATA FOR TIMER PROFILES HINT HINT
        } else {
            this.pingInterval = 1000;   // ms
            this.timeInterval = 30;     // min
            this.studyTime = .1;        // min
            this.relaxTime = .05;       // min
            this.isStudyMode;           // Study Mode or Relax Mode 
            this.isPaused = false;
            this.interval = null;       // the window timer object
            this.isPlaying = false;
            this.minimizedTimerDisplay = false;
            this.time = 0;              // the actual current countdown element
            this.flashCount = 0;
            this.maxFlashCount = 10;    // 10 flashes
            this.flashInterval = 100;   // ms

            this.audioRelaxTimer = new Audio('../assets/sounds/rta.mp3');
            this.audioStudyTimer = new Audio('../assets/sounds/sta.mp3');

            this.audioRelaxTimer.volume = 0.3;
            this.audioStudyTimer.volume = 0.3;

            this.updateDisplay();

            this.setStudyMode(true);
        }
    }
    //------------------------------------------------------------------------//

    // ALTERING TIMER PARAMETERS
    //------------------------------------------------------------------------//
    setStudyMode(isStudyMode) {
        // value must be true or false
        this.isStudyMode = isStudyMode;

        // This flips the display from Study mode to Relax mode and vice versa
        if (this.isStudyMode) {
            Elements.timerModeDisplayStudy.style.borderStyle = "solid";
            Elements.timerModeDisplayStudy.style.borderColor = "#2C1320"; 
            Elements.timerModeDisplayStudy.style.backgroundColor = "#A7ADC6";
            Elements.timerModeDisplayStudy.style.color = "#2C1320";

            Elements.timerModeDisplayRelax.style.color = "#A7ADC6";
            Elements.timerModeDisplayRelax.style.backgroundColor = "#56667A";
            Elements.timerModeDisplayRelax.style.borderStyle = "none";

        } else {
            Elements.timerModeDisplayRelax.style.borderStyle = "solid";
            Elements.timerModeDisplayRelax.style.borderColor = "#2C1320"; 
            Elements.timerModeDisplayRelax.style.backgroundColor = "#A7ADC6";
            Elements.timerModeDisplayRelax.style.color = "#2C1320";

            Elements.timerModeDisplayStudy.style.color = "#A7ADC6";
            Elements.timerModeDisplayStudy.style.backgroundColor = "#56667A";
            Elements.timerModeDisplayStudy.style.borderStyle = "none";
        }
    }

    adjustTimeInterval(timeInterval) {
        this.timeInterval = timeInterval;
        if (!this.isPlaying) {
            this.updateDisplay();
        }
    }

    adjustStudyTime(studyTime) {
        this.studyTime = studyTime;
    }

    adjustRelaxTime(relaxTime) {
        this.relaxTime = relaxTime;
    }

    setMinimizedTimerDisplay(minimizedTimerDisplay) {
        this.minimizedTimerDisplay = minimizedTimerDisplay;
        if (minimizedTimerDisplay) {
            // +1 is a janky bug fix, but it works
            this.updateDisplay(this.time + 1);
        }
    }
    //------------------------------------------------------------------------//

    // STANDARD TIMER FUNCTIONS (START, PAUSE, RESET)
    //------------------------------------------------------------------------//
    startTimer() {
        this.isPlaying = true;

        // this section of the solution partially references code found here:
        // https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript
        if (this.isPaused) {
            if (this.seconds == "00") {
                this.time = this.minutes * 60 - 1;
            } else {
                this.time = this.minutes * 60 + this.seconds - 1;
            }
            this.isPaused = false;
        } else if (this.isStudyMode) {
            this.time = this.studyTime * this.timeInterval * 60 - 1;
        } else {
            this.time = this.relaxTime * this.timeInterval * 60 - 1;
        }

        /* the setInterval function executes the function provided as its first
         * argument on a loop, pausing the length of the interval provided as
         * the second argument to the setInterval funtion. */ 
        this.interval = setInterval(() => {
            
            this.updateDisplay(this.time);

            if (--this.time < 0) {

                // Play notification tones
                if (this.isStudyMode) {
                    this.audioStudyTimer.play();
                } else {
                    this.audioRelaxTimer.play();
                }

                // Switch from study to relax or vise versa
                this.setStudyMode(!this.isStudyMode);
                clearInterval(this.interval);   // kill the setInterval loop

                if (this.minimizedTimerDisplay) {
                    this.flashMinimizedDisplay();
                }

                this.startTimer();
            }

        // the interval is the length of the pause. In our case, 1 second
        }, this.pingInterval);
    }

    pauseTimer() {
        this.isPaused = true;
        clearInterval(this.interval);
    }

    resetTimer() {
        this.isPlaying = false;
        this.setStudyMode(true);
        clearInterval(this.interval);
        this.isPaused = false;
        this.updateDisplay();
    }
    //------------------------------------------------------------------------//

    updateDisplay(time) {

        if (time == null) {
            time = this.studyTime * this.timeInterval * 60;
        }

        // i.e. 24 mins
        this.minutes = parseInt(time / 60, 10);

        // i.e. 36 seconds
        this.seconds = parseInt(time % 60, 10);

        // prepend the value with a '0' if value is less than 10
        this.minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
        this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;

        Elements.timerMinutesDisplay.innerHTML = this.minutes;
        Elements.timerSecondsDisplay.innerHTML = this.seconds;
        
        if (this.minimizedTimerDisplay) {
            let innerHTML = "";
            if (this.isStudyMode) {
                innerHTML += "Study [";
            } else {
                innerHTML += "Relax [";
            }

            innerHTML += this.minutes + ":" + this.seconds + "]";
            Elements.pomoTimerInnerDiv.innerHTML = innerHTML;
        }
    }

    flashMinimizedDisplay() {
        let flashInterval = setInterval(() => {

            if (this.flashCount % 2 == 0) {
                Elements.pomoTimerToggleButton.style.backgroundColor = "#A7ADC6";
                Elements.pomoTimerToggleButton.style.color = "#2C1320";
            } else {
                Elements.pomoTimerToggleButton.style.backgroundColor = "#5F4B66";
                Elements.pomoTimerToggleButton.style.color = "#A7ADC6";
            }

            this.flashCount += 1;
            if (this.flashCount >= this.maxFlashCount) {
                clearInterval(flashInterval);
                Elements.pomoTimerToggleButton.style.backgroundColor = "#5F4B66";
                Elements.pomoTimerToggleButton.style.color = "#A7ADC6";
                this.flashCount = 0;
            }
        }, this.flashInterval);
    }
};