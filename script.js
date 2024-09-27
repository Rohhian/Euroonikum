document.addEventListener('DOMContentLoaded', () => {

    const headerContainer = document.createElement('div');
    headerContainer.id = 'header-container';

    const heading = document.createElement('h1');
    heading.textContent = 'Euronics e-poe toodete kategooriad';

    const button = document.createElement('button');
    button.textContent = 'tõmba kategooriad';
    button.addEventListener('click', () => getCategories('true'));

    headerContainer.appendChild(heading);
    headerContainer.appendChild(button);

    const container = document.getElementById('table-container');
    container.appendChild(headerContainer);

    function getCategories(value) {
        fetch('scraper.php', {
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
            const headers = ['Kategooria', 'tooteid', 'Alam-kategooria', 'tooteid', 'Alam-alam-kategooria', 'tooteid'];
            headers.forEach(text => {
                const cell = document.createElement('th');
                cell.textContent = text;
                headerRow.appendChild(cell);
            });

            const tableBody = table.createTBody();

            data.forEach(category => {
                const categoryRow = document.createElement('tr');
                categoryRow.innerHTML = `
                    <td class="headingrow">${category.name}</a></td>
                    <td class="headingrow">kogus</td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                    <td class="headingrow"></td>
                `;
                tableBody.appendChild(categoryRow);
    
                category.sub_categories.forEach(subCategory => {
                    const subCategoryRow = document.createElement('tr');
                    subCategoryRow.innerHTML = `
                        <td></td>
                        <td></td>
                        <td class="headingrow"><a href="${subCategory.link}">${subCategory.name}</a></td>
                        <td class="headingrow">kogus</td>
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
                            <td class="headingrow">kogus</td>
                        `;
                        tableBody.appendChild(subItemRow);
                    });
                });

                const blankRow = document.createElement('tr');
                const blankCell = document.createElement('td');
                blankCell.colSpan = 6;
                blankCell.innerHTML = '&nbsp;';
                blankRow.appendChild(blankCell);
                tableBody.appendChild(blankRow);
            });

            container.appendChild(table);
    }
});
