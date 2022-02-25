import * as Routes from '../controller/routes.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Utilities from './utilities.js'
import * as Elements from './elements.js'

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

    html += `<h1>${classroom.name}</h1>`;
    html += `<p>${classroomDocID}</p>`;
    Elements.root.innerHTML += html;
}