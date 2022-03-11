import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import { Flashcard } from '../model/flashcard.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Utilities from './utilities.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Study from './study_page.js'
import * as EditFlashCard from '../controller/edit_flashcard.js'

//Declaration of Image
let imageFile2UploadQuestion;
let imageFile2UploadAnswer;
const imageAnswer = Elements.formContainerAnswerImage;
const imageQuestion = Elements.formContainerQuestionImage;

export function addEventListeners() {


    // Executes parameter function whenever the Create-A-Flashcard Modal is completely hidden
    //     The function clears the input fields so that when the user returns, then
    //     they will have fresh input fields.
    $(`#${Constant.htmlIDs.modalCreateAFlashcard}`).on('hidden.bs.modal', function (e) {
        // RESET INPUT FIELDS FOR FOLLOWING:
        resetFlashcard();
    });


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
        const isQuestionImage = Elements.formCheckInputIsImageQuestion.checked;
        const isAnswerImage = Elements.formCheckInputIsImageAnswer.checked;

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

        let deckDocID = sessionStorage.getItem("deckId");
        let isClassDeck = sessionStorage.getItem('isClassDeck');
        console.log(`Testing Here:${deckDocID}`);
        console.log(deckDocID);


        const flashcard = new Flashcard({
            question,
            isMultipleChoice,
            answer,
            incorrectAnswers,
        });

        console.log(flashcard);

        try {
            //Question Image
            if (isQuestionImage) {
                console.log("Question-1");
                const { questionImageName, questionImageURL } =
                    await FirebaseController.uploadImageToFlashcardQuestion(imageFile2UploadQuestion);
                flashcard.questionImageName = questionImageName;
                flashcard.questionImageURL = questionImageURL;
            } else if (typeof obj === "undefined") {
                console.log("Question-2");
                flashcard.questionImageName = "N/A";
                flashcard.questionImageURL = "N/A";
            }
            //Answer Image

            if (isAnswerImage) {
                console.log("Answer-1");
                const { answerImageName, answerImageURL } =
                    await FirebaseController.uploadImageToFlashcardAnswer(imageFile2UploadAnswer);
                flashcard.answerImageName = answerImageName;
                flashcard.answerImageURL = answerImageURL;
            } else if (typeof obj === "undefined") {
                console.log("Answer-2");
                flashcard.answerImageName = "N/A";
                flashcard.answerImageURL = "N/A";
            }
            if(isClassDeck=="false"){//USER FLASHCARDS
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
            await FirebaseController.updateFlashcardCount(Auth.currentUser.uid,deckDocID);
            setTimeout(200);
            await FirebaseController.updateFlashcardCountForUser(Auth.currentUser.uid);
            } else { //CLASSROOM FLASHCARDS
                    const docId = await FirebaseController.createClassFlashcard(
                        isClassDeck,
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
                    await FirebaseController.updateClassFlashcardCount(isClassDeck,deckDocID);
            }
            
        } catch (e) {
            if (Constant.DEV) console.log(e);
            Utilities.info(
                "Create A Flashcard Error",
                JSON.stringify(e),
                "modal-create-a-flashcard"
            );
        }
        await deck_page(deckDocID,isClassDeck);
    });
    Elements.formDeleteFlashcard.addEventListener('submit', async (e) => {
        e.preventDefault();
        // get the value from the select list item
        var f = document.getElementById('value').value;
        let deckDocID = sessionStorage.getItem('deckId');
        let isClassDeck = sessionStorage.getItem('isClassDeck');
        try {
            await FirebaseController.deleteFlashcard(Auth.currentUser.uid, deckDocID, f);
            Utilities.info("Successfully deleted", "Successfully deleted flashcard", "modal-delete-a-flashcard");
            await FirebaseController.updateFlashcardCount(Auth.currentUser.uid,deckDocID);
            await FirebaseController.updateFlashcardCountForUser(Auth.currentUser.uid);
        } catch (e) {
            Utilities.info("Error", JSON.stringify(e), "modal-delete-a-flashcard");
        }
        // refresh the page
        await deck_page(deckDocID,isClassDeck);
    });
    // Event listener to change the answer view depending on whether or not
    //    multiple choice is checked or not
    Elements.formCheckInputIsMultipleChoice.addEventListener(
        "click",
        async (e) => {
            // MULTIPLE CHOICE ON
            if (Elements.formCheckInputIsMultipleChoice.checked) {
                Elements.formCheckInputIsImageAnswer.checked = false;
                imageAnswer.style.display = 'none';
                multipleChoiceOnHTML();

            }
            // MULTIPLE CHOICE OFF
            else {
                Elements.formCheckInputIsImageAnswer.checked = false;
                multipleChoiceOffHTML();
            }
        }
    );

    //Checks for the Image Question Toggle
    Elements.formCheckInputIsImageQuestion.addEventListener("click", async (e) => {
        // TOGGLE ON
        checkImageQuestion();
    });

    //Checks for the Image Answer Toggle
    Elements.formCheckInputIsImageAnswer.addEventListener("click", async (e) => {
        // TOGGLE IS ON
        checkImageAnswer();
        if (Elements.formCheckInputIsMultipleChoice.checked) {
            Elements.formCheckInputIsMultipleChoice.checked = false;
            multipleChoiceOffHTML();
        }
    });

    //Checks for Image selection of Question Image
    Elements.formAddFlashCardQuestionImageButton.addEventListener("change", async (e) => {
        imageFile2UploadQuestion = e.target.files[0];
        if (!imageFile2UploadQuestion) {
            //If image is deselected it is reset and given conditions to
            //represent that in creating the flashcard.
            Elements.imageTagCreateFlashQuestion.src = '';
            return;
        }
        //Image is loaded and information represents this when creating
        //flashcard.
        Elements.formCheckInputIsImageQuestion.checked = true;
        const reader = new FileReader();
        reader.onload = () => (Elements.imageTagCreateFlashQuestion.src = reader.result);
        reader.readAsDataURL(imageFile2UploadQuestion);
    });

    //Checks for Image selection of Answer Image
    Elements.formAddFlashCardAnswerImageButton.addEventListener("change", async (e) => {
        imageFile2UploadAnswer = e.target.files[0];
        if (!imageFile2UploadAnswer) {
            Elements.imageTagCreateFlashAnswer.src = '';
            return;
        }
        //Image is loaded and information represents this when creating
        //flashcard.
        Elements.formCheckInputIsImageAnswer.checked = true;
        const reader = new FileReader();
        reader.onload = () => (Elements.imageTagCreateFlashAnswer.src = reader.result);
        reader.readAsDataURL(imageFile2UploadAnswer);
    });

}

export async function deck_page(deckDocID, isClassDeck) {
    // if(deckDocID == null){
    //     deckDocID = sessionStorage.getItem('deckId');
    // }
    console.log(isClassDeck);
    console.log(`Where I commented out:${deckDocID}`);
    let html = '';
    html += '<h1> Deck Page </h1>';
    //Allows for the create a flashcard button
    html += `
                <button id="${Constant.htmlIDs.buttonShowCreateAFlashcardModal}" class="btn btn-secondary pomo-bg-color-dark"> <i class="material-icons text-white">add</i>Create Flashcard</button>
        `;



    let deck;
    let flashcards;
    try {
        if (isClassDeck == "false") {
            console.log("deck_page no class check for is class deck " + isClassDeck);
            deck = await FirebaseController.getUserDeckById(Auth.currentUser.uid, deckDocID);
            flashcards = await FirebaseController.getFlashcards(Auth.currentUser.uid, deck.docID);
        } else {
            //note: class selected is either the doc id of a selected classroom or false
            deck = await FirebaseController.getClassDeckByDocID(isClassDeck, deckDocID);
            flashcards = await FirebaseController.getClassDeckFlashcards(isClassDeck, deck.docID);
        }
        if (flashcards.length != 0) {
            // study deck button
            html += `
                <button id="${Constant.htmlIDs.buttonStudy}" type="button" class="btn btn-secondary pomo-bg-color-dark"><i class="material-icons text-white">local_library</i>Study</button>
                <button id="${Constant.htmlIDs.deleteFlashcard}" type="button" class="btn btn-secondary pomo-bg-color-dark"> <i class="material-icons text-white">delete</i>Delete Flashcard</button>`;
        } else {
            html += `
                <button id="${Constant.htmlIDs.buttonStudy}" type="button" class="btn btn-secondary pomo-bg-color-dark" disabled><i class="material-icons text-white">local_library</i>Study</button>
                <button id="${Constant.htmlIDs.deleteFlashcard}" type="button" class="btn btn-secondary pomo-bg-color-dark" disabled> <i class="material-icons text-white">delete</i>Delete Flashcard</button>
                `;
        }

        if (!deck) {
            html += '<h5>Deck not found!</h5>';
        } else {
            html += `<h2 style="align: center">${deck.name}</h2>`;
        }
        if (flashcards.length == 0) {
            html += '<h5>No flashcards found for this deck</h5>';
        } else {
            flashcards.forEach(flashcard => {
                html += buildFlashcardView(flashcard);
            });
        }
    } catch (e) {
        console.log(e);
    }


    Elements.root.innerHTML = html;

    const buttonShowCreateAFlashcardModal = document.getElementById(
        Constant.htmlIDs.buttonShowCreateAFlashcardModal
    );



    const editForms = document.getElementsByClassName('form-edit-flashcard')
    for (let i = 0; i < editForms.length; i++) {
        editForms[i].addEventListener('submit', async e => {
            //prevents refresh on submit of form
            e.preventDefault();
            //gets button by tagname within the form
            const button = e.target.getElementsByTagName('button')[0];
            const label = Utilities.disableButton(button);
            //passed by the button on the flashcard
            Utilities.enableButton(button, label);
            console.log(isClassDeck);
            if(isClassDeck=='false'){ //USER FLASHCARD
                await EditFlashCard.edit_flashcard(Auth.currentUser.uid, deckDocID, e.target.docId.value);
            } else { //CLASSROOM FLASHCARD 
                await EditFlashCard.edit_classroomflashcard(isClassDeck, deckDocID, e.target.docId.value);
            }
            //Loads a fresh page after the update
            //  await deck_page(e.target.docId.value); //CHANGE THIS // fix this
        });
    }

    /*****************************************
         *        Dynamic Element Event Listeners
         *****************************************
        * This is where event listeners for HTML 
        * elements that are added dynamically to 
        * the decks_page go.
        ******************************************/

    // Manually opens the modal for "Create a Flashcard" when button is clicked.
    //    This allows us to pull all of the decks from the (temporary) test deck
    //    so that we can add a flashcard to a specific deck. Options are added dynamically
    //    to the select HTML element (#form-create-a-flashcard-select-container) in the "Create A Flashcard" form
    buttonShowCreateAFlashcardModal.addEventListener('click', async e => {
        e.preventDefault();

        // Opens the Modal
        $(`#${Constant.htmlIDs.modalCreateAFlashcard}`).modal('show');
    });

    // Adds event listener for STUDY button
    const buttonStudy = document.getElementById(Constant.htmlIDs.buttonStudy);
    buttonStudy.addEventListener('click', async e => {
        e.preventDefault();
        //const docId = e.target.deckDocID.value;

        // If this is the user's first time studying the deck then we need to create
        //  a deck data for them.
        try {
            await FirebaseController.createDeckDataIfNeeded(Auth.currentUser.uid, deckDocID);
        }
        catch (e) {
            if (Constant.DEV)
                console.log("Error Creating Data Deck (User's first time studying a deck)", e);
        }

        history.pushState(null, null, Routes.routePathname.STUDY + "#" + deckDocID);
        localStorage.setItem("deckPageDeckDocID", deckDocID);
        await Study.study_page();
    });

    const deleteButton = document.getElementById(Constant.htmlIDs.deleteFlashcard);
    deleteButton.addEventListener('click', async e => {
        e.preventDefault();
        const deleteOption = document.getElementById("delete-option");
        // clear out the select list elements to prevent duplicates from appearing
        for (let i = deleteOption.length; i > 0; i--) {
            deleteOption.remove(i);
        }
        // build select list elements from flashcard array
        for (let i = 0; i < flashcards.length; ++i) {
            const el = document.createElement("option");
            el.innerHTML = flashcards[i].question;
            el.value = flashcards[i].docID;
            deleteOption.appendChild(el);
        }

        // opens delete flashcard modal
        $(`#${Constant.htmlIDs.deleteFlashcardModal}`).modal('show');
    })

}
function buildFlashcardView(flashcard) {
    let html = flashcard.questionImageURL != "N/A" ? `<div id="card-${flashcard.docId}" class="flip-card" style="display: inline-block">
    <div class="flip-card-inner">
        <div class="flip-card-front">
            <img src="${flashcard.questionImageURL}" style="width: 100px; height: 100px">
            <p>${flashcard.question}</p>
        ` :
        `<div id="card-${flashcard.docId}" class="flip-card" style="display: inline-block">
        <div class="flip-card-inner">
            <div class="flip-card-front">
                <h5>${flashcard.question}</h5>
            `;

    //still TODO: make multiple choice answers look better
    if (flashcard.isMultipleChoice) {
        let flashcardAnswers = [flashcard.answer];
        flashcardAnswers = flashcardAnswers.concat(flashcard.incorrectAnswers);
        shuffle(flashcardAnswers);
        // TODO: Find a much better way of doing this
        if (flashcardAnswers.length == 4) {
            html += `<p class="answer-text">1. ${flashcardAnswers[0]} &ensp; 2. ${flashcardAnswers[1]}  
            <br/> 3. ${flashcardAnswers[2]}  &ensp; 4. ${flashcardAnswers[3]}  </p>`
        } else if (flashcardAnswers.length == 3) {
            html += `<p class="answer-text">1. ${flashcardAnswers[0]}  &ensp; 2. ${flashcardAnswers[1]}
                        <br/> 3. ${flashcardAnswers[2]}</p>`
        } else if (flashcardAnswers.length == 2) {
            html += `<p class="answer-text">1. ${flashcardAnswers[0]} &ensp; 2. ${flashcardAnswers[1]}</p>`
        }
    }

    html += flashcard.answerImageURL != "N/A" ? `</div><div class="flip-card-back">
    <h6>${flashcard.answer}</h6>
    <br>
    <img src="${flashcard.answerImageURL}" style="width: 100px; height: 100px"/>
    <form class="form-edit-flashcard" method="post">
        <input type="hidden" name="docId" value="${flashcard.docID}">
        <button class="btn btn-secondary pomo-bg-color-md pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="small material-icons pomo-text-color-light">edit</i>Edit</button>
    </form>
  </div>
  </div>
  </div>`
        :
        `</div><div class="flip-card-back">
  <h6>${flashcard.answer}</h6>
  <form class="form-edit-flashcard" method="post">
        <input type="hidden" name="docId" value="${flashcard.docID}">
        <button class="btn btn-secondary pomo-bg-color-md pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="small material-icons pomo-text-color-light">edit</i>Edit</button>
  </form>
  </div>
  </div>
  </div>`;

    return html;
}

//Function to reset all feels and toggles in creation modal
function resetFlashcard() {
    Elements.formCreateAFlashcard.reset();
    if (Elements.formCheckInputIsImageQuestion) {
        imageQuestion.style.display = 'none';
    }
    if (Elements.formCheckInputIsImageAnswer) {
        imageAnswer.style.display = 'none';

    }
    Elements.imageTagCreateFlashAnswer.src = "";
    Elements.imageTagCreateFlashQuestion.src = "";

    // Making sure singular choice is displayed next time.
    Elements.formAnswerContainer.innerHTML = `
        <label for="form-answer-text-input">Answer:</label>
        <textarea name="answer" id="form-answer-text-input" class="form-control" rows="3" type="text" name="flashcard-answer" placeholder="At least 4." required minlength ="1" autocomplete="off"></textarea>
    `;
}

function shuffle(answers) {
    for (let i = answers.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
}
//Method to display the container for question image.
function checkImageQuestion() {
    if (Elements.formCheckInputIsImageQuestion.checked) {
        if (imageQuestion.style.display == 'none') {
            imageQuestion.style.display = 'block';
        } else {
            imageQuestion.style.display = 'none';
        }
    } else if (!Elements.formCheckInputIsImageQuestion.checked) {
        if (imageQuestion.style.display == 'none') {
            imageQuestion.style.display = 'block';
        } else {
            imageQuestion.style.display = 'none';
        }
    }
}
//Method to display the container for answer image.
function checkImageAnswer() {
    if (Elements.formCheckInputIsImageAnswer.checked) {
        if (imageAnswer.style.display == 'none') {
            imageAnswer.style.display = 'block';
        } else {
            imageAnswer.style.display = 'none';
        }
    }
    else if (!Elements.formCheckInputIsImageAnswer.checked) {
        if (imageAnswer.style.display == 'none') {
            imageAnswer.style.display = 'block';
        } else {
            imageAnswer.style.display = 'none';
        }
    }
}

function multipleChoiceOnHTML() {
    Elements.formAnswerContainer.innerHTML = `
    <label for="form-answer-text-input">Correct Answer:</label>
    <textarea name="answer" id="form-answer-text-input" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Required) At least 200" required minlength ="1" maxlength="30" autocomplete="off"></textarea>
    <br />
    <label for="form-answer-text-input">Incorrect Option:</label>
    <textarea name="incorrectAnswer1" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Required) No more than 4" required minlength ="1" maxlength="30" autocomplete="off"></textarea>
    <br />
    <label for="form-answer-text-input">Incorrect Option:</label>
    <textarea name="incorrectAnswer2" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Optional) Exactly 4" minlength ="1" maxlength="30" autocomplete="off"></textarea>
    <br />
    <label for="form-answer-text-input">Incorrect Option:</label>
    <textarea name="incorrectAnswer3" class="form-control" rows="1" type="text" name="flashcard-answer" placeholder="(Optional) Probably 4?" minlength="1" maxlength="30" autocomplete="off"></textarea>
    `;
}

function multipleChoiceOffHTML() {
    Elements.formAnswerContainer.innerHTML = `
    <label for="form-answer-text-input">Answer:</label>
    <textarea name="answer" id="form-answer-text-input" class="form-control" rows="3" type="text" name="flashcard-answer" placeholder="At least 4." required minlength ="1" maxlength="30" autocomplete="off"></textarea>
    `;
}