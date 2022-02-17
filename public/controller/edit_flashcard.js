import * as FirebaseController from './firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'
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
}


export async function edit_flashcard(uid, deckId, docID){
    //console.log(docID);
    let flashcard;
    try{
        flashcard = await FirebaseController.getFlashCardById(uid,deckId,docID);
        if(!flashcard){
            Utilities.info('getFlashCardById Error', 'No flashcard found by the id');
            return;
        }
    } catch (e){
        if(Constant.DEV) console.log(e);
        Utilities.info('Error Firebase Controller', JSON.stringify(e));
        return;
    }

    //Getting Elements from Firebase to Edit Modal
    Elements.formEditFlashcard.form.docId.value = flashcard.docId;
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