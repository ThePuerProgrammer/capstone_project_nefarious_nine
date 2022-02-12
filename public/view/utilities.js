import * as Elements from './elements.js'

export function info(title, body, closeModal) {
    if (closeModal) $('#'+closeModal).modal('hide');
    Elements.popupInfoTitle.innerHTML = title;
    Elements.popupInfoBody.innerHTML = body;
    $('#modal-infobox').modal('show');
}