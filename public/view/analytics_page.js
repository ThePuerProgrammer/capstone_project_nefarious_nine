import * as Elements from './elements.js'

var chartOptions = {
    title: 'Pomobyte Statistics',
    width: 1900,
    height: 800,
    backgroundColor: "#8797AF",
    is3D: true
}

export function addEventListeners() {}

export async function analytics_page() {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    Elements.root.innerHTML = `
        <div id="myAreaChart" />
    `;
}

function drawChart() {
    // Define the chart to be drawn.
    var data = google.visualization.arrayToDataTable([
        ['Year', 'Sales', 'Expenses'],
        ['2013',  1000,      400],
        ['2014',  1170,      460],
        ['2015',  660,       1120],
        ['2016',  1030,      540]
      ]);
    
    chartOptions.title = 'Cool Area Graph :D';
    chartOptions.hAxis = { title: 'Year' }
    chartOptions.vAxis = { title: 'Money (VBux)', minValue: 0 }


    // Instantiate and draw the chart.
    var chart = new google.visualization.AreaChart(document.getElementById('myAreaChart'));
    chart.draw(data, chartOptions);
  }