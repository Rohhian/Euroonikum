document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('buttonNormalScrape').addEventListener('click', () => startScrape('normalScrape'));

    const container = document.getElementById('table-container');

    function startScrape(value) {
        const pieChart = initializePieChart();
        const barChart = initializeBarChart();

        const eventSource = new EventSource(`login_router.php?value=${value}`);

        let mainCategoryName = '';
        let mainCategorySum = 0;

        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data === 'end') {
                eventSource.close();
            } else {
                updateTable(data);
                if (data.id === 'Kategooria') {
                    mainCategoryName = data.name;
                }
                if (data.id === 'Alam-kategooria') {
                    mainCategorySum = mainCategorySum + data.productsCount;
                    updatePieChart(pieChart, mainCategoryName, mainCategorySum);
                }
                if (data.id === 'Alam-alam-kategooria') {
                    updateBarChart(barChart, data);
                }
            }
        };

        eventSource.onerror = function() {
            console.error('Error occurred while receiving SSE data.');
            eventSource.close();
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
                    <td class="headingrow"><a href="${data.link}">${data.name}</a></td>
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
                    <td class="headingrow"><a href="${data.link}">${data.name}</a></td>
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
                        text: 'toodete kogus üldiste Kategooriate kaupa',
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
                    label: 'Discount Count',
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
        } else {
            barChart.data.datasets[0].data[index] = data.discountCount;
        }

        // Sort the data by discountCount in descending order
        const sortedData = barChart.data.datasets[0].data
            .map((value, index) => ({ value, index }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Get top 10

        barChart.data.labels = sortedData.map(item => barChart.data.labels[item.index]);
        barChart.data.datasets[0].data = sortedData.map(item => item.value);
        barChart.update();
    }
});
