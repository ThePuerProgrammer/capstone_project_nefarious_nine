import * as Elements from './elements.js';
import * as Utilities from './utilities.js';
import * as Routes from '../controller/routes.js';
import * as ProtectedMessage from './protected_message.js';
import * as Constants from '../model/constant.js';
import { currentUser } from '../controller/firebase_auth.js';
import { buildDeckView, buildStudyDecksPage } from './study_decks_page.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Auth from '../controller/firebase_auth.js';
import  { buildAvailableClassroom } from './classrooms_page.js';

let searchType;
let searchKeysInfo;
let classSearchOption;


export function addEventListeners() {

    Elements.formSearchBox.addEventListener('submit', async e => {
        e.preventDefault();
        const searchKeys = e.target.searchKeys.value.trim();
        searchKeysInfo = searchKeys;
        if (searchKeys.length==0) {
            Utilities.info('Error', 'No search key found');
            return;
        }
        const button = e.target.getElementsByTagName('button')[0];
        const label = Utilities.disableButton(button);

        const searchKeysArray = searchKeys.toLowerCase(). match(/\S+/g);
        const joinedSearchKeys = searchKeysArray.join(',');

        history.pushState(null, null, Routes.routePathname.SEARCH + '#' + joinedSearchKeys);
        searchType = Elements.searchBoxType.value;
        await search_page(joinedSearchKeys, searchType); //for whichever search you're running

        Utilities.enableButton(button, label);
        e.target.reset();
        Elements.modalSearchBox.hide();
    });
    
}

export async function search_page(joinedSearchKeys, searchType) {    

    if (!joinedSearchKeys) {
        Utilities.info('Error', 'No Search Keys Found');
        return;
    }

    const searchKeysArray = joinedSearchKeys.split(',');

    if (searchKeysArray.length == 0) {
        Utilities.info('Erros', 'No Search Query Found');
        return;
    }

    if (!currentUser) {
        Elements.root.innerHTML = ProtectedMessage.html;
        return;
    }

    switch(searchType) {
        case 'deckSearch':
            const deckList = await searchDecks(searchKeysArray);            
            buildStudyDecksPage(deckList);
            Utilities.info('You searched for', `${searchKeysInfo}`)
            break;

        case 'classroomSearch':
            if(classSearchOption == "allRooms") {
                const classroomList = await searchAllClassrooms(searchKeysArray);               
                buildClassRoomSearchPage(classroomList);
                Utilities.info('You searched for', `${searchKeysInfo}`)
            break;

            } else if (classSearchOption == "myRooms") {
                console.log('box 2 checked');

            } else if (classSearchOption == "notMyRooms") {
                console.log('exlude search goes here');
            }
            else console.log("nuttin");
            break;

        default: Utilities.info('No search type detected');

    }
}//END search_page()

export function setSearchType(searchType) {
    Elements.searchBoxType.value = searchType;
}

export function setClassroomSearchOption(option) {
    classSearchOption = option;
}

export function cleanDataToKeywords(name, subject, category) { //for decks and classrooms
    const nameArray = name.toLowerCase(). match(/\S+/g);
    const subjectArray = subject.toLowerCase(). match(/\S+/g);
    const categoryArray = category.toLowerCase(). match(/\S+/g);
    const mergedArray = nameArray.concat(subjectArray, categoryArray);
    return mergedArray;
}

export async function searchDecks(searchKeysArray) {
    let deckList;
    try {
        deckList = await FirebaseController.searchDecks(currentUser.uid, searchKeysArray);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Utilities.info('There was an error with the Search', JSON.stringify(e));
        return;
    }
    return deckList;
}

export async function searchAllClassrooms(searchKeysArray) {
    let classroomList;
    try {
        classroomList = await FirebaseController.searchAllClassrooms(searchKeysArray);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Utilities.info('There was an error with the Search', JSON.stringify(e));
        return;
    }
    return classroomList;
}

function buildClassRoomSearchPage(classroomList) {
    let html;
    Elements.root.innerHTML = html;

    html += `<div id="Searched Classrooms" class="classroom-tab-content">       

    <table id="available-classrooms-table" class="table">
    <thread>
     <tr>
        <th scope="col">Preview</th>
        <th scope="col">Classroom</th>
        <th scope="col">Subject</th>
        <th scope="col">Category</th>
        <th scope="col">Members</th>
        <th scop="col">Joined</th>
    </tr>
    </thread>
    <tbody>
     `;
    //  if (classroomList.length == 0) {
    //     html += '<p>No classrooms found!</p>';
    // } else {
    //     // sort decks by joined classrooms first
    //     classroomList.sort(function (a, b) {
    //         const aMember = a.members.includes(Auth.currentUser.email);
    //         const bMember = b.members.includes(Auth.currentUser.email);
    //         return bMember - aMember;
    //     })
    // }
    

    // classroomList.forEach(ac => {
    //     if(!ac.banlist.includes(Auth.currentUser.email)){
    //         html += `
    //             <tr>${buildAvailableClassroom(ac)}</tr>`;
    //     }
    // })
    html += `</tbody></table></div>`;
    return html;
}
