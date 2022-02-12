import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Deck } from '../model/Deck.js';
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'


export function addEventListeners() {
    Elements.menuStudyDecks.addEventListener('click', async() => {
        history.pushState(null, null, Routes.routePathname.STUDYDECKS);
        await study_decks_page();
    });

    // CREATE A DECK Submit button event listener
    Elements.formCreateDeck.addEventListener('submit', async e => {
        e.preventDefault();
        const name = e.target.name.value;
        const subject = e.target.subject.value;

        // relevant to Cody's story:
        const dateCreated = Date.now();

        const deck = new Deck({
            name,
            subject,
            dateCreated
        });

        try {
            const docId = await FirebaseController.createDeck(deck);
            deck.docId = docId;
        } catch (e) {
            if (Constant.DEV) 
                console.log(e);
        }

    });

    // Adds event listener to CREATE A FLASHCARD Submit button
    // TODO: move actual work into its own function and just pass function name to even listener
    Elements.formCreateAFlashcard.addEventListener('submit', async e => {
        e.preventDefault();

        // Process form data
        // Uses attribute "name" on each HTML element to reference the value.
        const formData = Array.from(Elements.formCreateAFlashcard).reduce((acc, input) => ({...acc, [input.name]: input.value }), {});
        console.log(formData);
        
        // Getting contents of flashcard
        const question = formData.question;
        const answer = formData.answer;
        const isMultipleChoice = Elements.formCheckInputIsMultipleChoice.checked;
        const imageURL = "TESTING";
        const imageName = "TESTING";
        const incorrectAnswers = [];

        if (formData.incorrectAnswer1 != "") incorrectAnswers.push(formData.incorrectAnswer1);
        if (formData.incorrectAnswer2 != "") incorrectAnswers.push(formData.incorrectAnswer2);
        if (formData.incorrectAnswer3 != "") incorrectAnswers.push(formData.incorrectAnswer3);

        const deckDocIDReceivingNewFlashcard = formData.selectedDeck;

        const flashcard = new Flashcard({
            question,
            isMultipleChoice,
            answer,
            imageURL,
            imageName,
            incorrectAnswers,
        });

        console.log(flashcard);

        // try {
        //     const docId = await FirebaseController.createFlashcard(deckDocIDReceivingNewFlashcard, flashcard);
        //     flashcard.docId = docId;
            
        //     if (Constant.DEV) {
        //         console.log(`Flashcard created in deck with doc id [${deckDocIDReceivingNewFlashcard}]:`);
        //         console.log("Flashcard Contents: ");
        //         console.log(flashcard);
        //     }
        // } catch (e) {
        //     if (Constant.DEV) 
        //         console.log(e);
        // }

    });

    // Event listener to change the answer view depending on whether or not
    //  multiple choice is checked or not
    Elements.formCheckInputIsMultipleChoice.addEventListener('click', async e => {
        console.log("mult choice clicked");
        
        // // MULTIPLE CHOICE ON
        // if (Elements.formCheckInputIsMultipleChoice.checked) {
            
        // }
        // // MULTIPLE CHOICE OFF
        // else {
        //     formAnswerTextInput.innerHTML = `
        //     <label for="form-answer-text-input">Answer:</label>
        //     <textarea name="answer" id="form-answer-text-input" class="form-control" rows="3" type="text" name="flashcard-answer" placeholder="At least 4." required min length ="1"></textarea>
        //     `;
        // }
    });
}


export async function study_decks_page() {
    //Going to make the cards populate here so we can show in the testing them physically
    //being pulled and added to the page.
    //Clears all HTML so it doesn't double
    let html = '';
    html += '<h1> Study Decks </h1>';
    //Allows for the create a flashcard button
    html += `
        <button id="${Constant.htmlIDs.buttonShowCreateAFlashcardModal}" class="btn btn-outline-danger"> + Create Flashcard</button>
    `;

    // Solution for merging Piper's 'create_deck_deck_title branch
    html += `
        <button type="button" class="btn btn-primary pomo-bg-color-dark" data-bs-toggle="modal" data-bs-target="#create-deck-modal">
            Create New Deck
        </button>
    `;

    Elements.root.innerHTML = html;

    const buttonShowCreateAFlashcardModal = document.getElementById(Constant.htmlIDs.buttonShowCreateAFlashcardModal);


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