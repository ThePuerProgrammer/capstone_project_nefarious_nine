import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'
import { Classroom } from '../model/classroom.js'

let classroomDocID;

export function addClassroomViewButtonListeners() {
    const viewButtons = document.getElementsByClassName('form-view-classroom');
    for (let i = 0; i < viewButtons.length; ++i) {
        addClassroomViewFormSubmitEvent(viewButtons[i]);
    }
}

export function addClassroomViewFormSubmitEvent(form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();
        classroomDocID = e.target.docId.value;
        history.pushState(null, null, Routes.routePathname.ONECLASSROOM + '#' + classroomDocID);
        await one_classroom_page(classroomDocID);
    })
}

export async function one_classroom_page(classroomDocID) {
    Elements.root.innerHTML = '';
    let html = '';

    let classroom;
    try {
        classroom = await FirebaseController.getOneClassroom(classroomDocID);
    } catch (e) {
        console.log(e);
        Utilities.info('Failed to retrieve classroom', JSON.stringify(e));
    }


    let mod = false;
    for (let i = 0; i < classroom.moderatorList.length; i++) { //check if current user is a mod
        if (Auth.currentUser.email == classroom.moderatorList[i]) {
            mod = true;
        }
    }
    //if current user is a mod, populate the edit classroom button
    //causes null edit button error
    if (mod == true) {
        //removed doc id from page view -- Blake
        html += `<h1>${classroom.name}</h1>`;
        html += `
        <p>Subject: ${classroom.subject}</p>
        <p>Category: ${classroom.category}</p>
        <p>Mods: ${classroom.moderatorList}</p>
        <p>Members: ${classroom.members}</p> 
        <div>
        <button id="button-edit-class" type="click" class="btn btn-secondary pomo-bg-color-dark pomo-text-color-light">Edit Classroom</button>
        </div>
        `;
    }
    else {
        //if user is not a mod, do not populate edit classrroom button
        html += `<h1>${classroom.name}</h1>`;
        html += `
        <p>Subject: ${classroom.subject}</p>
        <p>Category: ${classroom.category}</p>
        <p>Mods: ${classroom.moderatorList}</p>
        <p>Members: ${classroom.members}</p> 
        `;

    }
    Elements.root.innerHTML += html;

    //following Pipers create classroom functionality
    if (mod == true) { //if owner of classroom, add listener. This avoids null editButton errors.
        const editButton = document.getElementById('button-edit-class');
        editButton.addEventListener('click', async e => {

            const categories = ["Misc", "Math", "English", "Japanese", "French", "Computer Science", "Biology", "Physics", "Chemistry"];

            Elements.formEditClassCategorySelect.innerHTML = '';
            categories.forEach(category => {
                Elements.formEditClassCategorySelect.innerHTML += `
                      <option value="${category}">${category}</option>
                  `;
            });
            Elements.modalEditClassroom.show();
        })
    }

    Elements.formEditClassroom.addEventListener('submit', async e => {
        e.preventDefault();

        const cr = new Classroom({
            name: e.target.name.value,
            subject: e.target.subject.value,
            category: e.target.editClassCategory.value,
        });
        cr.set_docID(classroomDocID);

        await FirebaseController.updateClassroom(cr);
        Elements.modalEditClassroom.hide();
        Elements.root.innerHTML += ''; //Prevents old html from stacking/duplicate class on page
        await one_classroom_page(classroomDocID);

    })

}