import * as Elements from './elements.js'

export function info(title, body, closeModal) {
    if (closeModal) $('#'+closeModal).modal('hide');
    Elements.popupInfoTitle.innerHTML = title;
    Elements.popupInfoBody.innerHTML = body;
    $('#modal-infobox').modal('show');
}

export function searchBox(title, placeholder) {
    Elements.searchBoxTitle.innerHTML = title;
    Elements.searchBoxPlaceholder.innerHTML = placeholder;
    $('#modal-searchbox').modal('show');
}


//Disables a button so a user cannot click it multiple times
//incase a page/model takes time to load, could fault or double.
export function disableButton(button){
    button.disabled = true;
    const label = button.innerHTML;
    button.innerHTML = 'Wait...';
    return label;
}
//Re-enables a button so a user can click on it after a process is 
//completed.
export function enableButton(button, label){
    if(label) button.innerHTML = label;
    button.disabled = false;
}

export function print(DEV, developer, msg) {
    if (DEV) {
        console.log('In testing by: ', developer);
        console.log(msg);
    }
}

// Returns today's date formatted as MM/DD/YYYY
// https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
export function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;

    // return "03-16-2022"; // FOR TESTING ONLY

    return today;
}

// Changes the format of the given date to be mm-dd-yyyy
export function getFormattedDate(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    return mm + '-' + dd + '-' + yyyy;
}