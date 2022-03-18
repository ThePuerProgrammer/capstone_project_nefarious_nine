import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Auth from "../controller/firebase_auth.js";
import * as DeckPage from './deck_page.js'


let smartStudyOn = false; // To keep track of Smart Study Toggle
let count = 0; // rudimentary way to cycle trough flashcards in deck
let score = 0; // rudimentary way to keep track of user score
let start_coins; // how many coins the user starts out w
let coins = 0; // keep track of coins earned
let user_answers = []; //array of user_history
let skipFlashcardRefresh = false;

export function addEventListeners() { }


// Only on entering study page 
export async function study_page() {
  reset(); // start by resetting globals

  Elements.root.innerHTML = "";
  let html = "";
  let deckDocId = localStorage.getItem("deckPageDeckDocID");
  let isClassDeck = localStorage.getItem('isClassDeck');
  // get COINS from firebase

  try {
    coins = await FirebaseController.getCoins(Auth.currentUser.uid);
    start_coins = coins;
  } catch (e) {
    console.log(e);
  }

  // get DECK info from firebase

  let deck;
  if (isClassDeck == "false") {
    try {
      deck = await FirebaseController.getUserDeckById(Auth.currentUser.uid, deckDocId);
      if (!deck) {
        html += "<h5>Deck not found!</h5>";
      }
    } catch (e) {
      console.log(e);
    }
  } else {
    try {
      deck = await FirebaseController.getClassDeckByDocID(isClassDeck, deckDocId);
      if (!deck) {
        html += "<h5>Deck not found!</h5>";
      }
    } catch (e) {
      console.log(e);
    }

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
  html += `
    <div id="smart-study-popup-text-container" class="d-flex justify-content-center streak-container">
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

  let flashcard;
  let deckLength = 0;
  let flashcards;
  // get FLASHCARDS info from firebase
  if (deck.isClassDeck == "false" || deck.isClassDeck == false) {
    try {
      flashcards = await FirebaseController.getFlashcards(
        Auth.currentUser.uid,
        deckDocId
      );
      if (flashcards.length == 0) {
        html += "<h5>No flashcards found for this deck</h5>";
      }
    }
    catch (e) {
      console.log(e);
    }
  } else {
    try {
      flashcards = await FirebaseController.getClassroomFlashcards(isClassDeck, deckDocId);
      if (flashcards.length == 0) {
        html += "<h5>No flashcards found for this deck</h5>";
      }
    }
    catch (e) {
      console.log(e);
    }

  }

  // set deck length and build individual flashcard view
  deckLength = flashcards.length;
  flashcard = flashcards[count];

  if (smartStudyOn) {
    if (deck.isClassDeck == "false" || deck.isClassDeck == false) {
      flashcard = await FirebaseController.getNextSmartStudyFlashcard(Auth.currentUser.uid, deck.docID, flashcards);
    } else {
      flashcard = await FirebaseController.getNextClassSmartStudyFlashcard(deck.isClassDeck, deck.docID, flashcards)
    }
  }

  html += buildStudyFlashcardView(flashcard);
  Elements.root.innerHTML += html;

  // create const for submit on ANSWER button
  const formAnswerFlashcard = document.getElementById(
    Constant.htmlIDs.formAnswerFlashcard
  );
  const smartStudyCheckbox = document.getElementById(
    Constant.htmlIDs.smartStudyCheckbox
  );
  const smartStudyPopupTextContainer = document.getElementById(
    Constant.htmlIDs.smartStudyPopupTextContainer
  );
  const studyFlashcardAnswer = document.getElementById(
    Constant.htmlIDs.studyFlashcardAnswer
  );

  smartStudyCheckbox.addEventListener('change', async (e) => {
    smartStudyPopupTextContainer.innerHTML = `
      <div class="row">
        <div class="col-10">
            <h3 class="streak">Regular Study: </h3>
        </div>
        <div class="col-2">
            <h3 id="smart-study-indicator" class=""></h3>
        </div>
      </div>
    `;

    const smartStudyIndicator = document.getElementById(
      Constant.htmlIDs.smartStudyIndicator
    );

    skipFlashcardRefresh = true;

    smartStudyOn = smartStudyCheckbox.checked;
    if (smartStudyOn) {
      smartStudyIndicator.classList.add("streak-incorrect");
      smartStudyIndicator.classList.remove("streak-correct");
      smartStudyIndicator.innerHTML = "Paused";
      if (deck.isClassDeck == "false" || deck.isClassDeck == false) {
        flashcard = await FirebaseController.getNextSmartStudyFlashcard(Auth.currentUser.uid, deck.docID, flashcards);
      } else {
        flashcard = await FirebaseController.getNextClassSmartStudyFlashcard(deck.isClassDeck, deck.docID, flashcards);
      }
      formAnswerFlashcard.innerHTML = buildStudyFlashcardView(flashcard);
      smartStudyPopupTextContainer.style.opacity = '100';
    }
    else { // Smart Study Off
      smartStudyIndicator.classList.add("streak-correct");
      smartStudyIndicator.classList.remove("streak-incorrect");
      smartStudyIndicator.innerHTML = "Resumed";
      flashcard = flashcards[count]; // Go back to Normal Study
      formAnswerFlashcard.innerHTML = buildStudyFlashcardView(flashcard);
      smartStudyPopupTextContainer.style.opacity = '100';
    }
  });

  smartStudyPopupTextContainer.addEventListener('transitionend', (e) => {
    if (smartStudyPopupTextContainer.style.opacity == '0') {
      if (skipFlashcardRefresh) {
        skipFlashcardRefresh = false;
        return;
      }

      formAnswerFlashcard.innerHTML = buildStudyFlashcardView(flashcard);
      studyFlashcardAnswer.value = "";
    }
    else {
      smartStudyPopupTextContainer.style.opacity = '0';
    }
  });


  // event listener for when ANSWER button is pushed on flashcard
  formAnswerFlashcard.addEventListener("submit", async (e) => {
    e.preventDefault();
    const answer = e.target.answer.value;
    const isClassDeck = localStorage.getItem('isClassDeck');
    // === SMART STUDY ===
    if (smartStudyOn) {
      let userAnsweredCorrectly = checkAnswer(answer, flashcard);
      let updatedFlashcardData;
      if (isClassDeck == "false" || isClassDeck == false) {
        try {
          updatedFlashcardData = await FirebaseController.updateFlashcardData(Auth.currentUser.uid, localStorage.getItem("deckPageDeckDocID"), flashcard.docID, userAnsweredCorrectly);
        }
        catch (e) {
          if (Constant.DEV)
            console.log("Error updating data for flashcard");
        }
      } else {
        try {
          updatedFlashcardData = await FirebaseController.updateClassFlashcardData(isClassDeck, localStorage.getItem("deckPageDeckDocID"), flashcard.docID, userAnsweredCorrectly);
        }
        catch (e) {
          if (Constant.DEV)
            console.log("Error updating data for flashcard");
        }

      }


      // updating popup contents to have streak notifcation
      smartStudyPopupTextContainer.innerHTML = `
        <div class="row">
            <div class="col-8">
                <h3 class="streak">Streak: </h3>
            </div>
            <div class="col-4">
                <h3 id="smart-study-indicator" class="">0</h3>
            </div>
        </div>
      `;

      // Get needed elements for displaying Streak
      const smartStudyIndicator = document.getElementById(Constant.htmlIDs.smartStudyIndicator);

      // Update
      smartStudyIndicator.classList.remove(userAnsweredCorrectly ? "streak-incorrect" : "streak-correct"); // remove old score styling
      smartStudyIndicator.classList.add(userAnsweredCorrectly ? "streak-correct" : "streak-incorrect"); // add new score styling
      smartStudyIndicator.innerHTML = updatedFlashcardData.streak;

      // Update next flashcard
      if (isClassDeck == "false" || isClassDeck == false) {
        try {
          flashcard = await FirebaseController.getNextSmartStudyFlashcard(Auth.currentUser.uid, deck.docID, flashcards);
        }
        catch (e) {
          if (Constant.DEV)
            console.log("Error getting next smart study flashcard");
        }
      } else {
        try {
          flashcard = await FirebaseController.getNextClassSmartStudyFlashcard(isClassDeck, deck.docID, flashcards);
        }
        catch (e) {
          if (Constant.DEV)
            console.log("Error getting next smart study flashcard");
        }

      }

      // When transition ends, we set opacity to 0. When "set to 0" 
      //    transition ends, we load the next card.
      //    Setting opacity to 100 leads to an event listener 'transitionend' that loads the next card
      smartStudyPopupTextContainer.style.opacity = '100'; // Streak text appear transition      
      return;
    }

    // === NORMAL STUDY ===

    // incremement count everytime ANSWER button is pushed
    count++;

    // while there's more flashcards in the deck, update flashcard view
    if (count < deckLength) {
      checkAnswer(answer, flashcard);
      flashcard = flashcards[count];

      document.getElementById(Constant.htmlIDs.formAnswerFlashcard).innerHTML =
        buildStudyFlashcardView(flashcard);
      e.target.reset();
    } else {
      checkAnswer(answer, flashcard);
      document.getElementById(Constant.htmlIDs.smartStudyCheckbox).disabled = true;
      try {
        await FirebaseController.updateCoins(Auth.currentUser.uid, coins);
      }
      catch (e) {
        if (Constant.DEV)
          console.log("Error updating user's coins", e);
      }
      document.getElementById(Constant.htmlIDs.formAnswerFlashcard).innerHTML = buildOverviewView(deck, deckLength);
    }
  });
}

// view when flashcards are being shown to STUDY
function buildStudyFlashcardView(flashcard) {
  let html = `<div class="study-flashcard-view overflow-auto"><form id="${Constant.htmlIDs.formAnswerFlashcard}">
  <div class="study-flashcard-question pomo-text-color-light">`;

  if (flashcard.questionImageURL != "N/A") {
    html += `<img src="${flashcard.questionImageURL}" style="width: 200px; height: 200px" class="center">`;
  }

  html += `<h1 class="flashcard-question">${flashcard.question}</h1>
  </div>`;

  if (flashcard.answerImageURL != "N/A") {
    html += `<img src="${flashcard.answerImageURL}" style="width: 200px; height: 200px" class="center">`;
  }

  // IF MULTIPLE CHOICE
  if (flashcard.isMultipleChoice) {
    for (let i = 0; i < flashcard.incorrectAnswers.length; ++i) {
      html += `
      <div class="study-flashcard-multiple pomo-text-color-light">
      <h4 class="flashcard-multiple">${flashcard.incorrectAnswers[i]}</h4>
      </div>`;
    }
    html += `
    <div class="study-flashcard-answer pomo-text-color-light">
    <h4 class="flashcard-answer">${flashcard.answer}</h4>
    </div>`;
  }

  html += `<div class="study-flashcard-answer pomo-text-color-light">
    <label class="form-label">Answer</label>
    <input type="answer" name="answer" class="form-control" required minlength="1" id="study-flashcard-answer" autocomplete="off" autofocus>
    <br>`;

  html += `<button type="submit" class="btn btn-secondary pomo-bg-color-dark" style="float:right">Answer</button>
  </div>
  </form>
  </div>`;

  console.log(flashcard.question);
  return html;
}

// Post-study OVERVIEW view
function buildOverviewView(deck, deckLength) {
  let html = "";
  html += `<div class="study-flashcard-view overflow-auto pomo-text-color-light" id="${Constant.htmlIDs.overrideFlashcardBtn}">
    <center><h1>${deck.name} Study Overview</h1></centered>
    <br>
    <ul class="list-group list-group-flush list-group-numbered" role="group">`;

  // loop through each user answer
  for (let i = 0; i < user_answers.length; i++) {
    html += `
    <li class="list-group-item pomo-text-color-light pomo-bg-color-dark"> ${user_answers[i].answer}`;
    // If user answer is CORRECT show answer with checkmark
    if (user_answers[i].correct) {
      html += `<span> <img src="./assets/images/check_green_24dp.svg" alt="Correct" width="24"
      height="24"></span>
      </li>`;
    }
    // If user answer is INCORRECT show answer entered, ex, correct answer, and override button
    else {
      html += `<span class = "correct-answer pomo-text-color-md"> 
      <img src="./assets/images/close_red_24dp.svg" alt="Incorrect" width="28"
      height="28"> ${user_answers[i].flashcard} 
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${i}" id="override">
        <label class="form-check-label" for="override">Override: I was correct</label>
        </div>
      </span>
      </li>`;
    }
  }

  html += `
  </ul>
  <br>
  <centered><h4>Score: ${score} / ${deckLength}</h4>
  <h4>Coins Earned: ${coins - start_coins}</h4>
  <h4>Total Coins: ${coins}</h4></centered>
  <br>
  <form class="form-return-to-decks" method="post">
    <input type="hidden" name="docId" value"${deck.docID}">
    <button class="btn btn-outline-secondary pomo-bg-color-md-dark pomo-text-color-light" type="submit" style="padding:5px 10px; float: right;"> <i class="material-icons pomo-text-color-light">keyboard_return</i>Return</button>
  </form>
  </div>
  </div>`;

  Elements.root.innerHTML += html;

  const overrideCheckboxes =
    document.getElementsByClassName("form-check-input");

  // Add event listener for OVERRIDE button on each incorrect answer
  for (let i = 0; i < overrideCheckboxes.length; ++i) {
    overrideCheckboxes[i].addEventListener("change", async (e) => {
      const index = e.target.value;
      console.log(index);
      user_answers[index].correct = true;
      score++;
      coins += 3;
      await FirebaseController.updateCoins(Auth.currentUser.uid, coins);
      document.getElementById(Constant.htmlIDs.overrideFlashcardBtn).innerHTML =
        buildOverviewView(deck, deckLength);
    });
  }
  const deckPageReturnButton = document.getElementsByClassName('form-return-to-decks');
  for (let i = 0; i < deckPageReturnButton.length; i++) {
    deckPageReturnButton[i].addEventListener('submit', async e => {
      e.preventDefault();
      //let deckId = e.target.docId.value;
      let deckId = deck.docID;
      try {
        history.pushState(null, null, Routes.routePathname.DECK + '#' + deckId);
        await DeckPage.deck_page(deckId);
      } catch (e) {
        if (Constant.DEV) console.log(e);
      }
    });
  }

}

// checks whether answer entered by user matches correct answer
function checkAnswer(answer, flashcard) {
  let user_history = {}; // object to store user_answer, bool correct
  let user_answer = answer.toLowerCase();
  let flashcard_answer = flashcard.answer.toLowerCase();
  user_history.answer = user_answer;


  // increment player score if answer is correct
  if (user_answer == flashcard_answer) {
    score++;
    coins += 3
    user_history.correct = true;
  }
  else {
    user_history.correct = false;
    user_history.flashcard = flashcard_answer;
  }

  if (!smartStudyOn)
    user_answers.push(user_history);

  return user_answer == flashcard_answer;
}

function reset() {
  user_answers = []; // reset stored user answers
  count = 0; // reset count
  score = 0;
  coins = 0;
}
