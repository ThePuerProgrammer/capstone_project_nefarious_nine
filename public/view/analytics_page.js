import * as Elements from './elements.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Auth from '../controller/firebase_auth.js'
import * as Constant from '../model/constant.js'
import * as Utilities from './utilities.js'

var chartOptions = {
    title: 'Pomobyte Statistics',
    width: '100%',
    height: '100%',
    backgroundColor: "#A7ADC6",
    is3D: true,
    legend: 'top',
    series: {
        0: { color: '#4b85cc' },
        1: { color: '#a763bf' },
        2: { color: '#701b47' },
    }
}

var analyticsPageContainer;

let notEnoughSRSData = false;

var currentSelectedDeckID;

var dataArray = [];

export function addEventListeners() {}

export async function analytics_page() {
    let userDecks = await FirebaseController.getUserDecks(Auth.currentUser.uid);
    
    if (userDecks.length != 0) {
        Elements.root.innerHTML = `
            <div id="${Constant.htmlIDs.analyticsPageContainer}" class="container pt-4 pb-1">
                <div class="row">
                    <div class="col-6">
                        <h3>Selected Deck</h3>
                        <select id="${Constant.htmlIDs.analyticsSelectDeck}" name="selectedDeck" class="form-select"></select>
                    </div>
                    <div class="col-6">
                        <h3>Analytics</h3>
                        <select id="${Constant.htmlIDs.analyticsSelectStatistics}" name="selectedStatistics" class="form-select">
                            <option value="flashcard-mastery">Flashcard Mastery</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        analyticsPageContainer = document.getElementById(Constant.htmlIDs.analyticsPageContainer);

        addSpinner();

        var analyticsSelectDeck = document.getElementById(
            Constant.htmlIDs.analyticsSelectDeck
        );

        // add all of the user's deck to the deck selector
        userDecks.forEach(deck => 
            analyticsSelectDeck.innerHTML += `
                <option value="${deck.docId}">${deck.name}</option>
            `
        );
        
        // For redrawing graph on deck selection change
        analyticsSelectDeck.addEventListener('change', async e => {
            currentSelectedDeckID = e.target.value;
            removeChart();
            addSpinner();
            let graphSuccessfullyCreated = await getNewData();
            if (graphSuccessfullyCreated)
                drawAreaGraph();
        });
        
        currentSelectedDeckID = userDecks[0].docId;

        await getNewData();

        google.charts.load('current', { 
            callback: function () {
                if (notEnoughSRSData)
                    return;
                
                drawAreaGraph();
                $(window).resize(drawAreaGraph);
            },
            packages: ['corechart'] 
        });
    }
    else {
        Elements.root.innerHTML = `
            <div id="${Constant.htmlIDs.analyticsPageContainer}" class="container d-flex justify-content-center pt-5">
                <h3>
                    You do not own any decks! Try creating one in the <i>Study Decks</i> tab
                </h3>
            </div>
        `;
    }
}

async function getNewData() {
    selectorsEnabled(true);

    dataArray = [ // date vs streak count
        ['Date', 'Okay (Streak 1-2)', 'Good (Streak 3-5)', 'Mastered (Streak 6+)']
    ];

    let deckData = await FirebaseController.getUserDataDeckById(Auth.currentUser.uid, currentSelectedDeckID);
    
    // If there are less than 2 cachedDates, then there is not SRS data to display, so quit early
    if (deckData.cachedDates.length < 2) {
        removeSpinner();
        addMessageInsteadOfChart("This deck does not have contain enough SRS data to view Flashcard Mastery analytics. Try studying this deck in \"Smart Study\" at least 2 days and return here to see your progress!");
        selectorsEnabled(false);
        return false;
    }
    
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

    removeSpinner();

    // TODO: if (userHasNoDeckData)
    //          add message instead
    //       else
    //          add chart
    addChart();
    selectorsEnabled(false);

    return true;
}

async function drawAreaGraph() {
    chartOptions.title = 'Flaschard Mastery';
    chartOptions.hAxis = { title: 'Date' };
    chartOptions.vAxis = { title: '# of flashcard in the respective streak group', minValue: 0 };
    let data = google.visualization.arrayToDataTable(dataArray);


    // Instantiate and draw the chart.
    let chart = new google.visualization.AreaChart(document.getElementById(Constant.htmlIDs.analyticsChart));
    chart.draw(data, chartOptions);
}

function addSpinner() {
    Elements.root.insertAdjacentHTML('beforeend', 
        `<div id="${Constant.htmlIDs.loadingIcon}" class="d-flex justify-content-center mt-5">
            <div class="spinner-grow" role="status"></div>
        </div>
    `);
}

function removeSpinner() {
    let loadingIconElem = document.getElementById(Constant.htmlIDs.loadingIcon);
    loadingIconElem.parentElement.removeChild(loadingIconElem);
}

function addChart() {
    Elements.root.insertAdjacentHTML('beforeend', `
        <div id="${Constant.htmlIDs.analyticsChartContainer}">
            <div style="min-height: 47rem;" id="${Constant.htmlIDs.analyticsChart}"></div>
        </div>`
    );
}

function addMessageInsteadOfChart(message) {
    notEnoughSRSData = true;
    
    Elements.root.insertAdjacentHTML('beforeend', `
        <div id="${Constant.htmlIDs.analyticsChartContainer}">
            <br/ >
            <br/ >
            <br/ >
            <div class="d-flex justify-content-center align-items-center">
                <div class="col-5">
                    <h3 class="text-center">${message}</h3>
                </div>
            </div>
        </div>`
    );
}

function removeChart() {
    notEnoughSRSData = false;
    let analyticsChartContainer = document.getElementById(Constant.htmlIDs.analyticsChartContainer);
    analyticsChartContainer.parentElement.removeChild(analyticsChartContainer);
}

function selectorsEnabled(areEnabled) {
    $(`#${Constant.htmlIDs.analyticsSelectDeck}`).prop('disabled', areEnabled);
    $(`#${Constant.htmlIDs.analyticsSelectStatistics}`).prop('disabled', areEnabled);
}