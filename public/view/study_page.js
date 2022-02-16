import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Auth from "../controller/firebase_auth.js";

let count = 0; // rudimentary way to cycle trough flashcards in deck
let score = 0; // rudimentary way to keep track of user score

export function addEventListeners() {
  /*Elements.btnStudyDeck.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.STUDY);
        await study_page();
    });*/
}

// event listener for when STUDY button is pressed on /deck_page
export function studyFormSubmitEvent(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = e.target.docId.value;
    history.pushState(null, null, Routes.routePathname.DECK + "#" + docId);
    localStorage.setItem("deckPageDeckDocID", docId);
    await study_page();
  });
}

export async function study_page() {
  Elements.root.innerHTML = "";
  let html = "";

  let docId = localStorage.getItem("deckPageDeckDocID");
  let deck;
  try {
    deck = await FirebaseController.getDeckById(Auth.currentUser.uid, docId);
  } catch (e) {
    console.log(e);
  }

  html += `<h1 style="align: center">${deck.name}</h1>`;
  html += `<h4 style="align: center">${deck.subject}</h4>`;

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

  //console.log(count);
  let maxLength = flashcards.length;
  let flashcard = flashcards[count];
  //console.log(flashcard.question);
  html += buildStudyFlashcardView(flashcard);

  Elements.root.innerHTML += html;

  const formAnswerFlashcard = document.getElementById(
    Constant.htmlIDs.formAnswerFlashcard
  );

  // event listener for when ANSWER button is pushed on flashcard
  formAnswerFlashcard.addEventListener("submit", async (e) => {
    e.preventDefault();
    const answer = e.target.answer.value;
    //console.log(answer);
    // incrememnt count everytime ANSWER button is pushed
    count++;
    //console.log(maxLength);
    if (count < maxLength) {
      study_page(count);
      buildStudyFlashcardView(flashcard);
      checkAnswer(answer, flashcard);
    } else {
     // console.log("SCORE called");
      buildScoreView(deck, maxLength);
    }
  });
}

function buildStudyFlashcardView(flashcard) {
  let html = `<div class="study-flashcard-view"><form id="${Constant.htmlIDs.formAnswerFlashcard}">
  <div class="study-flashcard-question pomo-text-color-light">
    <h1>${flashcard.question}</h1>
  </div>
  <br>
  <br>`;

  // IF MULTIPLE CHOICE
  if (flashcard.isMultipleChoice) {
    for (let i = 0; i < flashcard.incorrectAnswers.length; ++i) {
      html += `
      <div class="form-check">
      <input class="form-check-input" type="radio" name="answer" id="flexRadioDefault1">
      <label class="form-check-label  pomo-text-color-light" for="flexRadioDefault1">
        ${flashcard.incorrectAnswers[i]}
      </label>
      </div>`;

    }
    html += `
    <div class="form-check">
    <input class="form-check-input" type="radio" name="answer" id="flexRadioDefault1">
    <label class="form-check-label  pomo-text-color-light" for="flexRadioDefault1">
      ${flashcard.answer}
    </label>
    </div>`;

  } else {
    html += `<div class="study-flashcard-answer pomo-text-color-light">
    <label class="form-label">Answer</label>
    <input type="answer" name="answer" class="form-control" id="flashcard-answer">
    <br>`;
  }

  html += `<button type="submit" class="btn btn-secondary pomo-bg-color-dark" style="float:right">Answer</button>
  </div>
  </form></div>`;

  return html;
}

function buildScoreView(deck, maxLength) {
  Elements.root.innerHTML = "";
  let html = "";
  //html +=  `Score View`;
  html += `<div class="study-flashcard-view pomo-text-color-light">
    <h1 style="align: center">Your score on: ${deck.name}</h1>
    <br>
    <br>
    <h4>Total ${score} / ${maxLength} </4></div>`;

  //console.log(score);

  Elements.root.innerHTML += html;
}

function checkAnswer(answer, flashcard) {
  let user_answer = answer.toLowerCase();
  let flashcard_answer = flashcard.answer.toLowerCase();

  //console.log(user_answer);
  //console.log(flashcard_answer);

  //let score = 0;

  // increment player score if answer is correct
  if (user_answer == flashcard_answer) {
    score++;
    console.log("correct answer");
  } else {
    //score--;
    console.log("incorrect answer");
  }
}
