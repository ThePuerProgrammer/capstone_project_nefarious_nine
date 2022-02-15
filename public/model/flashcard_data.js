/**************************************************
*               Created Thread Class
**************************************************/
export class FlashcardData {
    constructor(data){
        this.streak = data.streak;
        this.lastAccessed = data.lastAccessed;
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
        serialize() {
            return {
                lastAccessed: this.lastAccessed,
                streak: this.streak,
            };
        }

/***************************************************************************
 *                  Type Checking
 * *************************************************************************
 *      This will ensure the user inputs of the correct type. 
 *      Will prompt for an error, claimed in the error tags in index.html 
***************************************************************************/
        static isSerializedProduct(obj){
            if(!obj.lastAccessed || typeof obj.lastAccessed != 'number') return false;
            if(!obj.streak || typeof obj.streak != 'number') return false;
        }
}