import * as FirebaseController from './firebase_controller.js'
import * as Auth from './firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from '../view/utilities.js'
import * as Elements from '../view/elements.js'

export function get_coins(){
    if(Elements.coinCount.innerHTML == '' || Elements.coinCount.innerHTML == null) {
        if(sessionStorage.getItem('coins')==0 || sessionStorage.getItem('coins')==null){ //Has Zero Coins
            window.sessionStorage.setItem('coins', 0);
            Elements.coinCount.innerHTML = sessionStorage.getItem('coins');
        } else{
        Elements.coinCount.innerHTML = sessionStorage.getItem('coins'); //Has coins but not loaded
        }
    } else if(Elements.coinCount.innerHTML != sessionStorage.getItem('coins')){ //Update coins from games
        Elements.coinCount.innerHTML = sessionStorage.getItem('coins');
    } 
}