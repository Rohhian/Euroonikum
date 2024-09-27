document.addEventListener('DOMContentLoaded', () => {

    const headerContainer = document.createElement('div');
    headerContainer.id = 'header-container';

    const heading = document.createElement('h1');
    heading.textContent = 'Euronics e-poe toodete kategooriad';

    const buttonNormalScrape = document.createElement('button');
    buttonNormalScrape.textContent = 'normal scrape 5m';
    buttonNormalScrape.addEventListener('click', () => getCategories('normalScrape'));

    const buttonSlowScrape = document.createElement('button');
    buttonSlowScrape.textContent = 'slow scrape 20m';
    buttonSlowScrape.addEventListener('click', () => getCategories('slowScrape'));

    headerContainer.appendChild(heading);
    headerContainer.appendChild(buttonNormalScrape);
    headerContainer.appendChild(buttonSlowScrape);

    const container = document.getElementById('table-container');
    container.appendChild(headerContainer);

    function getCategories(value) {
        fetch('login_router.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: value })
        })
        .then(response => response.json())
        .then(data => {
            populateTable(data);
        })
        .catch(error => console.error('Error:', error));
    }

    function populateTable(data) {
            const table = document.createElement('table');
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

            data.forEach(category => {
                const categoryRow = document.createElement('tr');
                categorySum = 0;
                categoryRow.innerHTML = `
                    <td class="headingrow">${category.name}</a></td>
                    <td class="headingrow">${categorySum}</td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                `;
                tableBody.appendChild(categoryRow);
    
                category.sub_categories.forEach(subCategory => {
                    const subCategoryRow = document.createElement('tr');
                    categorySum = categorySum + subCategory.productsCount;
                    subCategoryRow.innerHTML = `
                        <td></td>
                        <td></td>
                        <td class="headingrow"><a href="${subCategory.link}">${subCategory.name}</a></td>
                        <td class="headingrow">${subCategory.productsCount}</td>
                        <td class="headingrow"></td>
                        <td class="headingrow"></td>
                        <td class="headingrow"></td>
                    `;
                    tableBody.appendChild(subCategoryRow);
    
                    subCategory.sub_items.forEach(subItem => {
                        const subItemRow = document.createElement('tr');
                        subItemRow.innerHTML = `
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="headingrow"><a href="${subItem.link}">${subItem.name}</a></td>
                            <td class="headingrow">${subItem.productsCount}</td>
                            <td class="headingrow">${subItem.discountCount}</td>
                        `;
                        tableBody.appendChild(subItemRow);
                    });
                });

                const blankRow = document.createElement('tr');
                const blankCell = document.createElement('td');
                blankCell.colSpan = 7;
                blankCell.innerHTML = '&nbsp;';
                blankRow.appendChild(blankCell);
                tableBody.appendChild(blankRow);
            });

            container.appendChild(table);
    }
});
