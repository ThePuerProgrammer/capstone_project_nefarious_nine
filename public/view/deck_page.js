import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Utilities from './utilities.js'

//Declaration of Image(Global)
let imageFile2Upload;

export function addEventListeners() {
  Elements.decksCreateDeck.addEventListener("click", async () => {
    history.pushState(null, null, Routes.routePathname.DECK);
    await deck_page();
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
    console.log(formData);

    // Getting contents of flashcard
    const question = formData.question;
    const answer = formData.answer;
    const isMultipleChoice = Elements.formCheckInputIsMultipleChoice.checked;

    const incorrectAnswers = [];

    if (isMultipleChoice) {
      if (formData.incorrectAnswer1 != "")
        incorrectAnswers.push(formData.incorrectAnswer1);
      if (formData.incorrectAnswer2 != "")
        incorrectAnswers.push(formData.incorrectAnswer2);
      if (formData.incorrectAnswer3 != "")
        incorrectAnswers.push(formData.incorrectAnswer3);
    }

    const deckDocIDReceivingNewFlashcard = formData.selectedDeck;

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
        console.log("Check2");
        flashcard.imageName = "N/A";
        flashcard.imageURL = "N/A";
      }
      console.log("Check3");
      const docId = await FirebaseController.createFlashcard(
        deckDocIDReceivingNewFlashcard,
        flashcard
      );
      //flashcard.set_docID(docId);
      flashcard.docID = docId;
      // }
      if (Constant.DEV) {
        console.log(
          `Flashcard created in deck with doc id [${deckDocIDReceivingNewFlashcard}]:`
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
                <textarea name="answer" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Required) At least 200" required min length ="1"></textarea>
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
                <textarea name="answer" id="form-answer-text-input" class="form-control" rows="3" type="text" name="flashcard-answer" placeholder="At least 4." required min length ="1"></textarea>
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

export async function deck_page() {
  //Going to make the cards populate here so we can show in the testing them physically
  //being pulled and added to the page.
  //Clears all HTML so it doesn't double
  let html = "";
  html += "<h1> Deck Page </h1>";
  //Allows for the create a flashcard button
  html += `
        <button id="${Constant.htmlIDs.buttonShowCreateAFlashcardModal}" class="btn btn-secondary pomo-bg-color-dark"> + Create Flashcard</button>
    `;

  // study deck button
  html += `
    <button type="button" class="btn btn-primary">Study</button>
    `;
  Elements.root.innerHTML = html;

  const buttonShowCreateAFlashcardModal = document.getElementById(
    Constant.htmlIDs.buttonShowCreateAFlashcardModal
  );


  /*****************************************
      *    Dynamic Element Event Listeners
      *****************************************
     * This is where event listeners for HTML 
     * elements that are added dynamically to 
     * the study_decks_page go.
     ******************************************/

  // Manually opens the modal for "Create a Flashcard" when button is clicked.
  //  This allows us to pull all of the decks from the (temporary) test deck
  //  so that we can add a flashcard to a specific deck. Options are added dynamically
  //  to the select HTML element (#form-create-a-flashcard-select-container) in the "Create A Flashcard" form
  buttonShowCreateAFlashcardModal.addEventListener('click', async e => {
    e.preventDefault();

    // Grabbing list of decks from Firestore
    const listOfTestDecks = await FirebaseController.getAllTestingDecks();

    // Adding list of decks to select menu/drop down
    listOfTestDecks.forEach(deck => {
      document.getElementById('form-create-a-flashcard-select-container').innerHTML += `
                <option value="${deck.docID}">${deck.name}</option>
            `;
    });

    // Opens the Modal
    $(`#${Constant.htmlIDs.modalCreateAFlashcard}`).modal('show');
  });
}