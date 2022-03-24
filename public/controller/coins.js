import * as FirebaseController from './firebase_controller.js'
import * as Auth from './firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'

export function get_coins(){
    if(Elements.coinCount.innerHTML == '' || Elements.coinCount.innerHTML == null) {
        Elements.coinCount.innerHTML = sessionStorage.getItem('coins');
    } else if(Elements.coinCount.innerHTML != sessionStorage.getItem('coins')){
        Elements.coinCount.innerHTML = sessionStorage.getItem('coins');
    }
}