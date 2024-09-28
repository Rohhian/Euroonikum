document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('buttonNormalScrape').addEventListener('click', () => startScrape('normalScrape'));
    document.getElementById('buttonSlowScrape').addEventListener('click', () => startScrape('slowScrape'));

    const container = document.getElementById('table-container');

    function startScrape(value) {
        const eventSource = new EventSource(`login_router.php?value=${value}`);

        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data === 'end') {
                eventSource.close();
            } else {
                updateTable(data);
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
                    updateChart(categoryName, categorySum);
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

    const ctx = document.getElementById('chart').getContext('2d');
    const chart = new Chart(ctx, {
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

    function updateChart(categoryName, categorySum) {
        const index = chart.data.labels.indexOf(categoryName);
        if (index === -1) {
            // Add new category
            chart.data.labels.push(categoryName);
            chart.data.datasets[0].data.push(categorySum);
            chart.data.datasets[0].backgroundColor.push(getRandomColor());
            chart.data.datasets[0].borderColor.push('rgba(255, 255, 255, 1)');
        } else {
            // Update existing category
            chart.data.datasets[0].data[index] = categorySum;
        }
        chart.update();
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
