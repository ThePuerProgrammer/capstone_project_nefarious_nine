import * as Elements from './elements.js'
import * as Routes from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Utilities from './utilities.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import { Classroom } from '../model/classroom.js';
import * as OneClassroomPage from './one_classroom_page.js';

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
        });

        try {
            const docId = await FirebaseController.createClassroom(classroom);
            classroom.docId = docId;
            localStorage.setItem("classroomPageClassroomDocID", classroom.docId);
            Elements.modalCreateClassroom.hide();
            history.pushState(null, null, Routes.routePathname.ONECLASSROOM + '#' +  classroom.docId);
            await OneClassroomPage.one_classroom_page( classroom.docId);
        } catch (e) {
            if (Constant.DEV)
                console.log(e);
        }
    });

    // Clears CREATE CLASSROOM input fields when user closes modal
    $(`#create-classroom-modal`).on('hidden.bs.modal', function (e) {
        Elements.formCreateClassroom.reset();
    });
}

export async function classrooms_page() {
    Elements.root.innerHTML = '';
    let html = '';

    html += `<div class="classroom-page-tab"><button id="my-classroom-button" class="classroom-tab">My Classrooms</button>
    <button id="available-classroom-button" class="classroom-tab">Available Classrooms</button>`;

    html += `<div style="float:right">
    <label for="sort-classrooms">Order by:</label>
    <select name="sort-classrooms" id="sort-classrooms" style="width: 200px">
        <option selected disabled>Sort classrooms by...</option>
        <option value="name">Name</option>
        <option value="subject">Subject</option>
        <option value="category">Category</option>
    </select>
    </div>
    </div>`;

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
        html += `
                <tr>${buildAvailableClassroom(ac)}</tr>`;
    })
    html += `</tbody></table></div>`;

    // My Classrooms tab with create classroom button
    html += `<div id="My Classrooms" class="classroom-tab-content">
        <button id="${Constant.htmlIDs.createClassroom}" type="button" class="btn btn-secondary pomo-bg-color-dark">
        Create Classroom</button>`;

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
        html += `
                <tr>${buildMyClassroom(c)}</tr>`;
    })

    html += `</tbody></table></div>`;

    Elements.root.innerHTML = html;

    const previewForms = document.getElementsByClassName('form-preview-classroom');
    for(let i=0; i <previewForms.length; i++){
        previewForms[i].addEventListener('submit', e =>{
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
            Elements.previewClassroomLabel.innerHTML=`Preview of ${className}`;
            Elements.previewClassroomBody.innerHTML=`
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
            if(classMembers.length > 0){
                for(let j=0; j < classMembersList.length; j++){

                    Elements.previewClassroomBody.innerHTML+=`
                    <center><p>${classMembersList[j]}</p> </center>` ;
                }
            }
            //Checking to see if the classroom is full
             //ALREADY ENROLLED
            if(classMembers.includes(userEmail)){
                Elements.previewClassroomFooter.innerHTML=`
                <form class="form-view-classroom-from-preview" method="post">
                    <input type="hidden" name="docId" value="${classId}">
                    <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;">View</button>
                </form>`;
                //Adding Case of user is creator to leave
                if(!classMods.includes(userEmail)){
                    Elements.previewClassroomFooter.innerHTML+=`
                    <form class="form-leave-classroom-from-preview" method="post">
                        <input type="hidden" name="docId" value="${classId}">
                        <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;">Leave</button>
                    </form>`
                }
            } else if(classMembersList.length!=classMembers.length){
                //CLASSROOM HAS ROOM
                Elements.previewClassroomFooter.innerHTML=`
                <form class="form-join-classroom" method="post">
                    <input type="hidden" name="docId" value="${classId}">
                    <button id="form-join-classroom" class="btn btn-secondary pomo-bg-color-dark 
                        pomo-text-color-light" type="submit" style="padding:5px 10px"> Join</button>
                </form>`;
            } else { 
                   //CLASSROOM FULL
                   Elements.previewClassroomFooter.innerHTML=`
                   <button class="btn btn-secondary pomo-bg-color-dark 
                       pomo-text-color-light" style="padding:5px 10px" disabled> Join</button>
                   `;
                
            }
            //JOIN BUTTON EVENT LISTENER
            const joinClassroom = document.getElementsByClassName('form-join-classroom');
            for(let i= 0; i < joinClassroom.length; i++){
                joinClassroom[i].addEventListener('submit', async e=>{
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
            for(let i=0; i < viewClassroomFromPreview.length; i++){
                viewClassroomFromPreview[i].addEventListener('submit', async e => {
                    e.preventDefault();
                    let classId = e.target.docId.value;
                    //Closes modal on button click
                    $('#preview-classroom-modal').modal('hide')
                    //Navigates to classroom webpage
                    history.pushState(null, null, Routes.routePathname.ONECLASSROOM + '#' + classId);
                    await OneClassroomPage.one_classroom_page(classId);

                });
            }
            //LEAVE BUTTON EVEN LISTENER
            const leaveClassroomFromPreview = document.getElementsByClassName('form-leave-classroom-from-preview');
            for(let i=0; i <leaveClassroomFromPreview.length; i++){
                leaveClassroomFromPreview[i].addEventListener('submit', async e=> {
                    e.preventDefault();
                    let classId = e.target.docId.value;
                    console.log('Here');
                    //Closes modal on button click
                    $('#preview-classroom-modal').modal('hide');
                    Elements.modalLeaveClassroomConfirmation.show();
                    const confirmation = document.getElementById('modal-confirmation-leave-classroom-yes');
                    confirmation.addEventListener("click", async e=>{
                        console.log('ALSO HERE');
                        await FirebaseController.leaveClassroom(classId, userEmail);
                        availableClassroomButton.click();
                    });
                    
                    
                });
            }           
            Elements.modalPreviewClassroom.show();
            Utilities.enableButton(button, label);
        });
        
    }
    

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

    OneClassroomPage.addClassroomViewButtonListeners();
}


function buildMyClassroom(classroom) {
    let html = `
    <td>
    <form class="form-view-classroom" method="post">
            <input type="hidden" name="docId" value="${classroom.docID}">
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;">View</button>
        </form></td>
    <td>${classroom.name}</td>
    <td>${classroom.subject}</td>
    <td>${classroom.category}</td>
    <td>${classroom.members.length}/9</td>
    `;

    html += classroom.members.includes(Auth.currentUser.email) ? `<td>&#128505</td>` : `<td>&#9746</td>`;
    return html;
}

function buildAvailableClassroom(classroom) {
    let html = `
    <td>
    <form class="form-preview-classroom" method="post">
            <input type="hidden" name="docId" value="${classroom.docID}"/>
            <input type="hidden" name="name" value ="${classroom.name}"/>
            <input type="hidden" name="subject" value ="${classroom.subject}"/>
            <input type="hidden" name="category" value ="${classroom.category}"/>
            <input type="hidden" name="mods" value ="${classroom.moderatorList}"/>
            <input type="hidden" name="members" value ="${classroom.members}"/>
            <button class="btn btn-outline-secondary pomo-bg-color-dark pomo-text-color-light" type="submit" style="padding:5px 10px;">Preview</button>
    </form></td>
    <td>${classroom.name}</td>
    <td>${classroom.subject}</td>
    <td>${classroom.category}</td>
    <td>${classroom.members.length}/9</td>
    `;

    html += classroom.members.includes(Auth.currentUser.email) ? `<td>&#128505</td>` : `<td>&#9746</td>`;
    return html;
}