import * as FirebaseController from './firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'
// import * as Flashcard from './/model/flashcard.js'

// let imageFile2UploadAnswer;
// let imageFile2UploadQuestion;


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
}