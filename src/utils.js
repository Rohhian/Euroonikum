const container = document.getElementById('table-container');
let categorySumElement;
let categorySum = 0;

export function updateTable(data) {
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

export function updatePieChart(pieChart, categoryName, categorySum) {
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

export function updateBarChart(barChart, data) {
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

export function updatePercentageChart(percentageChart, data) {
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

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
