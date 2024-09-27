<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $value = $input['value'] ?? null;

    if ($value !== 'true') {
        echo json_encode('Error: Invalid value sent with buttonclick.');
        exit();
    }

    $url = file_get_contents('url.txt');
    if ($url === false) {
        die('Error reading the URL from url.txt.');
    }
    $html = file_get_contents(trim($url));
    if ($html === false) {
        die('Error fetching the HTML content.');
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $categories = [];

    $mainItems = $xpath->query("//li[contains(@class, 'main-nav__item')][contains(@data-responsive-panel-target, 'sub-menu')]");

    foreach ($mainItems as $item) {
        $categoryNode = $xpath->query('.//h2[contains(@class, "sub-menu__title")]', $item)->item(0);
        $categoryName = $categoryNode ? trim($categoryNode->nodeValue) : '';

        $subCategories = [];
        $subMenu = $xpath->query('.//div[contains(@class, "sub-menu")]', $item);

        if ($subMenu->length > 0) {
            $subMenuBlocks = $xpath->query('.//div[contains(@class, "sub-menu__block")]', $subMenu->item(0));

            foreach ($subMenuBlocks as $subBlock) {
                $subCategoryName = trim($xpath->query('.//a[contains(@class, "sub-menu__block-heading")]', $subBlock)->item(0)->nodeValue);
                $subCategoryLink = $xpath->query('.//a[contains(@class, "sub-menu__block-heading")]', $subBlock)->item(0)->getAttribute('href');

                $bottomItems = [];
                $bottomLevelLinks = $xpath->query('.//li[contains(@class, "bottom-level__item")]/a[contains(@class, "bottom-level__item__title")]', $subBlock);
                foreach ($bottomLevelLinks as $bottomLink) {
                        $bottomItems[] = [
                            'name' => trim($bottomLink->nodeValue),
                            'link' => ($bottomLink instanceof DOMElement) ? $bottomLink->getAttribute('href') : '',
                        ];
                }

                $subCategories[] = [
                    'name' => $subCategoryName,
                    'link' => $subCategoryLink,
                    'sub_items' => $bottomItems,
                ];
            }
        }

        $categories[] = [
            'name' => $categoryName,
            'sub_categories' => $subCategories,
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($categories, JSON_PRETTY_PRINT);
} else {
    echo json_encode('Error: Invalid request method.');
    die();
}
