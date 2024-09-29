import { startScrape } from './events.js';

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('buttonNormalScrape').addEventListener('click', () => startScrape('normalScrape'));
});
