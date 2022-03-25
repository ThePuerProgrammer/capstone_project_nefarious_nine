import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'
import * as Coins from '../controller/coins.js'
import { Message } from '../model/message.js'
import { Classroom } from '../model/classroom.js'
import { classrooms_page } from './classrooms_page.js'
import { buildStudyDecksPage } from './study_decks_page.js'


export async function one_classroom_page(classroomDocID) {
    Coins.get_coins();
    console.log(classroomDocID);
    Elements.root.innerHTML = '';
    let html = '';

    let classroom;
    try {
        classroom = await FirebaseController.getOneClassroom(classroomDocID);
    } catch (e) {
        console.log(e);
        Utilities.info('Failed to retrieve classroom', JSON.stringify(e));
    }

    let members = [];
    //get members list
    if (classroom.members != null) {
        for (let k = 0; k < classroom.members.length; k++) {
            members.push(classroom.members[k]);
        }
    }

    let mod = false;
    for (let i = 0; i < classroom.moderatorList.length; i++) { //check if current user is a mod
        if (Auth.currentUser.email == classroom.moderatorList[i]) {
            mod = true;
        }
    }

    // adding classroom, members, and leaderboard tabs
    html += `<div class="classroom-page-tab">
        <button id="classroom-gen-button" class="classroom-tab"><i class="small material-icons">school</i>Classroom</button>
        <button id="classroom-members-button" class="classroom-tab"><i class="small material-icons">group</i>Members</button>
        <button id="classroom-leaderboard-button" class="classroom-tab"><i class="small material-icons">insert_chart</i>Leaderboard</button>
        <button id="classroom-chat-button" class="classroom-tab"><i class="small material-icons">chat</i>Chat</button>
        </div>`;

    // CLASSROOM tab contents
    html += `<div id="Classroom" class="one-classroom-tab-content">
        <h1>${classroom.name}</h1>
        <h4>${classroom.subject}, ${classroom.category}</h4>
        <br>`;

    //if current user is a mod, populate delete button
    //prevents null button error
    if (mod == true) {
        //removed doc id from page view -- Blake
        html += `
            <button id="button-delete-classroom" type="click" class="btn btn-danger pomo-bg-color-md pomo-text-color-dark pomo-font-weight-bold" data-bs-toggle="modal" data-bs-target="#modal-delete-classroom">
            <i class="material-icons">delete</i>Delete Classroom
            </button>`
            ;
    }
    //Building Decks
    // let deckList = [];
    // try {
    //     deckList = await FirebaseController.getClassDecks(classroom.docID);

    // } catch (e) {
    //     console.log(e);
    // }
    // buildStudyDecksPage(deckList);

    html += `</div>`;
    //CLASSROOM TAB END-----------------------------------------------------

    // MEMBERS tab contents
    html += `<div id="Members" class="one-classroom-tab-content">
        <div class="row">
        <div class="column">
        <h2>Members</h2>`;

    // If mod, show members w BAN option
    if (mod == true && members != null) {
        members.forEach(member => {
            html += `<tr>${buildButtons(member, classroom.banlist)}</tr>`;
        })
    } else {
        if (members != null) {
            members.forEach(member => {
                html += `<p>${member}</p>`;
            })
        }
    }

    html += `</div>
        <div class="column">
        <h2>Mods</h2>`;

    // display mods list
    let mods = classroom.moderatorList
    mods.forEach(mod => {
        html += `<p>${mod}</p>`;
    })
    //MEMEMBERS TAB END------------------------------------------------------

    
    //Fetchs Default Leaderboard
    let leaderboardDefault = [];
    leaderboardDefault = await FirebaseController.leaderboardDefault(members);

    html += `</div>
        </div>
        </div>`;

    // LEADERBOARD tab content
    html += `<div id="Leaderboard" class="one-classroom-tab-content">
    <center>
    <div class="leaderboard-main-row"><h2>Leaderboard for ${classroom.name}</h2></div>

        <br/>
        <div id="leaderboard-table">
        <table class="leaderboard-table-default">
            <thead>
            <tr>
                <th class="leaderboard-th">Rank</th>
                <th class="leaderboard-th">User</th>
                <th class="leaderboard-th"><button id="${Constant.htmlIDs.leaderboardCoins}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light"><span><strong>Coins</strong></span></button></th>
                <th class="leaderboard-th"><button id="${Constant.htmlIDs.leaderboardDecks}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light"><span><strong># of Decks</strong></span></button></th>
                <th class="leaderboard-th"><button id="${Constant.htmlIDs.leaderboardFlashcards}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light"><span><strong># of Flashcards</strong></span></button></th>
            </tr>
            </thead>
            <tbody id="leaderboard-fields">`;
            //Builds the cells below the buttons
            if(leaderboardDefault.length>0){           
                let index = 1;
                leaderboardDefault.forEach(e =>{
                    html+= buildLeaderBoard(e, index);
                    index++;
                });
            }
    html+=`</tbody></table></div></center></div>`;
       //HERE
    let messages = [];
    messages = await FirebaseController.getMessages(classroomDocID);

    html += `<div id="Chat" class="one-classroom-tab-content">
        <div id="message-reply-body">`;
    if (messages.length > 0) {
        messages.forEach(m => {
            html += buildMessageView(m);
        })
    } else {
        html += '<p id="temp">No messages have been posted yet...be the first!</p>';
    }
    html += `</div>`;
    //LEADERBOARD TAB END----------------------------------------------------------

    // CHAT tab content
    html += `<div>
    <textarea id="add-new-message" placeholder="Send a message..." style="border: 1px solid #2C1320; width: 700px; height: 150px; background-color: #2C1320; color: #A7ADC6;"></textarea>
    <br>
    <button id="classroom-message-button" style="background-color: #2C1320; color: #A7ADC6;"><i class="small material-icons">send</i> Send</button>
    </div>
    </div>`;

    Elements.root.innerHTML = html;


    // get CLASSROOM tab and show it as visible
    const classroomGenButton = document.getElementById('classroom-gen-button');
    classroomGenButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Classroom').style.display = "block";

        document.getElementById('classroom-gen-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-gen-button').style.color = '#A7ADC6';

        document.getElementById('classroom-chat-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-chat-button').style.color = '#2C1320';

        document.getElementById('classroom-members-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-members-button').style.color = '#2C1320';

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-leaderboard-button').style.color = '#2C1320';

    })

    // get MEMBERS tab and show it as visible
    const classroomMembersButton = document.getElementById('classroom-members-button');
    classroomMembersButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Members').style.display = "block";

        document.getElementById('classroom-members-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-members-button').style.color = '#A7ADC6';

        document.getElementById('classroom-gen-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-gen-button').style.color = '#2C1320';

        document.getElementById('classroom-chat-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-chat-button').style.color = '#2C1320';

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-leaderboard-button').style.color = '#2C1320';
    })

    // get LEADERBOARD tab and show it as visible
    const classroomLeaderboardButton = document.getElementById('classroom-leaderboard-button');
    classroomLeaderboardButton.addEventListener('click', e => {
        // clear all tabs contents
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Leaderboard').style.display = "block";

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-leaderboard-button').style.color = '#A7ADC6';

        document.getElementById('classroom-gen-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-gen-button').style.color = '#2C1320';

        document.getElementById('classroom-chat-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-chat-button').style.color = '#2C1320';

        document.getElementById('classroom-members-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-members-button').style.color = '#2C1320';
    })

    //html+=`</table></center></div>`;
    //SORT BY COINS
    const sortByCoinsButton = document.getElementById(Constant.htmlIDs.leaderboardCoins);
    sortByCoinsButton.addEventListener('click', async e=>{
        console.log('clicked COINS');
        let leaderboardCoins = [];
        leaderboardCoins = await FirebaseController.leaderboardByCoins(members);
        document.getElementById('leaderboard-fields').innerHTML=''

        let html2 = ``;
       
        if(leaderboardCoins.length>0){           
            let index = 1;
            leaderboardCoins.forEach(e =>{
                html2+= buildLeaderBoard(e, index);
                index++;
            });
        }
        html2+=`</tbody>`;
        document.getElementById('leaderboard-fields').innerHTML=html2;


        //swapContent(html2);
        //swapContent('Const.htmlIDs.leaderboardCoins');//RETURNED ONLY THE BUTTON
       
    });
    //SORT BY DECKS
    const sortByDecksButton = document.getElementById(Constant.htmlIDs.leaderboardDecks);
    sortByDecksButton.addEventListener('click', async e=>{
        console.log('clicked DECKS');
        let leaderboardDecks = [];
        leaderboardDecks = await FirebaseController.leaderboardByDecks(members);
        document.getElementById('leaderboard-fields').innerHTML=''
        let html2 = ``;
       

        if(leaderboardDecks.length>0){           
            let index = 1;
            leaderboardDecks.forEach(e =>{
                html2+= buildLeaderBoard(e, index);
                index++;
            });
        }
        html2+=`</tbody>`;
        document.getElementById('leaderboard-fields').innerHTML=html2;

    });
    //SORT BY FLASHCARDS
    const sortByFlashcardsButton = document.getElementById(Constant.htmlIDs.leaderboardFlashcards);
    sortByFlashcardsButton.addEventListener('click', async e=>{
        console.log('clicked FLASHCARDS');
        let leaderboardFlashcards = [];
        leaderboardFlashcards = await FirebaseController.leaderboardByFlashcards(members);
        document.getElementById('leaderboard-fields').innerHTML=''
        let html2='';
        if(leaderboardFlashcards.length>0){           
            let index = 1;
            leaderboardFlashcards.forEach(e =>{
                html2+= buildLeaderBoard(e, index);
                index++;
            });
        }
        html2+=`</tbody>`;
        document.getElementById('leaderboard-fields').innerHTML=html2;

    });

    // get CHAT tab and show it as visible 
    const classroomChatButton = document.getElementById('classroom-chat-button');
    classroomChatButton.addEventListener('click', e => {
        // clear all tabs contents
        let tabContents = document.getElementsByClassName("one-classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Chat').style.display = "block";

        document.getElementById('classroom-chat-button').style.backgroundColor = `#2C1320`;
        document.getElementById('classroom-chat-button').style.color = '#A7ADC6';

        document.getElementById('classroom-gen-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-gen-button').style.color = '#2C1320';

        document.getElementById('classroom-members-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-members-button').style.color = '#2C1320';

        document.getElementById('classroom-leaderboard-button').style.backgroundColor = `#A7ADC6`;
        document.getElementById('classroom-leaderboard-button').style.color = '#2C1320';
    })

    // submitting a message
    const messageSubmitButton = document.getElementById("classroom-message-button");
    messageSubmitButton.addEventListener('click', async e => {
        e.preventDefault();
        const messageElement = document.getElementById('add-new-message');
        const content = messageElement.value;
        const sender = Auth.currentUser.email;
        const timestamp = Date.now();
        const message = new Message({
            sender, content, timestamp,
        })
        const docID = await FirebaseController.addNewMessage(classroomDocID, message);
        message.docId = docID;
        const messageTag = document.createElement('div');
        messageTag.innerHTML = buildMessageView(message);
        const tempEl = document.getElementById('temp');
        // delete temp if it's there
        if (tempEl) {
            tempEl.remove();
        }
        document.getElementById('message-reply-body').appendChild(messageTag);
        document.getElementById('add-new-message').value = '';
    });

    // sets CLASSROOM as default
    classroomGenButton.click();


    if (mod == true) { //if owner of classroom, add listener. This avoids null Button errors.
        const deleteButton = document.getElementById('button-delete-classroom'); //delete button on page

        deleteButton.addEventListener('click', async e => {
            Elements.modalDeleteClassroom.show();
        })

        const confirmDeleteClassroom = document.getElementById('yes-delete-classroom-button'); //delete button on modal
        confirmDeleteClassroom.addEventListener("click", async e => {
            e.preventDefault();
            await classrooms_page();
            const deletedClassName = classroom.name;
            
            await FirebaseController.deleteClassroom(classroomDocID);
            Utilities.info('Success', `Classroom: ${deletedClassName} deleted.`);
            await classrooms_page();

            
        })
    } //end of mod listeners



    const banButtons = document.getElementsByClassName('form-ban-members');
    //this will add ban functionality to each member button
    for (let i = 0; i < banButtons.length; ++i) {
        banButtons[i].addEventListener("submit", async e => {
            e.preventDefault();
            await FirebaseController.banMember(classroomDocID, e.target.membername.value);
            await one_classroom_page(classroomDocID);
        })
    }

    //this will add unban functionality to each member button
    const unbanButtons = document.getElementsByClassName('form-unban-members');
    for (let i = 0; i < unbanButtons.length; i++) {
        unbanButtons[i].addEventListener("submit", async e => {
            e.preventDefault();
            await FirebaseController.unbanMember(classroomDocID, e.target.membername.value);
            await one_classroom_page(classroomDocID);
        })
    }
}




function buildMessageView(message) {
    return `
    <div class="border" style="border-color: #2C1320">
        <div style="background-color: #2C1320; color: #A7ADC6;">
            Posted by ${message.sender} at ${new Date(message.timestamp).toString()}
        </div>
        ${message.content};
    </div>
    <hr>`;
}

function buildButtons(member, banlist) {
    let onlist = false;
    for (let i = 0; i < banlist.length; i++) {
        if (banlist[i] == member) {
            onlist = true;
        }
    }
    if (onlist == false) { //If user is not banned
        //span is used to change text values on hover using css. See here https://stackoverflow.com/questions/9913293/change-text-on-hover-then-return-to-the-previous-text
        return `
                <form class="form-ban-members" method="post">
                <input type="hidden" name="membername" value="${member}">
                <button id="ban-btn" type="submit" class="btn ban-btn-expand-width pomo-bg-color-dark pomo-text-color-light edit-btn-hover ban-btn-hover btn-sm"><span class="membas">${member}
                </span>
                <span class="byebye">BAN</span>
                </button>
                </form>
                <br>
                `;
    }
    else { //else user is on ban list
        return `
                <form class="form-unban-members" method="post">
                <input type="hidden" name="membername" value="${member}">
                <button id="ban-btn" type="submit" class="btn ban-btn-expand-width pomo-bg-color-dark pomo-text-color-light edit-btn-hover-blue ban-btn-hover btn-sm"><span class="membas">${member}
                </span>
                <span class="byebye">UNBAN</span>
                </button>
                </form>
                <br>
                `;
    }

}

function buildLeaderBoard(e,i){
   return `
    <tr>
        <td class="leaderboard-td">${i}</td>
        <td class="leaderboard-td">${e.email}</td>
        <td class="leaderboard-td">${e.coins}</td>
        <td class="leaderboard-td">${e.deckNumber}</td>
        <td class="leaderboard-td">${e.flashcardNumber}</td>
    </tr>`;
}
//REFERENCE:https://stackoverflow.com/questions/37347690/how-to-replace-div-with-another-div-in-javascript

function swapContent (id) {
    const main = document.getElementById('leaderboard-table').lastElementChild;
    const div = document.getElementById(id).lastElementChild;
    //const clone = div.cloneNode();
    const clone = div.cloneNode(true);
    while (main.firstChild) main.firstChild.remove();

    main.appendChild(clone);
}

// function buildDeckView(deck){
//     window.sessionStorage;
//     let html = `
//     <div id="${deck.docId}" class="deck-card">
//         <div class="deck-view-css">
//         <div class="card-body">
//             <h5 class="card-text">${deck.name}</h5>
//             <h6 class="card-text" >Subject: ${deck.subject}</h6>
//             <h6 class="card-text">Category: ${deck.category}</h6>
//             <h7 class="card-text"># of flashcards: ${deck.flashcardNumber}</h7>
//             <p class="card-text">Created: ${new Date(deck.dateCreated).toString()}</p>
//         </div>
//         <div class="btn-group">
//         <form class="form-view-deck" method="post">
//             <input type="hidden" name="docId" value="${deck.docId}">
//             <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
//             <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
//         </form>
//         <form class="form-edit-deck" method="post">
//             <input type="hidden" name="docId" value="${deck.docId}">
//             <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
//             <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">edit</i>Edit</button>
//         </form>
//         <form class="form-delete-deck" method="post">
//             <input type="hidden" name="docId" value="${deck.docId}">
//             <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
//             <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">delete</i>Delete</button>
//         </form>
//         </div>`;

//     // ternary operator to check if a deck is favorited or not
//     html += deck.isFavorited ? `<div class="form-check">
//         <span class="favorite-deck">
//         <input class="favorite-checkbox form-check-input" type="checkbox" value="${deck.docId}" id="favorited" checked>
//         </span>

//         <label class= "form-check-label pomo-text-color-light" for="favorited"><i class="material-icons pomo-text-color-light">favorite</i>Favorite deck</label>
//         </div>
//         </div>
//         </div>
//         ` : `<div class="form-check">
//         <span class="unfavorite-deck">
//         <input class="favorite-checkbox form-check-input" type="checkbox" value="${deck.docId}" id="favorited">
//         </span>
//         <label class="form-check-label pomo-text-color-light" for="favorited"><i class="material-icons pomo-text-color-light">favorite_border</i>Favorite deck</label>
//         </div>
//         </div>
//         </div>`;
//     return html;
// }
