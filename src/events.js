import { initializePieChart, initializeBarChart, initializePercentageChart } from './charts.js';
import { updateTable, updatePieChart, updateBarChart, updatePercentageChart } from './utils.js';

const scrapeStatus = document.getElementById('scrapingMessage');

export function startScrape(value) {
    scrapeStatus.textContent = 'Scraping in progress...';
    scrapeStatus.classList.add('blink-white-green');
    scrapeStatus.classList.remove('scraping-finished');

    const pieChart = initializePieChart();
    const barChart = initializeBarChart();
    const percentageChart = initializePercentageChart();

    const eventSource = new EventSource(`login_router.php?value=${value}`);

    let mainCategoryName = '';
    let mainCategorySum = 0;

    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data === 'end') {
            eventSource.close();
            scrapeStatus.textContent = 'Scraping finished';
            scrapeStatus.classList.remove('blink-white-green');
            scrapeStatus.classList.add('scraping-finished');
        } else {
            updateTable(data);
            if (data.id === 'Kategooria') {
                mainCategorySum = 0;
                mainCategoryName = data.name;
            }
            if (data.id === 'Alam-kategooria') {
                mainCategorySum = mainCategorySum + data.productsCount;
                updatePieChart(pieChart, mainCategoryName, mainCategorySum);
            }
            if (data.id === 'Alam-alam-kategooria') {
                updateBarChart(barChart, data);
                updatePercentageChart(percentageChart, data);
            }
        }
    };

    eventSource.addEventListener('end', function() {
        console.log('Stream closed by the server.');
        eventSource.close();
        scrapeStatus.textContent = 'Scraping finished';
        scrapeStatus.classList.remove('blink-white-green');
        scrapeStatus.classList.add('scraping-finished');
    });

    eventSource.onerror = function(event) {
        console.error('Error occurred while receiving SSE data: ', event);
        eventSource.close();
        scrapeStatus.textContent = 'Scraping finished';
        scrapeStatus.classList.remove('blink-white-green');
        scrapeStatus.classList.add('scraping-finished');
    };

        // Add click event listener to BarChart
    document.getElementById('barChart').onclick = function(evt) {
        const activePoints = barChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        if (activePoints.length > 0) {
            const firstPoint = activePoints[0];
            const label = barChart.data.labels[firstPoint.index];
            const link = barChart.data.datasets[0].links[firstPoint.index];
            window.open(link, '_blank');
        }
    };

    // Add click event listener to PercentageChart
    document.getElementById('percentageChart').onclick = function(evt) {
        const activePoints = percentageChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        if (activePoints.length > 0) {
            const firstPoint = activePoints[0];
            const label = percentageChart.data.labels[firstPoint.index];
            const link = percentageChart.data.datasets[0].links[firstPoint.index];
            window.open(link, '_blank');
        }
    };
}
