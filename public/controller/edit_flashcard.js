import * as FirebaseController from './firebase_controller.js'
import * as Auth from './firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'
import { Flashcard } from '../model/flashcard.js';
import { deck_page } from '../view/deck_page.js'
// import * as Flashcard from './/model/flashcard.js'

 let imageFile2UploadAnswer;
 let imageFile2UploadQuestion;

let imageAnswer = Elements.formEditFlashcard.answerImageContainer;
let imageQuestion = Elements.formEditFlashcard.questionImageContainer;

export function addEventListeners(){
    Elements.formEditFlashcard.answerImageButton.addEventListener('change', e=> {
        //Possibly need to check for something here
        imageFile2UploadAnswer = e.target.files[0];
        if(!imageFile2UploadAnswer){
            Elements.formEditFlashcard.answerImageTag.src='';
            return;
        }
        Elements.formEditFlashcard.answerImageToggle.checked=true;
        const reader = new FileReader();
        reader.onload = () => (Elements.formEditFlashcard.answerImageTag.src= reader.result);
        reader.readAsDataURL(imageFile2UploadAnswer);
    });

    Elements.formEditFlashcard.questionImageButton.addEventListener('change', e=> {
        imageFile2UploadQuestion = e.target.files[0];
        if(!imageFile2UploadQuestion){
            Elements.formEditFlashcard.questionImageTag.src='';
            return;
        }
        Elements.formEditFlashcard.questionImageToggle.checked=true;
        const reader = new FileReader();
        reader.onload = () => (Elements.formEditFlashcard.questionImageTag.src= reader.result);
        reader.readAsDataURL(imageFile2UploadQuestion);
    });

    //Checks for the Image Question Toggle
    Elements.formEditFlashcard.questionImageToggle.addEventListener('click', async (e) => {
        // TOGGLE ON
        checkImageQuestion();
    });
    
    //Checks for the Image Answer Toggle
    Elements.formEditFlashcard.answerImageToggle.addEventListener('click', async (e) => {
        // TOGGLE IS ON
        checkImageAnswer();
        if(Elements.formEditFlashcard.answerImageToggle.checked){
            Elements.formCheckInputIsMultipleChoiceEdit.checked=false;
            multipleChoiceOffHTML();
        }
    });
    Elements.formEditFlashcard.multipleChoiceToggle.addEventListener('click', async (e)=> {
        //Toggle On
        if(Elements.formEditFlashcard.multipleChoiceToggle.checked){
            Elements.formEditFlashcard.answerImageToggle.checked=false;
            imageAnswer.style.display = 'none';
           // checkImageAnswer();
            //imageAnswer.style.display = 'none';
            multipleChoiceOnHTML();
        }//Toggle Off
        else{
            Elements.formEditFlashcard.answerImageToggle.checked=false;
            imageAnswer.style.display = 'none';

            //multipleChoiceOffHTML();
        }
    });
    Elements.formEditFlashcard.form.addEventListener('submit', async e=> {
        e.preventDefault();
        const button = e.target.getElementsByTagName('button')[0];
        const label = Utilities.disableButton(button);

        const fc = new Flashcard({
            question:           e.target.question.value,
            answer:             e.target.answer.value,
            //ROAD BLOCK
            isMultipleChoice:   e.target.isMultipleChoice.value,
            incorrectAnswers:   e.target.incorrectAnswers.value,
            
            //Picture Related DATA
            questionImageName:  e.target.questionImageName.value,
            questionImageURL:   e.target.questionImageURL.value,
            answerImageName:    e.target.answerImageName.value,
            answerImageURL:     e.target.answerImageURL.value,
        });
        fc.set_docID(e.target.docId.value);
       
        let editDeckDocId = window.localStorage.getItem('deckPageDeckDocID');
        const formData = Array.from(Elements.formEditFlashcard).reduce(
            (acc, input) => ({ ...acc, [input.name]: input.value }),
            {}
        );
        const isMultipleChoice = Elements.formEditFlashcard.multipleChoiceToggle;
        const incorrectAnswers = [];
        const isQuestionImage = Elements.formEditFlashcard.questionImageToggle;
        const isAnswerImage = Elements.formEditFlashcard.answerImageToggle;

        //Check isMultipleChoice and registers value
        //Toggling this real quick
            if(!isMultipleChoice){
                console.log("checking mutliple choice worked");
                fc.isMultipleChoice = false;
                fc.incorrectAnswers = incorrectAnswers;
            } else{
                fc.isMultipleChoice = true;
                if (isMultipleChoice) {
                    if (formData.incorrectAnswer1 != "")
                        incorrectAnswers.push(formData.incorrectAnswer1);
                    if (formData.incorrectAnswer2 != "")
                        incorrectAnswers.push(formData.incorrectAnswer2);
                    if (formData.incorrectAnswer3 != "")
                        incorrectAnswers.push(formData.incorrectAnswer3);
                }
                fc.incorrectAnswers = incorrectAnswers;
            }

        //Firestore
        try{
            if(imageFile2UploadAnswer){
                //const imageAnswerInfo = await FirebaseController.uploadImageToFlashcardAnswer(imageFile2UploadAnswer, 
                const {answerImageName, answerImageURL} = await FirebaseController.uploadImageToFlashcardAnswer(imageFile2UploadAnswer,     
                    e.target.answerImageName.value);
                fc.answerImageName = answerImageName;
                fc.answerImageURL = answerImageURL;
            } else if (typeof obj === "undefined") {
                console.log("Answer-2");
                fc.answerImageName = "N/A";
                fc.answerImageURL = "N/A";
              }

            if(imageFile2UploadQuestion){
                //const imageQuestionInfo = await FirebaseController.uploadImageToFlashcardAnswer(imageFile2UploadQuestion, 
                const {questionImageName, questionImageURL} = await FirebaseController.uploadImageToFlashcardAnswer(imageFile2UploadQuestion, 
                    e.target.questionImageName.value);
                fc.questionImageName = questionImageName;
                fc.questionImageURL = questionImageURL;
            } else if (typeof obj === "undefined") {
                console.log("Question-2");
                fc.questionImageName = "N/A";
                fc.questionImageURL = "N/A";
              }

            //Update Firestore
            await FirebaseController.updateFlashcard(Auth.currentUser.uid, editDeckDocId,fc,fc.docID);//changed Id to ID
            //Update Browser
        } catch(e){
            if(Constant.DEV) console.log(e);
            Utilities.info('Update Flashcard Error', JSON.stringify(e));
        }
        //Enabling button after process
        Utilities.enableButton(button,label);
        Utilities.info(
            "Success!",
            `Flashcard: ${fc.question} has been updated!`,
            "modal-edit-a-flashcard"
        );
        await deck_page(editDeckDocId);

    });
}


export async function edit_flashcard(uid, deckId, docId){
    resetFlashcard();
    let flashcard;
    
    try{
        flashcard = await FirebaseController.getFlashCardById(uid,deckId,docId);
        if(!flashcard){
            Utilities.info('getFlashCardById Error', 'No flashcard found by the id');
            return;
        }
    } catch (e){
        if(Constant.DEV) console.log(e);
        Utilities.info('Error Firebase Controller', JSON.stringify(e));
        return;
    }

    //Getting Elements from Firebase to Edit //CHANGES HERE
    Elements.formEditFlashcard.form.docId.value = flashcard.docID;
    Elements.formEditFlashcard.form.questionImageName.value = flashcard.questionImageName;
    Elements.formEditFlashcard.form.answerImageName.value = flashcard.answerImageName;
    Elements.formEditFlashcard.form.question.value = flashcard.question;
    Elements.formEditFlashcard.form.answer.value = flashcard.answer;
    Elements.formEditFlashcard.questionImageTag.src = flashcard.questionImageURL;
    Elements.formEditFlashcard.answerImageTag.src = flashcard.answerImageURL;
    Elements.formEditFlashcard.multipleChoiceToggle = flashcard.isMultipleChoice;
    
    //Verifying Toggles
    let ismultiplechoice = Elements.formEditFlashcard.multipleChoiceToggle;
    const incorrectAnswers = [];
    const isQuestionImage = Elements.formEditFlashcard.questionImageToggle;
    const isAnswerImage = Elements.formEditFlashcard.answerImageToggle;

    if(!flashcard.questionImageName||flashcard.questionImageName=='N/A'){
        isQuestionImage.checked=false;
        imageQuestion.style.display='none';
    } else {
        isQuestionImage.checked=true;
        imageQuestion.style.display='block';
    }
    if(!flashcard.answerImageName||flashcard.answerImageName=='N/A'){
        isAnswerImage.checked=false;
        imageAnswer.style.display='none';
    } else {
        isAnswerImage.checked=true;
        imageAnswer.style.display='block';
    }
    if(!flashcard.isMultipleChoice){
        ismultiplechoice = false;        
        //multipleChoiceOffHTML();
    } else {
        ismultiplechoice=true;
        //multipleChoiceOnHTML();
    }

    Elements.modalEditFlashcard.show();
}

//Method to display the container for question image.
function checkImageQuestion(){
    if (Elements.formEditFlashcard.questionImageToggle.checked) {
      if(imageQuestion.style.display=='none'){
        imageQuestion.style.display = 'block';
      } else{
        imageQuestion.style.display = 'none';
      }
    } else if(!Elements.formEditFlashcard.questionImageToggle.checked){
      if(imageQuestion.style.display=='none'){
        imageQuestion.style.display = 'block';
      } else{
        imageQuestion.style.display = 'none';
      }
    }
}

//Method to display the container for answer image.
function checkImageAnswer(){
    if (Elements.formEditFlashcard.answerImageToggle.checked) {
      if(imageAnswer.style.display=='none'){
        imageAnswer.style.display = 'block';
      } else{
        imageAnswer.style.display = 'none';
      }
    }
    else if(!Elements.formEditFlashcard.answerImageToggle.checked){
      if(imageAnswer.style.display=='none'){
        imageAnswer.style.display = 'block';
      } else{
        imageAnswer.style.display = 'none';
      }
    }
}
//Function to reset all fields
function resetFlashcard(){
    Elements.formEditFlashcard.form.reset();
    if(Elements.formEditFlashcard.questionImageToggle){
        imageQuestion.style.display='none';
    }
    if(Elements.formEditFlashcard.answerImageToggle){
        imageAnswer.style.display='none';

    }
    Elements.formEditFlashcard.answerImageTag.src="";
    Elements.formEditFlashcard.questionImageTag.src="";
    
    //  Looking at How to mess with this area...
    // Making sure singular choice is displayed next time.
    // Elements.formAnswerContainer.innerHTML = `
    //     <label for="form-answer-text-input">Answer:</label>
    //     <textarea name="answer" id="form-answer-text-input" class="form-control" rows="3" type="text" name="flashcard-answer" placeholder="At least 4." required min length ="1"></textarea>
    // `;
}

function multipleChoiceOnHTML(){
    Elements.formEditFlashcard.formAnswerContainer.innerHTML = `
    <label for="form-answer-text-input">Correct Answer:</label>
    <textarea name="answer" id="form-answer-text-input-edit" class="form-control" rows="1" type="text" name="flashcard-answer" value="${Elements.formEditFlashcard.answerTextInput.innerHTML}" placeholder="(Required) At least 200" required min length ="1"></textarea>
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

function multipleChoiceOffHTML(){
    Elements.formEditFlashcard.formAnswerContainer.innerHTML =`
    <label for="form-answer-text-input">Answer:</label>
    <textarea name="answer" id="form-answer-text-input-edit" class="form-control" rows="3" type="text" name="flashcard-answer" value="${Elements.formEditFlashcard.answerTextInput.innerHTML}" placeholder="At least 4." required min length ="1"></textarea>
    `;
}

