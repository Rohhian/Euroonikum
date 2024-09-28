document.addEventListener('DOMContentLoaded', () => {

    const headerContainer = document.createElement('div');
    headerContainer.id = 'header-container';

    const heading = document.createElement('h1');
    heading.textContent = 'Euronics e-poe toodete kategooriad';

    const buttonNormalScrape = document.createElement('button');
    buttonNormalScrape.textContent = 'normal scrape 6m';
    buttonNormalScrape.addEventListener('click', () => startScrape('normalScrape'));

    const buttonSlowScrape = document.createElement('button');
    buttonSlowScrape.textContent = 'slow scrape 20m';
    buttonSlowScrape.addEventListener('click', () => startScrape('slowScrape'));

    headerContainer.appendChild(heading);
    headerContainer.appendChild(buttonNormalScrape);
    headerContainer.appendChild(buttonSlowScrape);

    const container = document.getElementById('table-container');
    container.appendChild(headerContainer);

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
});
