import * as Elements from "./elements.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";

export function addEventListeners() {
    /*Elements.btnStudyDeck.addEventListener('click', async() => {
            history.pushState(null, null, Routes.routePathname.STUDY);
            await study_page();
        });*/

}

export function studyFormSubmitEvent(form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const docId = e.target.docId.value;
        history.pushState(null, null, Routes.routePathname.DECK + "#" + docId);
        await study_page(docId);
    });
}

export async function study_page(docId) {
    Elements.root.innerHTML = "";
    let html = "";
    let deck;
    try {
        deck = await FirebaseController.getDeckById(docId);
        if (!deck) {
            html += "<h5>Deck not found!</h5>";
        } else {
            html += `<h1 style="align: center">${deck.name}</h1>`;
            html += `<h4 style="align: center">${deck.subject}</h4>`;
        }
    } catch (e) {
        console.log(e);
    }

    let flashcards;
    try {
        flashcards = await FirebaseController.getFlashcards(docId);
        if (!flashcards) {
            html += "<h5>No flashcards found for this deck</h5>";
        } 
    } catch (e) {
        console.log(e);
    }

    let flashcard = flashcards[0];
    console.log(flashcard.question);
    html += buildStudyFlashcardView(flashcard);

    Elements.root.innerHTML += html;

    const formAnswerFlashcard = document.getElementById(
        Constant.htmlIDs.formAnswerFlashcard
    );

    formAnswerFlashcard.addEventListener("submit", async (e) => {
            e.preventDefault();
            const answer = e.target.answer.value;
            //console.log(answer);
            checkAnswer(answer, flashcard);
        });
    
}

function buildStudyFlashcardView(flashcard) {
    let html = `<div class="study-flashcard-view"><form id="${Constant.htmlIDs.formAnswerFlashcard}">
    <div class="study-flashcard-question pomo-text-color-light">
        <h1>${flashcard.question}</h1>
    </div>
    <br>
    <br>
    <div class="study-flashcard-answer pomo-text-color-light">
        <label class="form-label">Answer</label>
        <input type="answer" name="answer" class="form-control" id="flashcard-answer">
        <br>
        <button type="submit" class="btn btn-secondary pomo-bg-color-dark" style="float:right">Answer</button>
    </div>
</form></div>`;

    return html;
}

function checkAnswer(answer, flashcard) {

    let user_answer = answer.toLowerCase();
    let flashcard_answer = flashcard.answer.toLowerCase();

    console.log(user_answer);
    console.log(flashcard_answer);

    if (user_answer == flashcard_answer) {
        console.log("correct answer");
        //display cross symbol
    } else {
        //display x symbol
    }
}
