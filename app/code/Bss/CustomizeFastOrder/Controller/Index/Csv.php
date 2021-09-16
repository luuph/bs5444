<?php
declare(strict_types=1);
/**
 * BSS Commerce Co.
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the EULA
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://bsscommerce.com/Bss-Commerce-License.txt
 *
 * @category   BSS
 * @package    Bss_
 * @author     Extension Team
 * @copyright  Copyright (c) 2021 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */

namespace Bss\CustomizeFastOrder\Controller\Index;

use Magento\Catalog\Model\Product\Attribute\Source\Status;

class Csv extends \Bss\FastOrder\Controller\Index\Csv
{
    /**
     * @param null $csvLines
     * @return array
     * @throws \Magento\Framework\Exception\LocalizedException
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    protected function getResponseCsv($csvLines = null)
    {
        $data = [];
        $skuData = [];
        $qtyData = [];
        $skuExist = [];
        $this->getSkuData($csvLines, $skuData, $qtyData);
        $productCollection = $this->saveModel->getStandardProductCollection($skuData, true);
        $allProductSearch = $this->saveModel->getAllProductSearch($skuData)->getData();
        $skuImportSuccess = [];
        $disablePr = [];

        $cantAccessSku = [];
        if (is_array($allProductSearch)) {
            foreach ($allProductSearch as $product) {
                $productSku = strtolower($product["sku"]);
                $skuExist[] = $productSku;
            }
        }
        foreach ($productCollection as $product) {
            $productSku = strtolower($product->getSku());
            $skuExist[] = $productSku;

            $this->helperData->getEventManager()->dispatch(
                'bss_fast_order_prepare_product_add',
                [
                    'product' => $product
                ]
            );
            // Catalog permission checking
            if ($product->getCantAccess()) {
                $cantAccessSku[] = $productSku;
                $skuImportSuccess[] = $productSku;
                $productCollection->removeItemByKey($product->getId());
                continue;
            }

            if ($product->getStatus() == Status::STATUS_DISABLED) {
                $disablePr[] = $productSku;
                $productCollection->removeItemByKey($product->getId());
                continue;
            }
            $skuImportSuccess[] = $productSku;
            if ($parentProductId = $this->configurableProductHelper->getParentProductId($product->getId())) {
                // handle for child of configurable product
                $parentProduct = $this->productRepository->getById($parentProductId);
                $childData = $this->configurableProductHelper->getChildProductData(
                    $parentProduct,
                    $product
                );
                if (!empty($childData)) {
                    $product->setData($childData->getData());
                }
            }
            $qty = 1;
            if (!empty($qtyData[$productSku])) {
                $qty = $qtyData[$productSku];
            }
            $product->setQty($qty);
        }
        $skuNotExist = array_diff($skuData, $skuExist);
        $skuOutStock = array_diff($skuExist, $skuImportSuccess);
        $skuOutStock = array_diff($skuOutStock, $disablePr);
        if (!empty($skuImportSuccess)) {
            $data = $productCollection->toArray([
                'name',
                'sku',
                'entity_id',
                'type_id',
                'product_hide_price',
                'product_hide_html',
                'product_thumbnail',
                'product_url',
                'popup',
                'product_price',
                'product_price_amount',
                'product_price_exc_tax_html',
                'product_price_exc_tax',
                'qty',
                'popup_html',
                'configurable_attributes',
                'child_product_id'
            ]);
        }

        return [$skuNotExist, $data, $skuOutStock, $disablePr, $cantAccessSku];
    }

    /**
     * @param $csvLines
     * @param $skuData
     * @param $qtyData
     */
    protected function getSkuData($csvLines, &$skuData, &$qtyData)
    {
        $delimiter = $this->_getDelimiter($csvLines[0]);
        foreach ($csvLines as $csvLine) {
            $arrLine = explode($delimiter, $csvLine);
            $sku = strtolower($arrLine[0]);
            $qty = (float) $arrLine[1];

            if (!$sku) {
                continue;
            }
            $skuData[] = $sku;

            if (empty($qty)) {
                $qty = 1;
            }
            $qtyData[$sku] = $qty;
        }
    }
}
