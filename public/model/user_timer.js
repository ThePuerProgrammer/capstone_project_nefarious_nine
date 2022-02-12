// Needed for timer display
import * as Elements from '../view/elements.js'

export class UserTimer {
    
    // CONSTRUCTORS
    //------------------------------------------------------------------------//
    constructor(data) {
        if (data != null) {
            // DATA FOR TIMER PROFILES HINT HINT
        } else {
            this.pingInterval = 1000; // ms
            this.timeInterval = 30; // min
            this.studyTime = 20; // min
            this.relaxTime = 10; // min
            this.isStudyMode = true;
            this.isPaused = false;
            this.interval = null;

            let time = this.studyTime * 60;
            this.minutes = parseInt(time / 60, 10);
            this.seconds = parseInt(time % 60, 10);
            if (this.seconds < 10) {
                this.seconds = "0" + this.seconds;
            }
            Elements.timerMinutesDisplay.innerHTML = this.minutes;
            Elements.timerSecondsDisplay.innerHTML = this.seconds;
        }
    }
    //------------------------------------------------------------------------//

    // ALTERING TIMER PARAMETERS
    //------------------------------------------------------------------------//
    setStudyMode(isStudyMode) {
        // value must be true or false
        this.isStudyMode = isStudyMode;
    }

    adjustTimeInterval(timeInterval) {
        this.timeInterval = timeInterval;
    }

    adjustStudyTime(studyTime) {
        this.studyTime = studyTime;
    }

    adjustRelaxTime(relaxTime) {
        this.relaxTime = relaxTime;
    }
    //------------------------------------------------------------------------//

    // STANDARD TIMER FUNCTIONS (START, PAUSE, RESET)
    //------------------------------------------------------------------------//
    startTimer() {
        // this section of the solution partially references code found here:
        // https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript
        let time;
        if (this.isPaused) {
            time = this.minutes * 60 + this.seconds - 1;
            this.isPaused = false;
        } else if (this.isStudyMode) {
            time = this.studyTime * 60 - 1;
        } else {
            time = this.relaxTime * 60 - 1;
        }

        this.interval = setInterval(() => {
            // i.e. 24 mins
            this.minutes = parseInt(time / 60, 10);

            // i.e. 36 seconds
            this.seconds = parseInt(time % 60, 10);

            // prepend the value with a '0' if value is less than 10
            this.minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
            this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;

            Elements.timerMinutesDisplay.innerHTML = this.minutes;
            Elements.timerSecondsDisplay.innerHTML = this.seconds;

            if (--time <= 0) {
                this.setStudyMode(!this.isStudyMode);
            }

        }, this.pingInterval);
    }

    pauseTimer() {
        this.isPaused = true;
        clearInterval(this.interval);
    }

    resetTimer() {
        clearInterval(this.interval);
        this.isPaused = false;
        let time = this.studyTime * 60;
        this.minutes = parseInt(time / 60, 10);
        this.seconds = parseInt(time % 60, 10);
        if (this.seconds < 10) {
            this.seconds = "0" + this.seconds;
        }
        Elements.timerMinutesDisplay.innerHTML = this.minutes;
        Elements.timerSecondsDisplay.innerHTML = this.seconds;
    }
    //------------------------------------------------------------------------//
};