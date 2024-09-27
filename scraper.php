<?php

set_time_limit(300);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $value = $input['value'] ?? null;

    if ($value !== 'true') {
        echo json_encode('Invalid value sent with buttonclick.');
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
                    if (strpos($bottomLink->nodeValue, 'õik') !== false) {
                        continue;
                    }
                    $bottomItem = [
                        'name' => trim($bottomLink->nodeValue),
                        'link' => ($bottomLink instanceof DOMElement) ? $bottomLink->getAttribute('href') : '',
                    ];
                    $bottomItems[] = $bottomItem;
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

    function fetchPageContent($url) {
        $context = stream_context_create(array(
            'http' => array(
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
            )
        ));
        return file_get_contents($url, false, $context);
    }
    
    function getNextPageUrl($dom, $xpath) {
        $nextActionNode = $xpath->query('//*[@id="nextAnchor"]')->item(0);
        if ($nextActionNode) {
            return $nextActionNode->getAttribute('href') . '&p=1';
        }
        return null;
    }
    
    function countProductsAndDiscounts($dom, $xpath) {
        $productNodes = $xpath->query('//article[contains(@class, "product-card vertical")]');
        $productsCount = $productNodes->length;
    
        $soodushindCount = 0;
        foreach ($productNodes as $productNode) {
            if (strpos($productNode->textContent, 'Soodushind') !== false) {
                $soodushindCount++;
            }
        }
    
        return [$productsCount, $soodushindCount];
    }

    foreach ($categories as &$cat) {
        foreach ($cat['sub_categories'] as &$subcat) {
            foreach ($subcat['sub_items'] as &$bottomitem) {
                $url = $bottomitem['link'];
                $productsCount = 0;
                $soodushindCount = 0;
            
                do {
                    $html = fetchPageContent($url);
                    $dom = new DOMDocument();
                    libxml_use_internal_errors(true);
                    $dom->loadHTML($html);
                    libxml_clear_errors();
            
                    $xpath = new DOMXPath($dom);
                
                    $url = getNextPageUrl($dom, $xpath);
                } while ($url);

                list($pageProductsCount, $pageSoodushindCount) = countProductsAndDiscounts($dom, $xpath);
                $productsCount += $pageProductsCount;
                $soodushindCount += $pageSoodushindCount;
            
                $bottomitem['productsCount'] = $productsCount;
                $bottomitem['soodushindCount'] = $soodushindCount;
            }
        }
    }

    header('Content-Type: application/json');
    echo json_encode($categories, JSON_PRETTY_PRINT);
} else {
    echo json_encode('Error: Invalid request method.');
    die();
}
