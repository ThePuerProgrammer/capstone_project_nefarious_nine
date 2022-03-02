import * as Elements from './elements.js'

export function info(title, body, closeModal) {
    if (closeModal) $('#'+closeModal).modal('hide');
    Elements.popupInfoTitle.innerHTML = title;
    Elements.popupInfoBody.innerHTML = body;
    $('#modal-infobox').modal('show');
}

export function searchBox(title, placeholder) {
    //if (closeModal) $('#' +closeModal).modal('hide');
    Elements.searchBoxTitle.innerHTML = title;
    Elements.searchBoxPlaceholder.innerHTML = placeholder;
    //Elements.searchBoxType = searchType;
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