/**************************************************
*               Created Thread Class
**************************************************/
export class Flashcard{
    constructor(data){

        this.question = data.question.trim();
        this.answer = data.answer.trim();
        this.isMultipleChoice = data.isMultipleChoice;
        this.incorrectAnswers = data.incorrectAnswers;
        this.deckId = data.deckId;

        //Picture Related DATA
        this.questionImageName = data.questionImageName;
        this.questionImageURL = data.questionImageURL;
        this.answerImageName = data.answerImageName;
        this.answerImageURL = data.answerImageURL;
        
    }




/**************************************************
     *      Setter for the Document ID
**************************************************/
    set_docID(ID){
        this.docID = ID;
    }

/************************************************************************
     *                          toFirestore Method
     ********************************************************************
     *      This method will serialize the data so 
     *      that it will be compatible with the 
     *      Firestore. A link to supported types:
     *      https://cloud.google.com/firestore/docs/concepts/data-types
     *      Acceptable types:
     *      -boolean
     *      -array
     *      -string
     *      -map
     *      -timestamp
     *      -floating-point & integer
**************************************************************************/
        serialize() {   // Older Parameter [serialize(timestamp)], but we may not need a creation timestamp
                        // for each flashcard.
            return {
                question:               this.question,
                answer:                 this.answer,
                isMultipleChoice:       this.isMultipleChoice,
                incorrectAnswers:       this.incorrectAnswers,
                questionImageName:      this.questionImageName, 
                questionImageURL:       this.questionImageURL, 
                answerImageName:        this.answerImageName, 
                answerImageURL:         this.answerImageURL,
                deckId:                 this.deckId,

            };
        }

/***************************************************************************
 *                  Type Checking
 * *************************************************************************
 *      This will ensure the user inputs of the correct type. 
 *      Will prompt for an error, claimed in the error tags in index.html 
***************************************************************************/
        static isSerializedFlashcard(obj){
            
            if(!obj.questionImageURL || !obj.questionImageURL.include('https')) return false; 
            if(!obj.answerImageURL || !obj.answerImageURL.include('https')) return false;
            if(!obj.questionImageName || typeof obj.questionImageName != 'string') return false;
            if(!obj.answerImageName || typeof obj.answerImageName != 'string') return false;
            if(!obj.question || typeof obj.question != 'string') return false;
            if(!obj.answer || typeof obj.answer != 'string') return false;
            if(!obj.isMultipleChoice || typeof obj.isMultipleChoice != 'boolean') return false;
            if(!obj.deckId || typeof obj.deckId != 'string') return false;
        }

/***************************************************************************
 *                  Serialization For Editing/Updating
 * *************************************************************************
 *      This will allow updating to be serialized, prevents errors on the 
 *      firebase side.  
***************************************************************************/
        serializeForUpdate(){
            const fc = {};
            if(this.question) fc.question = this.question;
            if(this.answer) fc.answer = this.answer;
            if(this.incorrectAnswers) fc.incorrectAnswers = this.incorrectAnswers;
            if(this.isMultipleChoice) fc.isMultipleChoice = this.isMultipleChoice;
            if(this.questionImageName) fc.questionImageName = this.questionImageName;
            if(this.questionImageURL) fc.questionImageURL = this.questionImageURL;
            if(this.answerImageName) fc.answerImageName = this.answerImageName;
            if(this.answerImageURL) fc.answerImageURL = this.answerImageURL;
            if(this.deckId) fc.deckId = this.deckId;

            return fc;
        }

}