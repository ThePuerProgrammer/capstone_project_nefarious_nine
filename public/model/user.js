export class User{
    constructor(data){
        this.email = data.email;
        this.decksStudying = data.decksStudying
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
            };
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

/***************************************************************************
 *                  (UNDER CONSTRUCTION FOR A LATER STORY)
 *                  Serialization For Editing/Updating
 * *************************************************************************
 *      This will allow updating to be serialized, prevents errors on the 
 *      firebase side.  
***************************************************************************/
        // serializeForUpdate(){
        //     const flashcard = {};
        //     if(this.imageName) flashcard.imageName = this.imageName;
        //     if(this.imageURL) flashcard.imageURL = this.imageURL;
        // }

}