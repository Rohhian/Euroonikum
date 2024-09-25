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
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error); });
            }
            return response.json();
        })
        .then(data => {
            if (typeof data === 'string' && data.startsWith('Error:')) {
                throw new Error(data);
            }

            const table = document.createElement('table');
            table.id = 'categoriesTable';

            const header = table.createTHead();
            const headerRow = header.insertRow();
            const headers = ['Kategooria', 'Alam-kategooria', 'Alam-alam-kategooria', 'Link'];
            headers.forEach(text => {
                const cell = document.createElement('th');
                cell.textContent = text;
                headerRow.appendChild(cell);
            });

            const tableBody = table.createTBody();

            data.forEach(category => {
                category.sub_categories.forEach(subCategory => {
                    subCategory.sub_items.forEach(subItem => {
                        const row = document.createElement('tr');

                        const categoryCell = document.createElement('td');
                        categoryCell.textContent = category.name;
                        row.appendChild(categoryCell);

                        const subCategoryCell = document.createElement('td');
                        subCategoryCell.textContent = subCategory.name;
                        row.appendChild(subCategoryCell);

                        const subItemCell = document.createElement('td');
                        subItemCell.textContent = subItem.name;
                        row.appendChild(subItemCell);

                        const linkCell = document.createElement('td');
                        const link = document.createElement('a');
                        link.href = subItem.link;
                        link.textContent = subItem.link;
                        link.target = '_blank';
                        linkCell.appendChild(link);
                        row.appendChild(linkCell);

                        tableBody.appendChild(row);
                    });
                });

                const blankRow = document.createElement('tr');
                const blankCell = document.createElement('td');
                blankCell.colSpan = 4;
                blankCell.innerHTML = '&nbsp;';
                blankRow.appendChild(blankCell);
                tableBody.appendChild(blankRow);
            });

            container.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = error.message;
            container.appendChild(errorMessage);
        });
    }
});