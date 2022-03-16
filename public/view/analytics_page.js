import * as Elements from './elements.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from './utilities.js'

var chartOptions = {
    title: 'Pomobyte Statistics',
    width: '100%',
    height: 800,
    backgroundColor: "#A7ADC6",
    is3D: true,
    legend: 'top'
}

var needNewData = true;

var currentSelectedDeckID;

var dataArray = [];

export function addEventListeners() {}

export async function analytics_page() {
    let userDecks = await FirebaseController.getUserDecks(Auth.currentUser.uid);
    
    if (userDecks.length != 0) {
        Elements.root.innerHTML = `
            <div class="container pt-3">
                <div class="row">
                    <div class="col-6">
                        <select id="${Constant.htmlIDs.analyticsSelectDeck}" name="selectedDeck" class="form-select"></select>
                    </div>
                    <div class="col-6">
                        <select id="${Constant.htmlIDs.analyticsSelectStatistics}" name="selectedStatistics" class="form-select">
                            <option value="flashcard-mastery">Flashcard Mastery</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        var analyticsSelectDeck = document.getElementById(
            Constant.htmlIDs.analyticsSelectDeck
        );

        userDecks.forEach(deck => 
            analyticsSelectDeck.innerHTML += `
                <option value="${deck.docId}">${deck.name}</option>
            `
        );
        
        analyticsSelectDeck.addEventListener('change', async e => {
            currentSelectedDeckID = e.target.value;
            await getNewData();
            drawAreaGraph();
        });
        
        currentSelectedDeckID = userDecks[0].docId;

        await getNewData();
        
        Elements.root.insertAdjacentHTML('beforeend', `<div id="analytics-chart"></div>`);

        google.charts.load('current', { 
            callback: function () {
                drawAreaGraph();
                $(window).resize(drawAreaGraph);
            },
            packages: ['corechart'] 
        });
    }
    else {
        Elements.root.innerHTML = `
            <div class="container d-flex justify-content-center pt-5">
                <h3>
                    You do not own any decks! Try creating one in the <i>Study Decks</i> tab
                </h3>
            </div>
        `;
    }
    
}

async function getNewData() {
    dataArray = [ // date vs streak count
        ['Date', 'Okay (Streak 1-2)', 'Good (Streak 3-5)', 'Mastered (Streak 6+)']
    ];

    let deckData = await FirebaseController.getUserDataDeckById(Auth.currentUser.uid, currentSelectedDeckID);
    let startDate = new Date(deckData.dateCreated);
    let endDate = new Date(deckData.lastAccessed);
    let differenceInTime = endDate.getTime() - startDate.getTime();
    let differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    let displayDate = new Date(deckData.dateCreated);
    let deckDataCachedFlashcardDataDates = await FirebaseController.getDeckDataCachedFlashcardDataDates(Auth.currentUser.uid, currentSelectedDeckID);
    let okayCount = 0;
    let goodCount = 0;
    let masteredCount = 0;
    for (let i = 0; i < differenceInDays + 1; i++) {
        let formattedDisplayDate = Utilities.getFormattedDate(displayDate);
        
        if (deckDataCachedFlashcardDataDates.includes(formattedDisplayDate)) {
            console.log("Exists!");
            okayCount = 0;
            goodCount = 0;
            masteredCount = 0;

            okayCount += await FirebaseController.getStreakGroupCountForFlashcardDataCache(Auth.currentUser.uid, currentSelectedDeckID, formattedDisplayDate, 1);
            okayCount += await FirebaseController.getStreakGroupCountForFlashcardDataCache(Auth.currentUser.uid, currentSelectedDeckID, formattedDisplayDate, 2);
            goodCount += await FirebaseController.getStreakGroupCountForFlashcardDataCache(Auth.currentUser.uid, currentSelectedDeckID, formattedDisplayDate, 3);
            goodCount += await FirebaseController.getStreakGroupCountForFlashcardDataCache(Auth.currentUser.uid, currentSelectedDeckID, formattedDisplayDate, 4);
            goodCount += await FirebaseController.getStreakGroupCountForFlashcardDataCache(Auth.currentUser.uid, currentSelectedDeckID, formattedDisplayDate, 5);
            masteredCount += await FirebaseController.getStreakGroupCountAndAboveForFlashcardDataCache(Auth.currentUser.uid, currentSelectedDeckID, formattedDisplayDate, 6);
        }

        dataArray.push(
            [formattedDisplayDate, okayCount, goodCount, masteredCount]
        );

        // increments to next day by one
        displayDate.setDate(displayDate.getDate() + 1);
    }
}

async function drawAreaGraph() {
    chartOptions.title = 'Flaschard Mastery';
    chartOptions.hAxis = { title: 'Date' }
    chartOptions.vAxis = { title: '# of flashcard in the respective streak group', minValue: 0 }
    let data = google.visualization.arrayToDataTable(dataArray);


    // Instantiate and draw the chart.
    let chart = new google.visualization.AreaChart(document.getElementById('analytics-chart'));
    chart.draw(data, chartOptions);
}