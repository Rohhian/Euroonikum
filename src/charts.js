export function initializePieChart() {
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

export function initializeBarChart() {
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

export function initializePercentageChart() {
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
