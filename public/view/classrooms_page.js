import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Utilities from './utilities.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Coins from '../controller/coins.js'
import { Classroom } from '../model/classroom.js';
import * as OneClassroomPage from './one_classroom_page.js';
import * as Search from './search_page.js';

export function addEventListeners() {
    Elements.menuClassrooms.addEventListener('click', async () => {
        history.pushState(null, null, Routes.routePathname.CLASSROOMS);
        await classrooms_page();
    });

    // CREATE A CLASSROOM Submit button event listener
    Elements.formCreateClassroom.addEventListener('submit', async e => {
        e.preventDefault();
        const name = e.target.name.value;
        const subject = e.target.subject.value;
        //const isFavorited = false;
        const category = e.target.selectClassCategory.value;

        const keywords = Search.cleanDataToKeywords(name, subject, category)

        // add current user as a moderator
        const moderatorList = [];
        moderatorList.push(Auth.currentUser.email);

        // add current user to members list
        const members = [];
        members.push(Auth.currentUser.email);

        const banlist = [];


        const classroom = new Classroom({
            name,
            subject,
            //dateCreated,
            category,
            moderatorList,
            members,
            banlist,
            keywords,
        });

        try {
            const docId = await FirebaseController.createClassroom(classroom);
            classroom.docId = docId;
            window.sessionStorage.setItem('classId', classroom.docId);
            Elements.modalCreateClassroom.hide();
            history.pushState(null, null, Routes.routePathname.ONECLASSROOM + '#' + classroom.docId);
            await OneClassroomPage.one_classroom_page(classroom.docId);
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }
    });

    // Clears CREATE CLASSROOM input fields when user closes modal
    $(`#create-classroom-modal`).on('hidden.bs.modal', function (e) {
        Elements.formCreateClassroom.reset();
    });

} //END CLASSROOMS_PAGE EVENT LISTENERS

export async function classrooms_page() {
    try{
        await Coins.get_coins(Auth.currentUser.uid);
    } catch(e) {if(Constant.DEV)console.log(e);}
    Elements.root.innerHTML = '';
    let html = '';

    html += `<div class="classroom-page-tab"><button id="my-classroom-button" class="classroom-tab"><i class="material-icons">nature_people</i>My Classrooms</button>
    <button id="available-classroom-button" class="classroom-tab"><i class="material-icons">nature</i>Available Classrooms</button>
    `;

    html += `<div style="float:right; display: inline-block;">
    <label for="sort-classrooms">Order by:</label>
    <select name="sort-classrooms" id="sort-classrooms" style="width: 200px">
        <option selected disabled>Sort classrooms by...</option>
        <option value="name">Name</option>
        <option value="subject">Subject</option>
        <option value="category">Category</option>
    </select>
    <div class="search-classroom-controls" style="display: flex; margin-right: 5px; margin-top: 3px">
        <form id="form-search-class-radio" name="choose-class-search-type">
        <fieldset>
        <div class="search-radio d-flex">
            <div>
                <input type="checkbox" id="checkbox-myClassrooms" name="classSearchType" value="myClassrooms" checked>
                <label for="myClassrooms">My Classrooms</label><br>
            </div>
            <div>
                <input type="checkbox" id="checkbox-notMyClassrooms" name="classSearchType" value="notMyClassrooms" checked>
                <label for="notMyClassrooms">Not My Classrooms</label><br>
            </div>
        </div>
        </fieldset>
        </form>
        <button id="search-classroom-button" class="btn search-btn search-btn-classroom search-btn-hover rounded-pill ms-n3" type="click" style="margin: 5px;"><i class="material-icons">search</i>Search Classrooms</button></h1>
        </div>
    </div>
    </div>`;


    //BUILD AVAILABLE CLASSROOMS
    html += `<div id="Available Classrooms" class="classroom-tab-content">`;

    let availableClassroomList = [];
    try {
        availableClassroomList = await FirebaseController.getAvailableClassrooms();
    } catch (e) {
        Utilities.info('Error getting available classrooms', JSON.stringify(e));
        console.log(e);
    }

    html += ` <table id="available-classrooms-table" class="table">
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

    if (availableClassroomList.length == 0) {
        html += '<p>No classrooms found!</p>';
    } else {
        // sort decks by joined classrooms first
        availableClassroomList.sort(function (a, b) {
            const aMember = a.members.includes(Auth.currentUser.email);
            const bMember = b.members.includes(Auth.currentUser.email);
            return bMember - aMember;
        })
    }

    let myClassroomList = [];
    for (let i = 0; i < availableClassroomList.length; i++) {
        if (availableClassroomList[i].members.includes(Auth.currentUser.email)) {
            myClassroomList.push(availableClassroomList[i]);
        } else {
            // we can break once a classroom doesn't contain the user since they're sorted
            break;
        }
    }

    availableClassroomList.forEach(ac => {
        if (!ac.banlist.includes(Auth.currentUser.email)) {
            html += `
                <tr>${buildAvailableClassroom(ac)}</tr>`;
        }
    })
    html += `</tbody></table></div>`;
    //END AVAILABLE CLASSROOMS

    // My Classrooms tab with create classroom button
    html += `<div id="My Classrooms" class="classroom-tab-content">
        <button id="${Constant.htmlIDs.createClassroom}" type="button" class="btn btn-secondary pomo-bg-color-dark">
        <i class="material-icons text-white">add</i> Create Classroom</button>`;

    html += `<table id="my-classrooms-table" class="table">
         <thread>
          <tr>
             <th scope="col">View</th>
             <th scope="col">Classroom</th>
             <th scope="col">Subject</th>
             <th scope="col">Category</th>
             <th scope="col">Members</th>
             <th scope="col">Joined</th>
         </tr>
         </thread>
    <tbody>
     `;

    if (myClassroomList.length == 0) {
        html += '<p>No classrooms found!</p>';
    }
    myClassroomList.forEach(c => {
        if (!c.banlist.includes(Auth.currentUser.email)) {
            html += `
                <tr>${buildMyClassroom(c)}</tr>`;
        }
    })

    html += `</tbody></table></div>`;

    // POPUP MODAL FOR PREVIEWS
    Elements.root.innerHTML = html;

    buildPreviewClassroomsWithListeners();

    // get available class tab and show it as visible
    const availableClassroomButton = document.getElementById('available-classroom-button');
    availableClassroomButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('Available Classrooms').style.display = "block";
        e.target.style.backgroundColor = `#A7ADC6`;
        e.target.style.color = `#2C1320`;
        e.target.style.borderBottom = `#A7ADC6`;
        document.getElementById('my-classroom-button').style.backgroundColor = `#2C1320`;
        document.getElementById('my-classroom-button').style.color = '#A7ADC6';
    })

    // get my classroom tab and show it as visible
    const myClassroomButton = document.getElementById('my-classroom-button');
    myClassroomButton.addEventListener('click', e => {
        let tabContents = document.getElementsByClassName("classroom-tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        document.getElementById('My Classrooms').style.display = "block";
        e.target.style.backgroundColor = `#A7ADC6`;
        e.target.style.color = `#2C1320`;
        e.target.style.borderBottom = `#A7ADC6`;
        document.getElementById('available-classroom-button').style.backgroundColor = `#2C1320`;
        document.getElementById('available-classroom-button').style.color = '#A7ADC6';
    })
    // sets myclassrooms as default
    myClassroomButton.click();


    const createClassroomButton = document.getElementById(Constant.htmlIDs.createClassroom);
    // CREATE CLASSROOM open modal button listener 
    createClassroomButton.addEventListener('click', async e => {

        //const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];

        // Firebase func. to retrieve categories list
        let categories;
        try {
            categories = await FirebaseController.getCategories();
            //console.log(cat);
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }

        // clear innerHTML to prevent duplicates
        Elements.formClassCategorySelect.innerHTML = '';

        categories.forEach(category => {
            Elements.formClassCategorySelect.innerHTML += `
                      <option value="${category}">${category}</option>`;
        });

        // opens create Classroom modal
        $(`#${Constant.htmlIDs.createClassroomModal}`).modal('show');
    });

    const sortClassSelect = document.getElementById("sort-classrooms");
    sortClassSelect.addEventListener('change', async e => {
        e.preventDefault();
        // get value from select menu and check if available classroom tab is hiddne
        var opt = e.target.options[e.target.selectedIndex].value;
        var swap, rows, shouldSwap;
        var checkHidden = document.getElementById("Available Classrooms");
        // set which table to use
        var table = checkHidden.style.display === "none" ? document.getElementById("my-classrooms-table") : document.getElementById("available-classrooms-table");
        // for later use
        var i;
        var x = (opt == "name") ? 1 : (opt == "subject") ? 2 : 3;
        // set swap to true
        swap = true;
        // if (opt == "name") {
        // create a while loop to iterate through the table rows
        while (swap) {
            // base of saying we're done swapping
            swap = false;
            rows = table.rows;
            // iterate through rows, first row is headers so we ignore that
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwap = false;
                // getting classroom.docId from first row
                var a = rows[i].getElementsByTagName("td")[x];
                // getting classroom.docId from second row
                var b = rows[i + 1].getElementsByTagName("td")[x];
                // check if they should switch, if yes then break the loop
                if (a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase()) {
                    shouldSwap = true;
                    break;
                }
            }
            if (shouldSwap) {
                // swap the rows
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                swap = true;
            }
        }
    });

    // SEARCH CLASSROOMS LISTENERS --------------------------------------------------//
    const checkBoxMyClassrooms = document.getElementById('checkbox-myClassrooms');
    const checkBoxNotMyClassrooms = document.getElementById('checkbox-notMyClassrooms');
    const searchClassroomButton = document.getElementById('search-classroom-button');
    searchClassroomButton.addEventListener('click', async e => {
        const searchtype = 'classroomSearch';
        Search.setSearchType(searchtype);
        if (checkBoxMyClassrooms.checked == true && checkBoxNotMyClassrooms.checked == true) {
            Search.setClassroomSearchOption("all rooms");
        }
        else if (checkBoxNotMyClassrooms.checked == true) {
            Search.setClassroomSearchOption("not my rooms");
        }
        else if (checkBoxMyClassrooms.checked == true) {
            Search.setClassroomSearchOption("my rooms");
        }
        else Search.setClassroomSearchOption("null");

        Utilities.searchBox('Search Classroom', 'input query');
    });


    checkBoxMyClassrooms.addEventListener('change', async e => {
        if (checkBoxMyClassrooms.checked == true && checkBoxNotMyClassrooms.checked == true) {
            Search.setClassroomSearchOption("all rooms");
        }

        else if (checkBoxMyClassrooms.checked == true) {
            Search.setClassroomSearchOption("my rooms");
        } else {
            Search.setClassroomSearchOption("null");
        }
    });


    checkBoxNotMyClassrooms.addEventListener('change', async e => {
        if (checkBoxMyClassrooms.checked == true && checkBoxNotMyClassrooms.checked == true) {
            Search.setClassroomSearchOption("all rooms");
        }
        else if (checkBoxNotMyClassrooms.checked == true) {
            Search.setClassroomSearchOption("not my rooms");
        } else return;
    });
    // END SEARCH CLASSROOMS LISTENERS------------------------------------------------//

} //END CLASSROOMS_PAGE()-----------------------------------------------------------//


function buildMyClassroom(classroom) {
    let html = `
    <td>
    <form class="form-preview-classroom" method="post">
            <input type="hidden" name="docId" value="${classroom.docID}"/>
            <input type="hidden" name="name" value ="${classroom.name}"/>
            <input type="hidden" name="subject" value ="${classroom.subject}"/>
            <input type="hidden" name="category" value ="${classroom.category}"/>
            <input type="hidden" name="mods" value ="${classroom.moderatorList}"/>
            <input type="hidden" name="members" value ="${classroom.members}"/>
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"> <i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
    </form></td>
    <td>${classroom.name}</td>
    <td>${classroom.subject}</td>
    <td>${classroom.category}</td>
    <td>${classroom.members.length}/9</td>
    `;

    html += classroom.members.includes(Auth.currentUser.email) ? `<td>&#128505</td>` : `<td>&#9746</td>`;
    return html;
}

export function buildAvailableClassroom(classroom) {
    let html = classroom.members.includes(Auth.currentUser.email) ? `
    <td>
    <form class="form-preview-classroom" method="post">
            <input type="hidden" name="docId" value="${classroom.docID}"/>
            <input type="hidden" name="name" value ="${classroom.name}"/>
            <input type="hidden" name="subject" value ="${classroom.subject}"/>
            <input type="hidden" name="category" value ="${classroom.category}"/>
            <input type="hidden" name="mods" value ="${classroom.moderatorList}"/>
            <input type="hidden" name="members" value ="${classroom.members}"/>
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"> <i class="material-icons pomo-text-color-light">remove_red_eye</i>View</button>
    </form></td>` : `
    <td>
    <form class="form-preview-classroom" method="post">
            <input type="hidden" name="docId" value="${classroom.docID}"/>
            <input type="hidden" name="name" value ="${classroom.name}"/>
            <input type="hidden" name="subject" value ="${classroom.subject}"/>
            <input type="hidden" name="category" value ="${classroom.category}"/>
            <input type="hidden" name="mods" value ="${classroom.moderatorList}"/>
            <input type="hidden" name="members" value ="${classroom.members}"/>
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="material-icons pomo-text-color-light">visibility</i>Preview</button>
    </form></td>`;
    html += `
    <td>${classroom.name}</td>
    <td>${classroom.subject}</td>
    <td>${classroom.category}</td>
    <td>${classroom.members.length}/9</td>
    `;

    html += classroom.members.includes(Auth.currentUser.email) ? `<td>&#128505</td>` : `<td>&#9746</td>`;

    return html;
}

export function buildPreviewClassroomsWithListeners() {
    const previewForms = document.getElementsByClassName('form-preview-classroom');
    for (let i = 0; i < previewForms.length; i++) {
        previewForms[i].addEventListener('submit', e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Utilities.disableButton(button);
            //Getting hidden elements from the preview form.
            let classId = e.target.docId.value;
            let className = e.target.name.value;
            let classSubject = e.target.subject.value;
            let classCategory = e.target.category.value;
            let classMods = e.target.mods.value;
            let classMembers = e.target.members.value;
            let userEmail = Auth.currentUser.email;

            //Adding pieces of the Classroom to the Modal
            Elements.previewClassroomLabel.innerHTML = `Preview of ${className}`;
            Elements.previewClassroomBody.innerHTML = `
            <center><h3><u>Subject:</u></h3>
            <p>${classSubject}</p>
            <h3><u>Category:</u></h3>
            <p>${classCategory}</p>
            <h3><u>Mod(s):</u></h3>
            <p>${classMods}</p>
            <h3><u>Member(s):</u></h3> </center>`;
            //Breaking the string into an array to put each member on a separate line
            const classMembersList = classMembers.split(",");
            //Iterating through the array to print all names
            if (classMembersList.length > 0) {
                for (let j = 0; j < classMembersList.length; j++) {

                    Elements.previewClassroomBody.innerHTML += `
                    <center><p>${classMembersList[j]}</p> </center>`;
                }
            }
            //Checking to see if the classroom is full
            //ALREADY ENROLLED
            if (classMembersList.includes(userEmail)) {
                Elements.previewClassroomFooter.innerHTML = `
                <form class="form-view-classroom-from-preview" method="post">
                    <input type="hidden" name="docId" value="${classId}">
                    <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="material-icons pomo-text-color-light">forward</i>Enter Class</button>
                </form>`;
                //Adding Case of user is creator to leave
                if (!classMods.includes(userEmail)) {
                    Elements.previewClassroomFooter.innerHTML += `
                    <form class="form-leave-classroom-from-preview" method="post">
                        <input type="hidden" name="docId" value="${classId}">
                        <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"><i class="material-icons pomo-text-color-light">directions_walk</i>Leave</button>
                    </form>`
                } else {
                    Elements.previewClassroomFooter.innerHTML += `
                    <form class="form-edit-classroom-from-preview" method="post">
                        <input type="hidden" name="docId" value="${classId}">
                        <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;"> <i class="material-icons pomo-text-color-light">edit</i>Edit</button>
                    </form>`

                }
            } else if (classMembersList.length != 9) {
                console.log(`MembersList:${classMembersList.length}`);
                console.log(`Members:${classMembers.length}`);
                //CLASSROOM HAS ROOM
                Elements.previewClassroomFooter.innerHTML = `
                <form class="form-join-classroom" method="post">
                    <input type="hidden" name="docId" value="${classId}">
                    <button id="form-join-classroom" class="btn btn-secondary pomo-bg-color-dark 
                        pomo-text-color-light" type="submit" style="padding:5px 10px"> <i class="material-icons pomo-text-color-light">person_add</i>Join</button>
                </form>`;
            } else if(classMembersList.length==9){
                //CLASSROOM FULL
                Elements.previewClassroomFooter.innerHTML = `
                   <button class="btn btn-secondary pomo-bg-color-dark 
                       pomo-text-color-light" style="padding:5px 10px" disabled> <i class="material-icons pomo-text-color-light">person_add</i>Join</button>
                   `;

            }
            //JOIN BUTTON EVENT LISTENER
            const joinClassroom = document.getElementsByClassName('form-join-classroom');
            for (let i = 0; i < joinClassroom.length; i++) {
                joinClassroom[i].addEventListener('submit', async e => {
                    e.preventDefault();
                    //Join the classroom
                    await FirebaseController.joinClassroom(classId, userEmail);
                    //Closes modal on button click
                    $('#preview-classroom-modal').modal('hide')
                    //Navigates to the classroom webpage
                    history.pushState(null, null, Routes.routePathname.ONECLASSROOM + '#' + classId);
                    await OneClassroomPage.one_classroom_page(classId);
                });
            }
            //VIEW BUTTON EVENT LISTENER
            const viewClassroomFromPreview = document.getElementsByClassName('form-view-classroom-from-preview');
            for (let i = 0; i < viewClassroomFromPreview.length; i++) {
                viewClassroomFromPreview[i].addEventListener('submit', async e => {
                    e.preventDefault();
                    let classId = e.target.docId.value;
                    //Closes modal on button click
                    $('#preview-classroom-modal').modal('hide')
                    //Navigates to classroom webpage
                    window.sessionStorage.setItem('classId',classId);

                    history.pushState(null, null, Routes.routePathname.ONECLASSROOM + '#' + classId);
                    await OneClassroomPage.one_classroom_page(classId);

                });
            }
            //LEAVE BUTTON EVEN LISTENER
            const leaveClassroomFromPreview = document.getElementsByClassName('form-leave-classroom-from-preview');
            for (let i = 0; i < leaveClassroomFromPreview.length; i++) {
                leaveClassroomFromPreview[i].addEventListener('submit', async e => {
                    e.preventDefault();
                    let classId = e.target.docId.value;
                    console.log('Here');
                    //Closes modal on button click
                    $('#preview-classroom-modal').modal('hide');
                    Elements.modalLeaveClassroomConfirmation.show();
                    const confirmation = document.getElementById('modal-confirmation-leave-classroom-yes');
                    confirmation.addEventListener("click", async e => {
                        console.log('ALSO HERE');
                        await FirebaseController.leaveClassroom(classId, userEmail);
                        classrooms_page();
                    });

                });

            }
            const editButton = document.getElementsByClassName('form-edit-classroom-from-preview');
            for (let i = 0; i < editButton.length; i++) {
                editButton[i].addEventListener('submit', async e => {
                    e.preventDefault();
                    const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];
                    Elements.formEditClassroom.docId.value = e.target.docId.value;

                    Elements.formEditClassCategorySelect.innerHTML = '';
                    categories.forEach(category => {
                        Elements.formEditClassCategorySelect.innerHTML += `
                            <option value="${category}">${category}</option>
                        `;
                    });


                    $('#preview-classroom-modal').modal('hide');
                    Elements.modalEditClassroom.show();
                    Elements.formEditClassroom.addEventListener('submit', async e => {

                        e.preventDefault();

                        const name = e.target.ename.value;
                        const subject = e.target.esubject.value;
                        const category = e.target.editClassCategory.value;
                        const emembers = [];
                        const ebanlist = [];
                        const emoderatorList = [];

                        const keywords = Search.cleanDataToKeywords(name, subject, category)

                        const ecr = new Classroom({
                            name,
                            subject,
                            category,
                            emoderatorList,
                            emembers,
                            ebanlist,
                            keywords,
                        });

                        ecr.set_docID(e.target.docId.value);

                        await FirebaseController.updateClassroom(ecr);
                        Elements.modalEditClassroom.hide();
                        await classrooms_page();
                    });
                });
            }

            Elements.modalPreviewClassroom.show();
            Utilities.enableButton(button, label);
        });

    }

}