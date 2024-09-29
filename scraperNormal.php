<?php

$url = fetchUrlContent('url.txt');
$html = fetchHtmlContent($url);
$dom = initializeDomDocument($html);
$xpath = new DOMXPath($dom);
$categories = getCategories($xpath);

foreach ($categories as &$category) {
    processCategory($category);
}

function sendEvent($id, $data) {
    $data['id'] = $id;
    echo "data: " . json_encode($data) . "\n\n";
    ob_flush();
    flush();
}

function fetchUrlContent($filePath) {
    $url = file_get_contents($filePath);
    if ($url === false) {
        die('Error reading the URL from ' . $filePath);
    }
    return trim($url);
}

function fetchHtmlContent($url) {
    $html = file_get_contents($url);
    if ($html === false) {
        die('Error fetching the HTML content.');
    }
    return $html;
}

function initializeDomDocument($html) {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();
    return $dom;
}

function getCategories($xpath) {
    $categories = [];
    $mainItems = $xpath->query("//li[contains(@class, 'main-nav__item')][contains(@data-responsive-panel-target, 'sub-menu')]");

    foreach ($mainItems as $item) {
        $categoryName = getCategoryName($xpath, $item);
        $subCategories = [];

        $subMenu = $xpath->query('.//div[contains(@class, "sub-menu")]', $item);
        if ($subMenu->length > 0) {
            $subCategories = getSubCategories($xpath, $subMenu);
        }

        $categories[] = [
            'name' => $categoryName,
            'sub_categories' => $subCategories,
        ];
    }

    return $categories;
}

function getCategoryName($xpath, $item) {
    $categoryNode = $xpath->query('.//h2[contains(@class, "sub-menu__title")]', $item)->item(0);
    return $categoryNode ? trim($categoryNode->nodeValue) : '';
}

function getSubCategories($xpath, $subMenu) {
    $subCategories = [];
    $subMenuBlocks = $xpath->query('.//div[contains(@class, "sub-menu__block")]', $subMenu->item(0));

    foreach ($subMenuBlocks as $subBlock) {
        $subCategoryName = trim($xpath->query('.//a[contains(@class, "sub-menu__block-heading")]', $subBlock)->item(0)->nodeValue);
        $subCategoryLink = $xpath->query('.//a[contains(@class, "sub-menu__block-heading")]', $subBlock)->item(0)->getAttribute('href');
        $bottomItems = getBottomItems($xpath, $subBlock);

        $subCategories[] = [
            'name' => $subCategoryName,
            'link' => $subCategoryLink,
            'sub_items' => $bottomItems,
        ];
    }

    return $subCategories;
}

function getBottomItems($xpath, $subBlock) {
    $bottomItems = [];
    $bottomLevelLinks = $xpath->query('.//li[contains(@class, "bottom-level__item")]/a[contains(@class, "bottom-level__item__title")]', $subBlock);

    foreach ($bottomLevelLinks as $bottomLink) {
        if (strpos($bottomLink->nodeValue, 'õik') !== false) {
            continue;
        }
        $bottomItem = [
            'name' => trim($bottomLink->nodeValue),
            'link' => ($bottomLink instanceof DOMElement) ? $bottomLink->getAttribute('href') : '',
        ];
        $bottomItems[] = $bottomItem;
    }

    return $bottomItems;
}

function processCategory(&$category) {
    sendEvent('Kategooria', $category);

    foreach ($category['sub_categories'] as &$subCategory) {
        processSubCategory($subCategory);
    }
}

function processSubCategory(&$subCategory) {
    $url = $subCategory['link'];
    $xpath = fetchAndParsePage($url);

    $subCategory['productsCount'] = getCountFromXPath($xpath, '//h2[normalize-space(text())="Filtreeri tooteid"]/span[@class="counter"]');
    $subCategory['discountCount'] = getCountFromXPath($xpath, '//label[normalize-space(text())="Sooduspakkumised"]/span[@class="counter"]');

    sendEvent('Alam-kategooria', $subCategory);

    foreach ($subCategory['sub_items'] as &$bottomItem) {
        processBottomItem($bottomItem);
    }
}

function processBottomItem(&$bottomItem) {
    $url = $bottomItem['link'];
    $xpath = fetchAndParsePage($url);

    $bottomItem['productsCount'] = getCountFromXPath($xpath, '//h2[normalize-space(text())="Filtreeri tooteid"]/span[@class="counter"]');
    $bottomItem['discountCount'] = getCountFromXPath($xpath, '//label[normalize-space(text())="Sooduspakkumised"]/span[@class="counter"]');

    sendEvent('Alam-alam-kategooria', $bottomItem);
}


function fetchAndParsePage($url) {
    $html = fetchPageContent($url);
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();
    return new DOMXPath($dom);
}

function fetchPageContent($url) {
    $context = stream_context_create(array(
        'http' => array(
            'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        )
    ));
    return file_get_contents($url, false, $context);
}

function getCountFromXPath($xpath, $query) {
    $count = 0;
    $countNode = $xpath->query($query);
    if ($countNode->length > 0) {
        $countText = $countNode->item(0)->nodeValue;
        $countText = trim($countText);
        $countText = preg_replace('/[()]/', '', $countText);
        $count = (int)($countText);
    }
    return $count;
}

echo "event: end\n";
echo "data: end\n\n";
ob_flush();
flush();
