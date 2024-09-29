document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('buttonNormalScrape').addEventListener('click', () => startScrape('normalScrape'));

    const container = document.getElementById('table-container');
    const scrapeStatus = document.getElementById('scrapingMessage');

    function startScrape(value) {
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

        eventSource.onerror = function() {
            console.error('Error occurred while receiving SSE data.');
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

    function updateTable(data) {
        let table = document.getElementById('categoriesTable');
        if (!table) {
            table = document.createElement('table');
            table.id = 'categoriesTable';

            const header = table.createTHead();
            const headerRow = header.insertRow();
            const headers = ['Kategooria', 'tooteid', 'Alam-kategooria', 'tooteid', 'Alam-alam-kategooria', 'tooteid', 'soodushinnaga'];
            headers.forEach(text => {
                const cell = document.createElement('th');
                cell.textContent = text;
                headerRow.appendChild(cell);
            });

            const tableBody = table.createTBody();
            table.appendChild(tableBody);
            container.appendChild(table);
        }

        const tableBody = table.tBodies[0];
        const row = document.createElement('tr');

        switch (data.id) {
            case 'Kategooria':
                row.innerHTML = `
                    <td class="mainheadingrow">${data.name}</a></td>
                    <td class="mainheadingrow categorySum"></td>
                    <td class="mainheadingrow"></td>
                    <td class="mainheadingrow"></td>
                    <td class="mainheadingrow"></td>
                    <td class="mainheadingrow"></td>
                    <td class="mainheadingrow"></td>
                `;
                tableBody.appendChild(row);
                categorySumElement = findCategorySumCellBySiblingText(data.name);
                break;
            case 'Alam-kategooria':
                row.innerHTML = `
                    <td></td>
                    <td></td>
                    <td class="headingrow"><a target='_blank' href="${data.link}">${data.name}</a></td>
                    <td class="headingrow">${data.productsCount}</td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                `;
                tableBody.appendChild(row);
                if (categorySumElement) {
                    categorySum = parseInt(categorySumElement.innerHTML) || 0;
                    categorySum += data.productsCount;
                    categorySumElement.innerHTML = `${categorySum}`;
                    categorySumElement.classList.add('blink-green');
                    setTimeout(() => {
                        categorySumElement.classList.remove('blink-green');
                    }, 200);
                    const categoryName = categorySumElement.closest('tr').querySelector('td.mainheadingrow').textContent.trim();
                }
                break;
            case 'Alam-alam-kategooria':
                row.innerHTML = `
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="headingrow"><a target='_blank' href="${data.link}">${data.name}</a></td>
                    <td class="headingrow pdcount">${data.productsCount}</td>
                    <td class="headingrow pdcount">${data.discountCount}</td>
                `;
                tableBody.appendChild(row);
                break;
        }
    }

    function findCategorySumCellBySiblingText(siblingText) {
        const rows = document.querySelectorAll("#categoriesTable > tbody > tr");
        for (let row of rows) {
            const cells = row.querySelectorAll("td");
            for (let cell of cells) {
                if (cell.textContent.trim() === siblingText) {
                    const categorySumCell = row.querySelector("td.mainheadingrow.categorySum");
                    if (categorySumCell) {
                        return categorySumCell;
                    }
                }
            }
        }
        return null;
    }

    function initializePieChart() {
        const ctx = document.getElementById('chart').getContext('2d');
        const pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [], // Initialize with empty labels
                datasets: [{
                    label: 'Products Count',
                    data: [], // Initialize with empty data
                    backgroundColor: [], // Initialize with empty colors
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'erinevate toodete arv üldiste Kategooriate kaupa',
                    },    
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.raw !== null) {
                                    label += context.raw;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        return pieChart;
    }

    function updatePieChart(pieChart, categoryName, categorySum) {
        const index = pieChart.data.labels.indexOf(categoryName);
        if (index === -1) {
            // Add new category
            pieChart.data.labels.push(categoryName);
            pieChart.data.datasets[0].data.push(categorySum);
            pieChart.data.datasets[0].backgroundColor.push(getRandomColor());
            pieChart.data.datasets[0].borderColor.push('rgba(255, 255, 255, 1)');
        } else {
            // Update existing category
            pieChart.data.datasets[0].data[index] = categorySum;
        }
        pieChart.update();
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function initializeBarChart() {
        const ctxBar = document.getElementById('barChart').getContext('2d');
        const barChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'soodushinnaga toodete arv',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                    display: true,
                    text: '10 suurima sooduspakkumiste arvuga kategooriat',
                },
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.raw !== null) {
                                    label += context.raw;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        return barChart;
    }

    function updateBarChart(barChart, data) {
        const index = barChart.data.labels.indexOf(data.name);
        if (index === -1) {
            barChart.data.labels.push(data.name);
            barChart.data.datasets[0].data.push(data.discountCount);
            barChart.data.datasets[0].backgroundColor.push('#808080');
            barChart.data.datasets[0].borderColor.push('rgba(255, 255, 255, 1)');
            barChart.data.datasets[0].links = barChart.data.datasets[0].links || [];
            barChart.data.datasets[0].links.push(data.link);
        } else {
            barChart.data.datasets[0].data[index] = data.discountCount;
            barChart.data.datasets[0].links[index] = data.link;
        }

        // Sort the data by discountCount in descending order
        const sortedData = barChart.data.datasets[0].data
            .map((value, index) => ({ value, index }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Get top 10

        barChart.data.labels = sortedData.map(item => barChart.data.labels[item.index]);
        barChart.data.datasets[0].data = sortedData.map(item => item.value);
        barChart.data.datasets[0].links = sortedData.map(item => barChart.data.datasets[0].links[item.index]);
        barChart.update();
    }

    function initializePercentageChart() {
        const ctxPercentage = document.getElementById('percentageChart').getContext('2d');
        const percentageChart = new Chart(ctxPercentage, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'soodushinnaga toodete arv suhtena kategooria toodete arvu',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%'; // Add percentage symbol to y-axis labels
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '10 suurima sooduspakkumiste arvuga kategooriat - ! Ei ole allahindluse % ! Näitab kui suur osa kategooria toodetest on soodushinnaga',
                    },
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.raw !== null) {
                                    label += context.raw + '%'; // Add percentage symbol to tooltip
                                }
                                return label;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: function(value, context) {
                            return context.chart.data.labels[context.dataIndex] + '\n' + value + '%';
                        },
                        color: '#000',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
        return percentageChart;
    }

    function updatePercentageChart(percentageChart, data) {
        const percentage = (data.discountCount / data.productsCount) * 100;
        const index = percentageChart.data.labels.indexOf(data.name);
        if (index === -1) {
            percentageChart.data.labels.push(data.name);
            percentageChart.data.datasets[0].data.push(percentage.toFixed(2)); // Round to 2 decimal places
            percentageChart.data.datasets[0].backgroundColor.push('#808080');
            percentageChart.data.datasets[0].borderColor.push('rgba(255, 255, 255, 1)');
            percentageChart.data.datasets[0].links = percentageChart.data.datasets[0].links || [];
            percentageChart.data.datasets[0].links.push(data.link);
        } else {
            percentageChart.data.datasets[0].data[index] = percentage.toFixed(2); // Round to 2 decimal places
            percentageChart.data.datasets[0].links[index] = data.link;
        }
    
        // Sort the data by percentage in descending order
        const sortedData = percentageChart.data.datasets[0].data
            .map((value, index) => ({ value, index }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Get top 10
    
        percentageChart.data.labels = sortedData.map(item => percentageChart.data.labels[item.index]);
        percentageChart.data.datasets[0].data = sortedData.map(item => item.value);
        percentageChart.data.datasets[0].links = sortedData.map(item => percentageChart.data.datasets[0].links[item.index]);
        percentageChart.update();
    }
});
