export class Message {
    constructor(data) {
        this.sender = data.sender;
        this.content = data.content;
        this.timestamp = data.timestamp;
    }

    set_docID(ID) {
        this.docID = ID;
    }

    serialize() {
        return {
            sender: this.sender,
            content: this.content,
            timestamp: this.timestamp,
        }
    }
}