<?php

function sendEvent($id, $data) {
    $data['id'] = $id;
    echo "data: " . json_encode($data) . "\n\n";
    ob_flush();
    flush();
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

foreach ($categories as &$cat) {
    sendEvent('Kategooria', $cat);

    foreach ($cat['sub_categories'] as &$subcat) {
        $url = $subcat['link'];
        $productsCount = 0;
        $discountCount = 0;
    
        $html = fetchPageContent($url);
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        $productsCountNode = $xpath->query('//h2[normalize-space(text())="Filtreeri tooteid"]/span[@class="counter"]');
        if ($productsCountNode->length > 0) {
            $productsCountText = $productsCountNode->item(0)->nodeValue;
            $productsCountText = trim($productsCountText);
            $productsCountText = preg_replace('/[()]/', '', $productsCountText);
            $productsCount = (int)($productsCountText);
        }

        $discountsCountNode = $xpath->query('//label[normalize-space(text())="Sooduspakkumised"]/span[@class="counter"]');
        if ($discountsCountNode->length > 0) {
            $discountsCountText = $discountsCountNode->item(0)->nodeValue;
            $discountsCountText = trim($discountsCountText);
            $discountsCountText = preg_replace('/[()]/', '', $discountsCountText);
            $discountCount = (int)($discountsCountText);
        }

        $subcat['productsCount'] = $productsCount;
        $subcat['discountCount'] = $discountCount;

        sendEvent('Alam-kategooria', $subcat);

        foreach ($subcat['sub_items'] as &$bottomitem) {
            $url = $bottomitem['link'];
            $productsCount = 0;
            $discountCount = 0;
        
            $html = fetchPageContent($url);
            $dom = new DOMDocument();
            libxml_use_internal_errors(true);
            $dom->loadHTML($html);
            libxml_clear_errors();

            $xpath = new DOMXPath($dom);

            $productsCountNode = $xpath->query('//h2[normalize-space(text())="Filtreeri tooteid"]/span[@class="counter"]');
            if ($productsCountNode->length > 0) {
                $productsCountText = $productsCountNode->item(0)->nodeValue;
                $productsCountText = trim($productsCountText);
                $productsCountText = preg_replace('/[()]/', '', $productsCountText);
                $productsCount = (int)($productsCountText);
            }

            $discountsCountNode = $xpath->query('//label[normalize-space(text())="Sooduspakkumised"]/span[@class="counter"]');
            if ($discountsCountNode->length > 0) {
                $discountsCountText = $discountsCountNode->item(0)->nodeValue;
                $discountsCountText = trim($discountsCountText);
                $discountsCountText = preg_replace('/[()]/', '', $discountsCountText);
                $discountCount = (int)($discountsCountText);
            }

            $bottomitem['productsCount'] = $productsCount;
            $bottomitem['discountCount'] = $discountCount;

            sendEvent('Alam-alam-kategooria', $bottomitem);
        }
    }
}

echo "event: end\n";
echo "data: end\n\n";
ob_flush();
flush();
