import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Auth from "../controller/firebase_auth.js";


let smartStudyOn = false; // To keep track of Smart Study Toggle
let count = 0; // rudimentary way to cycle trough flashcards in deck
let score = 0; // rudimentary way to keep track of user score
//let user_answer = []; //deck to store user answers

export function addEventListeners() {}

//REDUNDANT
// event listener for when STUDY button is pressed on /deck_page
/*export function studyFormSubmitEvent(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = e.target.docId.value;
    history.pushState(null, null, Routes.routePathname.STUDY + "#" + docId);
    localStorage.setItem("deckPageDeckDocID", docId);
    await study_page();
  });
}*/


// Only on entering study page 
export async function study_page() {
  Elements.root.innerHTML = "";
  let html = "";

  // Smart Study Checkbox
  
  // get DECK info from firebase
  let docId = localStorage.getItem("deckPageDeckDocID");
  let deck;
  try {
    deck = await FirebaseController.getUserDeckById(
      Auth.currentUser.uid,
      docId
      );
    } catch (e) {
      console.log(e);
    }
    
  html += `<h1 style="align: center">${deck.name}</h1>`;
  html += `<h4 style="align: center">${deck.subject}</h4>`;
  html += `
    <div class="form-check form-switch float-top-right">
      <input class="form-check-input" type="checkbox" role="switch"
      id="smart-study-checkbox">
      <label class="form-check-label" for="smart-study-checkbox">Smart Study</label>
    </div>
  `;
  
  let flashcard;
  let deckLength = 0;
  let flashcards;
  // get FLASHCARDS info from firebase
  try {
    flashcards = await FirebaseController.getFlashcards(
      Auth.currentUser.uid,
      docId
    );
    if (!flashcards) {
      html += "<h5>No flashcards found for this deck</h5>";
    }
  } 
  catch (e) {
    console.log(e);
  }

  // set deck length and build individual flashcard view
  deckLength = flashcards.length;
  flashcard = flashcards[count];

  html += buildStudyFlashcardView(flashcard);
  Elements.root.innerHTML += html;

  // create const for submit on ANSWER button
  const formAnswerFlashcard = document.getElementById(
    Constant.htmlIDs.formAnswerFlashcard
  );
  // For evenT listener further down!
  const smartStudyCheckbox = document.getElementById(
    Constant.htmlIDs.smartStudyCheckbox
  );

  // event listener for when ANSWER button is pushed on flashcard
  formAnswerFlashcard.addEventListener("submit", async (e) => {
    e.preventDefault();
    const answer = e.target.answer.value;

    // incremement count everytime ANSWER button is pushed
    count++;

    // while there's more flashcards in the deck, reload page to update flashcard view
    if (count < deckLength) {
      reload_study_page(deckLength, deck, flashcards);
      checkAnswer(answer, flashcard);
      buildStudyFlashcardView(flashcard);
    } else {
      checkAnswer(answer, flashcard);
      buildOverviewView(deck, deckLength);
    }
  });
  
  smartStudyCheckbox.addEventListener('change', async (e) => {
    reload_study_page(deckLength, deck, flashcards);
  });
}

// For each flashcard refresh
export async function reload_study_page(deckLength, deck, flashcards) {

  // Check if SmartStudy is on before removing elements
  smartStudyOn = document.getElementById(Constant.htmlIDs.smartStudyCheckbox).checked;

  Elements.root.innerHTML = "";
  let html = "";

  html += `<h1 style="align: center">${deck.name}</h1>`;
  html += `<h4 style="align: center">${deck.subject}</h4>`;
  html += `
    <div class="form-check form-switch float-top-right">
      <input class="form-check-input" type="checkbox" role="switch"
      id="smart-study-checkbox" ${smartStudyOn ? "checked" : "" }>
      <label class="form-check-label" for="smart-study-checkbox">Smart Study</label>
    </div>
  `;

  // set deck length and build individual flashcard view
  //let deckLength = flashcards.length;

  // This flashcard will be used if we are in Normal Study
  let flashcard = flashcards[count];

  if (smartStudyOn) {
    flashcard = await FirebaseController.getNextSmartStudyFlashcard(Auth.currentUser.uid, deck.docID, flashcards)

    html += `
      <div id="smart-study-streak-text-container" class="d-flex justify-content-center streak-container">
        <div class="row">
            <div class="col-8">
                <h3 class="streak">Streak: </h3>
            </div>
            <div class="col-4">
                <h3 id="streak-number-text" class="">0</h3>
            </div>
        </div>
      </div>
    `;
  }

  console.log("received flashcard");
  console.log(flashcard);

  if (Constant.DEV) {
    console.log(`Question: "${flashcard.question}"`);
    console.log(`Answer: "${flashcard.answer}"`);
  }
  
  html += buildStudyFlashcardView(flashcard);
  Elements.root.innerHTML += html;

  // create const for submit on ANSWER button
  const formAnswerFlashcard_reload = document.getElementById(
    Constant.htmlIDs.formAnswerFlashcard
  );
  // For evenT listener further down!
  const smartStudyCheckbox_reload = document.getElementById(
    Constant.htmlIDs.smartStudyCheckbox
  );

  // event listener for when ANSWER button is pushed on flashcard
  formAnswerFlashcard_reload.addEventListener("submit", async (e) => {
    e.preventDefault();
    const answer = e.target.answer.value;

    if (smartStudyOn) {
      let userAnsweredCorrectly = checkAnswer(answer, flashcard);
      let updatedFlashcardData;
      try {
        updatedFlashcardData = await FirebaseController.updateFlashcardData(Auth.currentUser.uid, localStorage.getItem("deckPageDeckDocID"), flashcard.docID, userAnsweredCorrectly);
      }
      catch (e) {
        if (Constant.DEV)
          console.log("Error updating data for flashcard");
      }

      // Get needed elements for displaying Streak
      const smartStudyStreakTextContainer = document.getElementById(Constant.htmlIDs.smartStudyStreakTextContainer);
      const streakNumberText = document.getElementById(Constant.htmlIDs.streakNumberText);

      console.log("User answered correctly", userAnsweredCorrectly);
      
      // Streak text: appear animation & update color to reflect answer
      streakNumberText.classList.add(userAnsweredCorrectly ? "streak-correct" : "streak-incorrect");
      console.log(streakNumberText.innerHTML);
      streakNumberText.innerHTML = updatedFlashcardData.streak;
      console.log(streakNumberText.innerHTML);
      console.log(updatedFlashcardData.streak);
      smartStudyStreakTextContainer.style.opacity = '100';

      sleep(700).then(() => { // sketchy but needed b/c reloading page for next flashcard. Allows user to see the streak for a moment going to next card
          // go to next flashcard
          reload_study_page(deckLength, deck, flashcards);
      });
      
      return;
    }
    // If smart study is on, we stop here

    // incremement count everytime ANSWER button is pushed
    count++;

    // while there's more flashcards in the deck, reload page to update flashcard view
    if (count < deckLength) {
      reload_study_page(deckLength, deck, flashcards);
      checkAnswer(answer, flashcard);
      buildStudyFlashcardView(flashcard);
    } 
    else {
      checkAnswer(answer, flashcard);
      buildOverviewView(deck, deckLength);
    }
  });

  smartStudyCheckbox_reload.addEventListener('change', async (e) => {
    reload_study_page(deckLength, deck, flashcards);
  });
}

// view when flashcards are being shown to study
function buildStudyFlashcardView(flashcard) {
  // console.log(count);
  let html = `<div class="study-flashcard-view overflow-auto"><form id="${Constant.htmlIDs.formAnswerFlashcard}">
  <div class="study-flashcard-question pomo-text-color-light">
    <h1>${flashcard.question}</h1>
  </div>`;


  // add flashcard.answer to flashcard.incorrectAnswers[i]

  // IF MULTIPLE CHOICE
  if (flashcard.isMultipleChoice) {
    for (let i = 0; i < flashcard.incorrectAnswers.length; ++i) {
      html += `
      <div class="study-flashcard-question pomo-text-color-light">
      <h4>• ${flashcard.incorrectAnswers[i]}</h4>
      </div>`;
    }
    html += `
    <div class="study-flashcard-question pomo-text-color-light">
    <h4>• ${flashcard.answer}</h4>
    </div>`;
  }

  html += `<div class="study-flashcard-answer pomo-text-color-light">
    <label class="form-label">Answer</label>
    <input type="answer" name="answer" class="form-control" required minlength="1" id="flashcard-answer">
    <br>`;

  html += `<button type="submit" class="btn btn-secondary pomo-bg-color-dark" style="float:right">Answer</button>
  </div>
  </form></div>`;

  return html;
}

// once entire deck has been studied, show the score view
/*function buildScoreView(deck, deckLength) {
  count = 0; // reset count 
  Elements.root.innerHTML = "";
  let html = "";
  html += `<div class="study-flashcard-view pomo-text-color-light">
    <h1 style="align: center">Your score on: ${deck.name}</h1>
    <br>
    <br>
    <h4>Total ${score} / ${deckLength} </4></div>`;

  //console.log(score);

  Elements.root.innerHTML += html;
} */

// Post-study OVERVIEW view
function buildOverviewView(deck, deckLength) {
  count = 0; // reset flashcard index count 
  //user_answers = []; // reset stored user answers
  Elements.root.innerHTML = "";
  let html = "";
  html += `<div class="study-flashcard-view pomo-text-color-light">
    <h1 style="align: center">${deck.name} Study Overview</h1>
    <br>
    <br>
    <h4>Total ${score} / ${deckLength} </4></div>`;

  //console.log(score);

  Elements.root.innerHTML += html;
}

// checks whether answer entered by user matches correct answer
function checkAnswer(answer, flashcard) {
  let user_answer = answer.toLowerCase();
  let flashcard_answer = flashcard.answer.toLowerCase();
  //user_answers

  let coins = 0;

  // increment player score if answer is correct
  if (user_answer == flashcard_answer) {
    score++;
    coins += 3
    console.log("correct answer");
    return true;
  } else {
    console.log("incorrect answer");
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
