<?php

require 'auth.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Euronics Scrape</title>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <div id="content-container">
        <div id="header-container">
            <h1>Euronics e-poe toodete kategooriad</h1>
            <button id="buttonNormalScrape">start scrape</button>
            <button id="buttonLogout">Logout</button>
            <div id="scrapingMessage" class="blink-white-green"></div>
        </div>
        <div id="content-inner-container">
            <div id="table-container"></div>
            <div class="chart-container">
                <canvas id="chart"></canvas>
                <canvas id="barChart"></canvas>
                <canvas id="percentageChart"></canvas>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
    <script type="module" src="src/main.js"></script>
</body>
</html>