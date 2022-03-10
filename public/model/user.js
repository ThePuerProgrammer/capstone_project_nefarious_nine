export class User{
    constructor(data){
        this.email = data.email;
        this.decksStudying = data.decksStudying;
        this.defaultTimerSetting = [30, 3];
        this.coins = data.coins;
        this.pet = data.pet;
        this.deckNumber = data.deckNumber;
        // TODO: SHOP STUFF
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
                email: this.email,
                decksStudying: this.decksStudying,
                defaultTimerSetting: this.defaultTimerSetting,
                coins: this.coins,
                pet: this.pet,
                deckNumber: this.deckNumber,
            };
        }

       static deserialize(data) {
           const user = new User(data);
           user.defaultTimerSetting = data.defaultTimerSetting;
           user.email = data.email;
           user.decksStudying = data.decksStudying;
           user.coins = data.coins;
           user.pet = data.pet;
           user.deckNumber = data.deckNumber;
           return user;
        }

/***************************************************************************
 *                  Type Checking
 * *************************************************************************
 *      This will ensure the user inputs of the correct type. 
 *      Will prompt for an error, claimed in the error tags in index.html 
***************************************************************************/
        static isSerializedProduct(obj){
            
            if(!obj.email || typeof obj.email != 'string') return false;
            // TODO: decks studying type check
        }

}