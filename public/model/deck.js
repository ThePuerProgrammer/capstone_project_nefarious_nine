/**************************************************
 *               Create Deck Class
 **************************************************/
export class Deck {
    constructor(data) {
        this.name = data.name;
        this.subject = data.subject;
        this.dateCreated = data.dateCreated;

        // FOR FUTURE USE AND EXPANSION
        //this.isPublic = data.isPublic

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

    // to store in Firestore
    serialize() {
        return {
            name: this.name,
            subject: this.subject,
            dateCreated: this.dateCreated,

            // FOR FUTURE USE AND EXPANSION
            //isPublic: this.isPublic,

        };
    }
}