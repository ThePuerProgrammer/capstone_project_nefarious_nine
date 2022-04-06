import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'
import * as Coins from '../controller/coins.js'
import * as DeckPage from './deck_page.js'
import * as EditDeck from '../controller/edit_deck.js'
import * as Search from './search_page.js'
import { Deck } from '../model/Deck.js'
import { Message } from '../model/message.js'
import { Classroom } from '../model/classroom.js'
import { classrooms_page } from './classrooms_page.js'
import { html } from './protected_message.js'

//Same code as study_decks page with a few minor tweeks to be specific for classes
export function addEventListeners(){
        // CREATE A DECK Submit button event listener
        Elements.formCreateClassroomDeck.addEventListener('submit', async e => {
            e.preventDefault();
            const name = e.target.name.value;
            const subject = e.target.subject.value;
            const isFavorited = false;
            const category = e.target.selectCategory.value;
            const isClassDeck = e.target.selectClassroom.value;
            const flashcardNumber = 0;
            const created_by = Auth.currentUser.uid
            const isMastered = false;
            //NOTE: If no class was chosen, isClassDeck value will be false.
            // Otherwise, the value will be the CLASSROOM DOC ID tied to the deck.
    
            //if there is no class selected, the deck is not a class deck
    
            const keywords = Search.cleanDataToKeywords(name, subject, category)
    
            // relevant to Cody's story:
            const dateCreated = Date.now();
    
            const deck = new Deck({
                name,
                subject,
                dateCreated,
                isFavorited,
                category,
                keywords,
                isClassDeck,
                flashcardNumber,
                created_by,
                isMastered,
    
            });
                // a class is tied to this deck, isClassDeck is now the classroom DOCID its tied to
            try {
                //Passes Class ID, since it is a Class Deck
                //deck.created_by=isClassDeck;

                console.log("Creating Deck");
                const deckId = await FirebaseController.createClassDeck(deck.isClassDeck, deck);
                console.log("Deck Created");
                deck.docId = deckId;
                localStorage.setItem("deckPageDeckDocID", deck.docId);
                sessionStorage.setItem('deckId', deckId);
                sessionStorage.setItem('cameFromClassDeck', true); 
                history.pushState(null, null, Routes.routePathname.DECK + '#' + deckId);
                Elements.modalCreateClassroomDeck.hide();
                //history.pushState(null, null, Routes.routePathname.DECK + "#" + deck.docId);
                await DeckPage.deck_page(deckId, deck.isClassDeck);
            } catch (e) {
                if (Constant.DEV)
                    console.log(e);
            }
    
        });
    
        // Clears CREATE DECK input fields when user closes modal
        $(`#create-deck-modal`).on('hidden.bs.modal', function (e) {
            Elements.formCreateClassroomDeck.reset();
        });
    
}

export async function one_classroom_page(classroomDocID) {
    try{
        await Coins.get_coins(Auth.currentUser.uid);
    } catch(e) {if(Constant.DEV)console.log(e);}

    console.log(classroomDocID);
    Elements.root.innerHTML = '';
    let html = '';
    let coin_descend=false;
    let deck_descend=false;
    let fc_descend=false;

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

    html += `<button id="${Constant.htmlIDs.createClassroomDeck}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">
        <i class="material-icons pomo-text-color-light">add</i> Create A Deck</button>
     `;
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
    html+=`<br>
            <div id = "deck-container">`;
    //Adding Class Decks Here
    let classDecks = [];
    classDecks = await FirebaseController.getClassDecks(classroomDocID);
    if (classDecks.length == 0) {
        html += `<h2> There are currently no decks for this classroom!\n 
                Go create some and get to studying!</h2>`
    } else {
    for (let i = 0; i < classDecks.length; i++) {
            let flashcards = await FirebaseController.getClassroomFlashcards(classroomDocID, classDecks[i].docId);
            html += buildDeckView(classDecks[i], flashcards, classroom);
        }
    }
    html+=`</div></div>`

   



    //CLASSROOM TAB END-----------------------------------------------------

    // MEMBERS tab contents -----------------------------------------------------

    let memberInfo = [];
    memberInfo = await FirebaseController.getMemberInfo(members);

    html += `<div id="Members" class="one-classroom-tab-content pomo-text-color-dark">
        <div class="row-classroom">
        <div class="column-classroom" style="display: inline-block;">
        <h2>Members</h2>`;

    // If mod, show members w BAN option
    if (mod == true && members != null) {
        html += `<div class="row-memberInfo">
            <div class="column-memberInfo" style="flex: 50%;">`;
    }

    if (members != null) {
        memberInfo.forEach(mem => {
            let memProfile = "profile_" + mem.username;
            html += `<div class="classroom-members-info">
            <br>
            <div  style="display: inline-block;">
            <img src="${mem.profilePhotoURL}" class="pfp" style="width: 65px; height: 65px; object-fit: cover; margin-right: 10px;">
            </div>
            <div  style="display: inline-block;">
            <form class="form-member-profile" method="post">
            <input type="hidden" name="pfpURL" value="${mem.profilePhotoURL}">
            <input type="hidden" name="username" value="${mem.username}">
            <input type="hidden" name="userBio" value="${mem.userBio}">
            <input type="hidden" name="petName" value="${mem.petName}">
            <input type="hidden" name="petPhotoURL" value="${mem.petPhotoURL}">
            <input type="hidden" name="equippedSkin" value="${mem.equippedSkin}">
            <input type="hidden" name="equippedAcc" value="${mem.equippedAcc}">
            <button type="submit" class="classroom-members-profile-btn pomo-text-color-dark" id="${memProfile}" 
            style="font-size: 25px; font-weight: bold;">${mem.username}</button>
            </form>
            </div>
            <br>
            </div>`;
        })
    }

    // If mod, show members w BAN option
    if (mod == true && members != null) {
        html += `</div>
            <div class="column-memberInfo" style="flex: 50%;">`;

        memberInfo.forEach(mem => {
            html += `<br>
                <tr>${buildButtons(mem.email, classroom.banlist)}</tr>
                <br>`; 
        })

        html += `</div>
        </div>`;
    }

    html += `</div>
        <div class="column-classroom style="display: inline-block;">
        <h2>Mods</h2>`;

    // display mods list
    let mods = classroom.moderatorList
    mods.forEach(mod => {
        html += `<br>
            <div  style="display: inline-block;"> 
            <h4 style=""><i class="small material-icons pomo-text-color-dark">shield</i>${mod}</h4>
            </div>`;
    })

    html += `</div>`;

    //MEMBERS TAB END------------------------------------------------------

    
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
                <th class="leaderboard-th"><button id="${Constant.htmlIDs.leaderboardCoins}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light"><span ><strong id="coins-button-icon">Coins</strong></span></button></th>
                <th class="leaderboard-th"><button id="${Constant.htmlIDs.leaderboardDecks}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light"><span><strong id="decks-button-icon"># of Decks</strong></span></button></th>
                <th class="leaderboard-th"><button id="${Constant.htmlIDs.leaderboardFlashcards}" type="button" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light"><span><strong id="flashcards-button-icon"># of Flashcards</strong></span></button></th>
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
    //LEADERBOARD TAB END----------------------------------------------------------
    // CHAT tab content

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
    const viewDeckButtons = document.getElementsByClassName('form-view-deck');
    for (let i = 0; i < viewDeckButtons.length; i++) {
        viewDeckButtons[i].addEventListener('submit', async e => {
            e.preventDefault();
            let deckId = e.target.docId.value;
            let isClassDeck = e.target.classdocId.value;
            console.log("check for form view deck submit event " + e.target.classdocId.value);

            window.sessionStorage;
            sessionStorage.setItem('deckId', deckId);
            sessionStorage.setItem('isClassDeck', isClassDeck)

            history.pushState(null, null, Routes.routePathname.DECK + '#' + deckId);
            sessionStorage.setItem('cameFromClassDeck', true); 
            await DeckPage.deck_page(deckId, isClassDeck);
        })
    }

    const editDeckForms = document.getElementsByClassName('form-edit-deck');
    for (let i = 0; i < editDeckForms.length; i++) {
        editDeckForms[i].addEventListener('submit', async e => {
            //prevents refresh on submit of form
            e.preventDefault();
            if (e.target.classdocId.value == "false") { //if not a class deck
                await EditDeck.edit_deck(Auth.currentUser.uid, e.target.docId.value);
            } else {//else is a class deck
                let classDocID = e.target.classdocId.value;
                await EditDeck.edit_class_deck_from_classroom(classDocID, e.target.docId.value);
            }
        });
    }
    let confirmation = false;
    const deleteDeckForms = document.getElementsByClassName('form-delete-deck');
    for (let i = 0; i < deleteDeckForms.length; i++) {
        deleteDeckForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Utilities.disableButton(button);
            let deckId = e.target.docId.value;
            let classDocID = e.target.classdocId.value;
            Elements.modalDeleteDeckConfirmation.show();
            const button2 = document.getElementById('modal-confirmation-delete-deck-yes');
            button2.addEventListener("click", async e => {
                    confirmation = true;
                    await EditDeck.delete_class_deck_from_classroom(deckId, confirmation, classDocID, Auth.currentUser.uid);
            });
            Utilities.enableButton(button, label);
        });
    }
    const createDeckButton = document.getElementById(Constant.htmlIDs.createClassroomDeck);
    createDeckButton.addEventListener('click', async e => {
        Elements.formCreateClassroomDeck.reset();
        // call Firebase func. to retrieve categories list
        let categories;
        try {
            categories = await FirebaseController.getCategories();
            //console.log(cat);
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }

        // clear innerHTML to prevent duplicates
        Elements.formClassroomDeckCategorySelect.innerHTML = '';

        categories.forEach(category => {
            Elements.formClassroomDeckCategorySelect.innerHTML += `
                      <option value="${category}">${category}</option>
                  `;
        });

        Elements.formClassroomClassSelect.innerHTML = '';
        //logic for if the dropdown box selection on create deck is NONE or is a CLASSROOM
        Elements.formClassroomClassSelect.innerHTML += `
                    <option value="${classroomDocID}">${classroom.name}</option>
                  `;

        // opens create Deck modal
        $(`#${Constant.htmlIDs.createClassroomDeckModal}`).modal('show');
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
        //Passing Correct Values for the Method
        if(!coin_descend){
            coin_descend=true;
            deck_descend=false;
            fc_descend=false;
            leaderBoardIcon("coin_descend");
        } else{
            coin_descend=false;
            deck_descend=false;
            fc_descend=false;
            leaderBoardIcon("coin_ascend");
        }
        
        //Building Rows of Table/Reordering
        let leaderboardCoins = [];
        let html2 = ``;
        if(coin_descend){//Descending
            leaderboardCoins = await FirebaseController.leaderboardByCoins(members);
            document.getElementById('leaderboard-fields').innerHTML=''
            if(leaderboardCoins.length>0){           
                let index = 1;
                leaderboardCoins.forEach(e =>{
                    html2+= buildLeaderBoard(e, index);
                    index++;
                });
            }
        } else {//Ascending
            leaderboardCoins = await FirebaseController.leaderboardByCoinsAscending(members);
            document.getElementById('leaderboard-fields').innerHTML='';   
            if(leaderboardCoins.length>0){           
                let index = leaderboardCoins.length;
                leaderboardCoins.forEach(e =>{
                    html2+= buildLeaderBoard(e, index);
                    index--;
                });
            }
        }
        
        html2+=`</tbody>`;
        document.getElementById('leaderboard-fields').innerHTML=html2;      
    });
    //SORT BY DECKS
    const sortByDecksButton = document.getElementById(Constant.htmlIDs.leaderboardDecks);
    sortByDecksButton.addEventListener('click', async e=>{
        console.log('clicked DECKS');
        
        //Passing Correct Values for the Method
        if(!deck_descend){
            coin_descend=false;
            deck_descend=true;
            fc_descend=false;
            leaderBoardIcon("deck_descend");
        } else{
            coin_descend=false;
            deck_descend=false;
            fc_descend=false;
            leaderBoardIcon("deck_ascend");
        }
        
        let leaderboardDecks = [];
        let html2 = ``;

        if(deck_descend){//Descending
            leaderboardDecks = await FirebaseController.leaderboardByDecks(members);
            document.getElementById('leaderboard-fields').innerHTML=''
            if(leaderboardDecks.length>0){           
                let index = 1;
                leaderboardDecks.forEach(e =>{
                    html2+= buildLeaderBoard(e, index);
                    index++;
                });
            }
        } else {//Ascending
            leaderboardDecks = await FirebaseController.leaderboardByDecksAscending(members);
            document.getElementById('leaderboard-fields').innerHTML=''
            if(leaderboardDecks.length>0){           
                let index = leaderboardDecks.length;
                leaderboardDecks.forEach(e =>{
                    html2+= buildLeaderBoard(e, index);
                    index--;
                });
            }
        }
      
        html2+=`</tbody>`;
        document.getElementById('leaderboard-fields').innerHTML=html2;

    });
    //SORT BY FLASHCARDS
    const sortByFlashcardsButton = document.getElementById(Constant.htmlIDs.leaderboardFlashcards);
    sortByFlashcardsButton.addEventListener('click', async e=>{
        console.log('clicked FLASHCARDS');
        
        //Passing Correct Values for the Method
        if(!fc_descend){
            coin_descend=false;
            deck_descend=false;
            fc_descend=true;
            leaderBoardIcon("fc_descend");
        } else{
            coin_descend=false;
            deck_descend=false;
            fc_descend=false;
            leaderBoardIcon("fc_ascend");
        }

        
        let leaderboardFlashcards = [];
        let html2='';

        if(fc_descend){//Ascending
            leaderboardFlashcards = await FirebaseController.leaderboardByFlashcards(members);
            document.getElementById('leaderboard-fields').innerHTML=''
            if(leaderboardFlashcards.length>0){           
                let index = 1;
                leaderboardFlashcards.forEach(e =>{
                    html2+= buildLeaderBoard(e, index);
                    index++;
                });
            }
        } else {//Descending
            leaderboardFlashcards = await FirebaseController.leaderboardByFlashcardsAscending(members);
            document.getElementById('leaderboard-fields').innerHTML=''
            if(leaderboardFlashcards.length>0){           
                let index = leaderboardFlashcards.length;
                leaderboardFlashcards.forEach(e =>{
                    html2+= buildLeaderBoard(e, index);
                    index--;
                });
            }
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

    const memberProfileButtons =
    document.getElementsByClassName("form-member-profile");

    // Add event listeners for each MEMBER button
    for (let i = 0; i < memberProfileButtons.length; i++) {
        memberProfileButtons[i].addEventListener('submit', async (e) => {
            e.preventDefault();
            const profilePhotoURL = e.target.pfpURL.value;
            const username = e.target.username.value;
            const userBio = e.target.userBio.value;
            const petName = e.target.petName.value;
            const petPhotoURL = e.target.petPhotoURL.value;
            const equippedSkin = e.target.equippedSkin.value;
            const equippedAcc = e.target.equippedAcc.value;


            Elements.displayMemberProfile.profilePictureTag.src = `${profilePhotoURL}`;
            Elements.displayMemberProfile.username.innerHTML = `${username}`;
            Elements.displayMemberProfile.userBio.innerHTML = `${userBio}`;

            // if no equipped skin
            if (equippedSkin == "") {
                Elements.displayMemberProfile.pomopet.src = `${petPhotoURL}`;
            } else {
                let equippedSkinURL;
                try {
                    equippedSkinURL = await FirebaseController.getEquippedSkinURL(equippedSkin);
                } catch (e) {
                    console.log(e);
                }
                Elements.displayMemberProfile.pomopet.src = `${equippedSkinURL}`;
            }

            // if equipped acc
            if (equippedAcc != "") {
                let equippedAccURL;
                try {
                    equippedAccURL = await FirebaseController.getEquippedAccURL(equippedAcc);
                } catch (e) {
                    console.log(e);
                }
                Elements.displayMemberProfile.pomopetAcc.style.display = "block";
                Elements.displayMemberProfile.pomopetAcc.src = `${equippedAccURL}`;
            } else {
                Elements.displayMemberProfile.pomopetAcc.style.display = "none";
            }

            Elements.displayMemberProfile.pomopetName.innerHTML = `${petName}`;
    
            // opens member Profile modal
            $(`#${Constant.htmlIDs.memberProfileModal}`).modal('show');
    });
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
//Builds the table body, by rows
function buildLeaderBoard(e,i){
   let html3='' 
   html3+=(i==1) ?`
    <tr>
        <td class="leaderboard-td"><i class="material-icons">whatshot</i> </td>`
    :
    `<tr>
         <td class="leaderboard-td">${i} </td>`;
    html3+=(e.email==Auth.currentUser.email)?`
        <td class="leaderboard-td"><i class="material-icons">person</i> ${e.email}  </td>
        <td class="leaderboard-td">${e.coins} </td>
        <td class="leaderboard-td">${e.deckNumber} </td>
        <td class="leaderboard-td">${e.flashcardNumber} </td>
    </tr>`
    :
`    <td class="leaderboard-td">${e.email} </td>
    <td class="leaderboard-td">${e.coins} </td>
    <td class="leaderboard-td">${e.deckNumber} </td>
    <td class="leaderboard-td">${e.flashcardNumber }</td>
    </tr>`
    ;
    return html3;
}
//Adds Icons to the buttons of the table
function leaderBoardIcon(ordering){
    switch(ordering){
        case "coin_descend":
            document.getElementById('coins-button-icon').innerHTML =`Coins<br> <i class="material-icons">vertical_align_bottom</i>`;
            document.getElementById('decks-button-icon').innerHTML = `# of Decks`;
            document.getElementById('flashcards-button-icon').innerHTML = `# of Flashcards`;
            break;
        case "deck_descend":
            document.getElementById('coins-button-icon').innerHTML =`Coins`;
            document.getElementById('decks-button-icon').innerHTML = `# of Decks <br> <i class="material-icons">vertical_align_bottom</i>`;
            document.getElementById('flashcards-button-icon').innerHTML = `# of Flashcards`;
            break;
        case "fc_descend":
            document.getElementById('coins-button-icon').innerHTML =`Coins`;
            document.getElementById('decks-button-icon').innerHTML = `# of Decks`;
            document.getElementById('flashcards-button-icon').innerHTML = `# of Flashcards <br> <i class="material-icons">vertical_align_bottom</i>`;
            break;
        case "coin_ascend":
            document.getElementById('coins-button-icon').innerHTML =`Coins<br> <i class="material-icons">vertical_align_top</i>`;
            document.getElementById('decks-button-icon').innerHTML = `# of Decks`;
            document.getElementById('flashcards-button-icon').innerHTML = `# of Flashcards`;
            break;    
        case "deck_ascend":
            document.getElementById('coins-button-icon').innerHTML =`Coins`;
            document.getElementById('decks-button-icon').innerHTML = `# of Decks <br> <i class="material-icons">vertical_align_top</i>`;
            document.getElementById('flashcards-button-icon').innerHTML = `# of Flashcards`;
            break;
        case "fc_ascend":
            document.getElementById('coins-button-icon').innerHTML =`Coins`;
            document.getElementById('decks-button-icon').innerHTML = `# of Decks`;
            document.getElementById('flashcards-button-icon').innerHTML = `# of Flashcards <br> <i class="material-icons">vertical_align_top</i>`;
            break;
    }
}
function buildDeckView(deck, flashcards, clase) {
    let html = '';
    html+=`
    <div id="${deck.docId}" class="deck-card">
        <div class="deck-view-css">
        <div class="card-body">
            <h5 class="card-text">${deck.name}</h5>
            <h6 class="card-text" >Subject: ${deck.subject}</h6>
            <h6 class="card-text">Category: ${deck.category}</h6>
            <h7 class="card-text"># of flashcards: ${flashcards.length}</h7>
            <p class="card-text">Created: ${new Date(deck.dateCreated).toString()}</p>
            <p class="pomo-text-color-light"><i class="small material-icons pomo-text-color-light">school</i>${clase.name}</p></div>`;
    html += `
        <div class="btn-group">
        <form class="form-view-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
        </form>`;
    html +=(deck.created_by == Auth.currentUser.uid || clase.moderatorList.includes(Auth.currentUser.email)) ?`
        <form class="form-edit-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">edit</i>Edit</button>
        </form>
        <form class="form-delete-deck" method="post">
            <input type="hidden" name="docId" value="${deck.docId}">
            <input type="hidden" name="classdocId" value="${deck.isClassDeck}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 12px;"><i class="material-icons pomo-text-color-light">delete</i>Delete</button>
        </form>
        </div></div></div></div>`
        :`</div></div></div></div>`;
    // ternary operator to check if a deck is favorited or not // my changes messed up horizontal view, idk why tho --blake
    return html;
}