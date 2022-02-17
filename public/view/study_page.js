import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Auth from "../controller/firebase_auth.js";

let count = 0; // rudimentary way to cycle trough flashcards in deck
let score = 0; // rudimentary way to keep track of user score
let user_answers = []; //array of user_history

export function addEventListeners() {

    /*form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const docId = e.target.docId.value;
      history.pushState(null, null, Routes.routePathname.STUDY + "#" + docId);
      localStorage.setItem("deckPageDeckDocID", docId);
      await study_page();
    });*/
  
  //REDUNDANT
  // event listener for when STUDY button is pressed on /deck_page
  /*export function studyFormSubmitEvent(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = e.target.docId.value;
    history.pushState(null, null, Routes.routePathname.STUDY + "#" + docId);
    localStorage.setItem("deckPageDeckDocID", docId);
    await study_page();
  });*/
}

export async function study_page() {
  Elements.root.innerHTML = "";
  let html = "";

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

  // get FLASHCARDS info from firebase
  let flashcards;
  try {
    flashcards = await FirebaseController.getFlashcards(
      Auth.currentUser.uid,
      docId
    );
    if (!flashcards) {
      html += "<h5>No flashcards found for this deck</h5>";
    }
  } catch (e) {
    console.log(e);
  }

  // set deck length and build individual flashcard view
  let deckLength = flashcards.length;
  let flashcard = flashcards[count];
  html += buildStudyFlashcardView(flashcard);

  Elements.root.innerHTML += html;

  // create const for submit on ANSWER button
  const formAnswerFlashcard = document.getElementById(
    Constant.htmlIDs.formAnswerFlashcard
  );

  // event listener for when ANSWER button is pushed on flashcard
  formAnswerFlashcard.addEventListener("submit", async (e) => {
    e.preventDefault();
    const answer = e.target.answer.value;
    console.log(answer);

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
}

// Added a reload func to avoid querying firebase everytime a new flashcard is displayed
export function reload_study_page(deckLength, deck, flashcards) {
  Elements.root.innerHTML = "";
  let html = "";

  html += `<h1 style="align: center">${deck.name}</h1>`;
  html += `<h4 style="align: center">${deck.subject}</h4>`;

  // build individual flashcard view
  let flashcard = flashcards[count];
  html += buildStudyFlashcardView(flashcard);

  Elements.root.innerHTML += html;

  // create const for submit on ANSWER button
  const formAnswerFlashcard = document.getElementById(
    Constant.htmlIDs.formAnswerFlashcard
  );

  // event listener for when ANSWER button is pushed on flashcard
  formAnswerFlashcard.addEventListener("submit", async (e) => {
    e.preventDefault();
    const answer = e.target.answer.value;
    console.log(answer);

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
}

// view when flashcards are being shown to study
function buildStudyFlashcardView(flashcard) {
  console.log(count);
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
export async function buildScoreView(deck, deckLength) {
  user_answers = []; // reset stored user answers
  count = 0; // reset count
  Elements.root.innerHTML = "";
  let html = "";
  html += `<div class="study-flashcard-view overflow-auto pomo-text-color-light">
    <h1 style="align: center">Your score on: ${deck.name}</h1>
    <br>
    <br>
    <h4>Total ${score} / ${deckLength} </4></div>`;

  //console.log(score);

  Elements.root.innerHTML += html;
}

// Post-study OVERVIEW view
function buildOverviewView(deck, deckLength) {
  Elements.root.innerHTML = "";
  let html = "";
  html += `<div class="study-flashcard-view overflow-auto pomo-text-color-light">
    <h1 style="align: center">${deck.name} Study Overview</h1>
    <br>
    <ul class="list-group list-group-flush list-group-numbered">`;

  // loop through each user answer
  for (let i = 0; i < user_answers.length; i++) {
    html += `<li class="list-group-item pomo-text-color-light pomo-bg-color-dark "> ${user_answers[i].answer}`;
    // If user answer is CORRECT show answer with checkmark
    if (user_answers[i].correct) {
      html += `<span> <img src="./assets/images/check_green_24dp.svg" alt="Correct" width="24"
      height="24"></span></li>`;
    }
    // If user answer is INCORRECT show answer entered, ex, and correct answer
    else {
      html += `<span class = "correct-answer pomo-text-color-md"> <img src="./assets/images/close_red_24dp.svg" alt="Incorrect" width="24"
      height="24"> ${user_answers[i].flashcard}</span></li>`;
    }
  }

  html += `
  </ul>
  <br>
  <h4>Score: ${score} / ${deckLength} Coins Earned: </h4>
  </div>
  </div>`;

  Elements.root.innerHTML += html;
  user_answers = []; // reset stored user answers
  count = 0; // reset count
}

// checks whether answer entered by user matches correct answer
function checkAnswer(answer, flashcard) {
  let user_history = {}; // object to store user_answer, bool correct
  let user_answer = answer.toLowerCase();
  let flashcard_answer = flashcard.answer.toLowerCase();
  user_history.answer = user_answer;

  let coins = 0;

  // increment player score if answer is correct
  if (user_answer == flashcard_answer) {
    score++;
    coins += 3;
    user_history.correct = true;
  } else {
    user_history.correct = false;
    user_history.flashcard = flashcard_answer;
  }

  user_answers.push(user_history);
}
