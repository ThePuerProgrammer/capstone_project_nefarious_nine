import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Auth from "../controller/firebase_auth.js";

let count = 0; // rudimentary way to cycle trough flashcards in deck
let score = 0; // rudimentary way to keep track of user score

export function addEventListeners() {}

// event listener for when STUDY button is pressed on /deck_page
export function studyFormSubmitEvent(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = e.target.docId.value;
    history.pushState(null, null, Routes.routePathname.STUDY + "#" + docId);
    localStorage.setItem("deckPageDeckDocID", docId);
    await study_page();
  });
}

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
    
  let smartStudyIsOn = document.getElementById(Constant.htmlIDs.smartStudyCheckbox).checked;

  let flashcard;
  let deckLength = 0;
  if (smartStudyIsOn) { // Generate smart study flaschard
    // grab a flashcard using SRS data
  }
  else { // Generate normal study flashcard
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
    deckLength = flashcards.length;
    flashcard = flashcards[count];
  }
  
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

    if (smartStudyIsOn) {
      let isUserCorrect = checkAnswer(answer, flashcard);
      // update flashcard data
      // go next flashcard
      return;
    }
    // If smart study is on, we stop here

    // incremement count everytime ANSWER button is pushed
    count++;

    // while there's more flashcards in the deck, reload page to update flashcard view
    if (count < deckLength) {
      study_page(count);
      checkAnswer(answer, flashcard);
      buildStudyFlashcardView(flashcard);
    } 
    else {
      checkAnswer(answer, flashcard);
      buildScoreView(deck, deckLength);
    }
  });
}

// view when flashcards are being shown to study
function buildStudyFlashcardView(flashcard) {
  let html = `<div class="study-flashcard-view"><form id="${Constant.htmlIDs.formAnswerFlashcard}">
  <div class="study-flashcard-question pomo-text-color-light">
    <h1>${flashcard.question}</h1>
  </div>`;

  // IF MULTIPLE CHOICE
  if (flashcard.isMultipleChoice) {
    for (let i = 0; i < flashcard.incorrectAnswers.length; ++i) {
      html += `
      <div class="study-flashcard-question pomo-text-color-light">
      <h4>${flashcard.incorrectAnswers[i]}</h4>
      </div>`;
    }
    html += `
    <div class="study-flashcard-question pomo-text-color-light">
    <h4>${flashcard.answer}</h4>
    </div>`;
  }

  html += `<div class="study-flashcard-answer pomo-text-color-light">
    <label class="form-label">Answer</label>
    <input type="answer" name="answer" class="form-control" id="flashcard-answer">
    <br>`;

  html += `<button type="submit" class="btn btn-secondary pomo-bg-color-dark" style="float:right">Answer</button>
  </div>
  </form></div>`;

  return html;
}

// once entire deck has been studied, show the score view
function buildScoreView(deck, deckLength) {
  Elements.root.innerHTML = "";
  let html = "";
  //html +=  `Score View`;
  html += `<div class="study-flashcard-view pomo-text-color-light">
    <h1 style="align: center">Your score on: ${deck.name}</h1>
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

  //console.log(user_answer);
  //console.log(flashcard_answer);

  // increment player score if answer is correct
  if (user_answer == flashcard_answer) {
    score++;
    console.log("correct answer");
    return true;
  } else {
    console.log("incorrect answer");
    return false;
  }
}
