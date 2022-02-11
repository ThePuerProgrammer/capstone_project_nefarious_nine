import { modalInfoBox } from "./elements.js";

export function info(title, body, closeModal) {
    if (closeModal) closeModal.hide();
    modalInfoBox.title.innerHTML = title;
    modalInfoBox.body.innerHTML = body;
    modalInfoBox.modal.show();
}