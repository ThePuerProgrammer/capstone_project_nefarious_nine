import * as Elements from './elements.js'
import * as Coins from '../controller/coins.js'

export function addEventListeners() {}

export async function chill_zone_page() {
    Elements.root.innerHTML = `<div>ChillZone Page</div>`;
    try{
        await Coins.get_coins(Auth.currentUser.uid);
    } catch(e) {if(Constant.DEV)console.log(e);}

}