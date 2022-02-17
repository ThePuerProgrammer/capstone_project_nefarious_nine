import * as FirebaseController from './firebase_controller.js'
import * as Auth from './firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'
import { Flashcard } from '../model/flashcard.js';
// import * as Flashcard from './/model/flashcard.js'

 let imageFile2UploadAnswer;
 let imageFile2UploadQuestion;

let imageAnswer = Elements.formEditFlashcard.answerImageContainer;
let imageQuestion = Elements.formEditFlashcard.questionImageContainer;

export function addEventListeners(){
    Elements.formEditFlashcard.answerImageButton.addEventListener('change', e=> {
        imageFile2UploadAnswer = e.target.files[0];
        if(!imageFile2UploadAnswer){
            Elements.formEditFlashcard.answerImageTag.src=null;
            Elements.formEditFlashcard.answerImageToggle.checked=false;
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
            Elements.formEditFlashcard.questionImageTag.src=null;
            Elements.formEditFlashcard.questionImageToggle.checked=false;
            return;
        }
        Elements.formEditFlashcard.questionImageToggle.checked=true;
        const reader = new FileReader();
        reader.onload = () => (Elements.formEditFlashcard.questionImageTag.src= reader.result);
        reader.readAsDataURL(imageFile2UploadQuestion);
    });

    //Checks for the Image Question Toggle
    Elements.formEditFlashcard.questionImageToggle.addEventListener("click", async (e) => {
        // TOGGLE ON
        checkImageQuestion();
    });
    
    //Checks for the Image Answer Toggle
    Elements.formEditFlashcard.answerImageToggle.addEventListener("click", async (e) => {
        // TOGGLE IS ON
        checkImageAnswer();
    });
    Elements.formEditFlashcard.form.addEventListener('submit', async e=> {
        e.preventDefault();
        const button = e.target.getElementsByTagName('button')[0];
        const label = Utilities.disableButton(button);

        const fc = new Flashcard({
            question:           e.target.question.value,
            answer:             e.target.answer.value,
            //ROAD BLOCK
            //isMultipleChoice:   e.target.isMultipleChoice.value,
            //incorrectAnswers:   e.target.incorrectAnswers.value,
            
            //Picture Related DATA
            questionImageName:  e.target.questionImageName.value,
            answerImageName:    e.target.answerImageName.value,
        });
        fc.set_docID(e.target.docId.value);
        console.log(`fc.docID:${fc.docID}`);
        let editDeckDocId = e.target.deckDocId.value;
        console.log(`DeckDocId: ${e.target.deckDocId.value}`);
        console.log(`editDeckDocId: ${editDeckDocId}`);



        //Firestore
        try{
            if(imageFile2UploadAnswer){
                const imageAnswerInfo = await FirebaseController.uploadImageToFlashcardAnswer(imageFile2UploadAnswer, 
                    e.target.answerImageName.value);
                fc.answerImageURL = imageAnswerInfo.answerImageURL;
            }

            if(imageFile2UploadQuestion){
                const imageQuestionInfo = await FirebaseController.uploadImageToFlashcardAnswer(imageFile2UploadQuestion, 
                    e.target.questionImageName.value);
                fc.questionImageURL = imageQuestionInfo.questionImageURL;
            }

            //Update Firestore
            await FirebaseController.updateFlashcard(Auth.currentUser.uid, editDeckDocId,fc,fc.docId);
            //await FirebaseController.updateFlashcard(fc, fc.docID);
            //Update Browser
        } catch(e){
            if(Constant.DEV) console.log(e);
            Utilities.info('Update Flashcard Error', JSON.stringify(e));
        }
        //Enabling button after process
        Utilities.enableButton(button,label);

    });
}


export async function edit_flashcard(uid, deckId, docId){
    console.log(docId);
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

    //Verifying Toggles
    const isMultipleChoice = Elements.formEditFlashcard.multipleChoiceToggle;
    const isQuestionImage = Elements.formEditFlashcard.questionImageToggle;
    const isAnswerImage = Elements.formEditFlashcard.answerImageToggle;

    if(!flashcard.questionImageName||flashcard.questionImageName=='N/A'){
        isQuestionImage.checked=false;
        checkImageQuestion();
    } else {
        isQuestionImage.checked=true;
        checkImageQuestion();

    }
    if(!flashcard.answerImageName||flashcard.answerImageName=='N/A'){
        isAnswerImage.checked=false;
        checkImageAnswer();
    } else {
        isAnswerImage.checked=true;
        checkImageAnswer();
    }

    Elements.modalEditFlashcard.show();
}

//Method to display the container for question image.
function checkImageQuestion(){
    if (Elements.formCheckInputIsImageQuestion.checked) {
      if(imageQuestion.style.display=='none'){
        imageQuestion.style.display = 'block';
      } else{
        imageQuestion.style.display = 'none';
      }
    } else if(!Elements.formCheckInputIsImageQuestion.checked){
      if(imageQuestion.style.display=='none'){
        imageQuestion.style.display = 'block';
      } else{
        imageQuestion.style.display = 'none';
      }
    }
}

//Method to display the container for answer image.
function checkImageAnswer(){
    if (Elements.formCheckInputIsImageAnswer.checked) {
      if(imageAnswer.style.display=='none'){
        imageAnswer.style.display = 'block';
      } else{
        imageAnswer.style.display = 'none';
      }
    }
    else if(!Elements.formCheckInputIsImageAnswer.checked){
      if(imageAnswer.style.display=='none'){
        imageAnswer.style.display = 'block';
      } else{
        imageAnswer.style.display = 'none';
      }
    }
}

