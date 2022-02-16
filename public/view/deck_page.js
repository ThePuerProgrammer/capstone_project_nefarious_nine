import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Utilities from './utilities.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Study from './study_page.js'

//Declaration of Image(Global)
let imageFile2Upload;

export function addViewButtonListener() {
  const viewButtons = document.getElementsByClassName('form-view-deck');
  for (let i = 0; i < viewButtons.length; ++i) {
    addViewFormSubmitEvent(viewButtons[i]);
  }
}

export function addViewFormSubmitEvent(form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const docId = e.target.docId.value;
    history.pushState(null, null, Routes.routePathname.DECK + '#' + docId);
    localStorage.setItem("deckPageDeckDocID", docId);
    await deck_page(docId);
  })
}

export function addEventListeners() {

  //Adds event listener to CREATE DECK button within CREATE DECK modal 
  Elements.decksCreateDeck.addEventListener("click", async () => {
    history.pushState(null, null, Routes.routePathname.DECK);
    await deck_page();
  });

  // Executes parameter function whenever the Create-A-Flashcard Modal is completely hidden
  //   The function clears the input fields so that whent he user returns, then
  //   they will have fresh input fields.
  $(`#${Constant.htmlIDs.modalCreateAFlashcard}`).on('hidden.bs.modal', function (e) {
    // RESET INPUT FIELDS FOR FOLLOWING:
    Elements.formCreateAFlashcard.reset();

    // Making sure singular choice is displayed next time.
    Elements.formAnswerContainer.innerHTML = `
        <label for="form-answer-text-input">Answer:</label>
        <textarea name="answer" id="form-answer-text-input" class="form-control" rows="3" type="text" name="flashcard-answer" placeholder="At least 4." required min length ="1"></textarea>
    `;
  });

  //Resets Image
  function resetImageSelection() {
    imageFile2Upload = null;
    Elements.imageTageCreateFlash.src = "";
  }

  // Adds event listener to CREATE A FLASHCARD Submit button
  // TODO: move actual work into its own function and just pass function name to even listener
  Elements.formCreateAFlashcard.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Process form data
    // Uses attribute "name" on each HTML element to reference the value.
    const formData = Array.from(Elements.formCreateAFlashcard).reduce(
      (acc, input) => ({ ...acc, [input.name]: input.value }),
      {}
    );

    // Getting contents of flashcard
    const question = formData.question;
    const answer = formData.answer;
    const isMultipleChoice = Elements.formCheckInputIsMultipleChoice.checked;
    console.log("testing");
    console.log(formData);

    const incorrectAnswers = [];

    if (isMultipleChoice) {
      if (formData.incorrectAnswer1 != "")
        incorrectAnswers.push(formData.incorrectAnswer1);
      if (formData.incorrectAnswer2 != "")
        incorrectAnswers.push(formData.incorrectAnswer2);
      if (formData.incorrectAnswer3 != "")
        incorrectAnswers.push(formData.incorrectAnswer3);
    }

    let deckDocID = localStorage.getItem("deckPageDeckDocID");
    const flashcard = new Flashcard({
      question,
      isMultipleChoice,
      answer,
      incorrectAnswers,
    });

    console.log(flashcard);

    try {
      if (imageFile2Upload) {
        console.log("Check1");
        const { imageName, imageURL } =
          await FirebaseController.uploadImageToFlashcard(imageFile2Upload);
        flashcard.imageName = imageName;
        flashcard.imageURL = imageURL;
      } else if (typeof obj === "undefined") {
        flashcard.imageName = "N/A";
        flashcard.imageURL = "N/A";
      }

      const docId = await FirebaseController.createFlashcard(
        Auth.currentUser.uid,
        deckDocID,
        flashcard
      );
      //flashcard.set_docID(docId);
      flashcard.docID = docId;
      // }
      if (Constant.DEV) {
        console.log(
          `Flashcard created in deck with doc id [${deckDocID}]:`
        );
        console.log("Flashcard Contents: ");
        console.log(flashcard);
      }
      Utilities.info(
        "Success!",
        `Flashcard: ${flashcard.question} has been added!`,
        "modal-create-a-flashcard"
      );
    } catch (e) {
      if (Constant.DEV) console.log(e);
      Utilities.info(
        "Create A Flashcard Error",
        JSON.stringify(e),
        "modal-create-a-flashcard"
      );
    }
  });

  // Event listener to change the answer view depending on whether or not
  //  multiple choice is checked or not
  Elements.formCheckInputIsMultipleChoice.addEventListener(
    "click",
    async (e) => {
      // MULTIPLE CHOICE ON
      if (Elements.formCheckInputIsMultipleChoice.checked) {
        Elements.formAnswerContainer.innerHTML = `
        <label for="form-answer-text-input">Correct Answer:</label>
        <textarea name="answer" id="form-answer-text-input" class="form-control" rows="1" type="text" name="flashcard-answer" value="${Elements.formAnswerTextInput.innerHTML}" placeholder="(Required) At least 200" required min length ="1"></textarea>
        <br />
        <label for="form-answer-text-input">Incorrect Option:</label>
        <textarea name="incorrectAnswer1" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Required) No more than 4" required min length ="1"></textarea>
        <br />
        <label for="form-answer-text-input">Incorrect Option:</label>
        <textarea name="incorrectAnswer2" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Optional) Exactly 4" min length ="1"></textarea>
        <br />
        <label for="form-answer-text-input">Incorrect Option:</label>
        <textarea name="incorrectAnswer3" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Optional) Probably 4?" min length="1"></textarea>
        `;
      }
      // MULTIPLE CHOICE OFF
      else {
        Elements.formAnswerContainer.innerHTML = `
        <label for="form-answer-text-input">Answer:</label>
        <textarea name="answer" id="form-answer-text-input" class="form-control" rows="3" type="text" name="flashcard-answer" value="${Elements.formAnswerTextInput.innerHTML}" placeholder="At least 4." required min length ="1"></textarea>
        `;
      }
    }
  );

  Elements.formAddFlashCardImageButton.addEventListener("change", (e) => {
    imageFile2Upload = e.target.files[0];
    if (!imageFile2Upload) return;
    //display image
    const reader = new FileReader();
    reader.onload = () => (Elements.imageTagCreateFlash.src = reader.result);
    reader.readAsDataURL(imageFile2Upload);
  });
}

export async function deck_page(docId) {
  let html = '';
  html += '<h1> Deck Page </h1>';
  //Allows for the create a flashcard button
  html += `
        <button id="${Constant.htmlIDs.buttonShowCreateAFlashcardModal}" class="btn btn-secondary pomo-bg-color-dark"> + Create Flashcard</button>
    `;

  // study deck button
  html += `
    <button id="${Constant.htmlIDs.buttonStudy}" type="button" class="btn btn-secondary pomo-bg-color-dark">Study</button>
    `;

  let deck;
  try {
    deck = await FirebaseController.getDeckById(docId);
    if (!deck) {
      html += '<h5>Deck not found!</h5>';
    } else {
      html += `<h2 style="align: center">${deck.name}</h2>`;
    }
  } catch (e) {
    console.log(e);
  }

  let flashcards;
  try {
    flashcards = await FirebaseController.getFlashcards(Auth.currentUser.uid, docId);
    if (!flashcards) {
      html += '<h5>No flashcards found for this deck</h5>';
    }
  } catch (e) {
    console.log(e);
  }

  flashcards.forEach(flashcard => {
    html += buildFlashcardView(flashcard);
  })

  Elements.root.innerHTML = html;

  const buttonShowCreateAFlashcardModal = document.getElementById(
    Constant.htmlIDs.buttonShowCreateAFlashcardModal
  );

  const buttonStudy = document.getElementById(
    Constant.htmlIDs.buttonStudy
  );


  /*****************************************
     *    Dynamic Element Event Listeners
     *****************************************
    * This is where event listeners for HTML 
    * elements that are added dynamically to 
    * the decks_page go.
    ******************************************/

  // Manually opens the modal for "Create a Flashcard" when button is clicked.
  //  This allows us to pull all of the decks from the (temporary) test deck
  //  so that we can add a flashcard to a specific deck. Options are added dynamically
  //  to the select HTML element (#form-create-a-flashcard-select-container) in the "Create A Flashcard" form
  buttonShowCreateAFlashcardModal.addEventListener('click', async e => {
    e.preventDefault();

    // Opens the Modal
    $(`#${Constant.htmlIDs.modalCreateAFlashcard}`).modal('show');});

    // Adds event listener for STUDY button
    buttonStudy.addEventListener('click', async e => {
      e.preventDefault();
      //const docId = e.target.docId.value;
      history.pushState(null, null, Routes.routePathname.STUDY + "#" + docId);
      await Study.study_page(docId);
  });
}

function buildFlashcardView(flashcard) {
  let html = flashcard.imageURL != "N/A" ? `<div id="card-${flashcard.docId}" class="flip-card" style="display: inline-block">
  <div class="flip-card-inner">
    <div class="flip-card-front">
      <img src="${flashcard.imageURL}" style="width: 100px; height: 100px">
      <p>${flashcard.question}</p>
    ` :
    `<div id="card-${flashcard.docId}" class="flip-card" style="display: inline-block">
    <div class="flip-card-inner">
      <div class="flip-card-front">
        <p>${flashcard.question}</p>
      `;

  //TODO: find a way to shuffle these up
  if (flashcard.isMultipleChoice) {
    for (let i = 0; i < flashcard.incorrectAnswers.length; ++i) {
      html += `<p>${flashcard.incorrectAnswers[i]}</p>`
    }
    html += `<p>${flashcard.answer}</p>`;
  } else {
    html += `<p>${flashcard.answer}</p>`;
  }

  html += `</div><div class="flip-card-back">
  <h1>${flashcard.answer}</h1>
</div>
</div>
</div>`;

  return html;
}
