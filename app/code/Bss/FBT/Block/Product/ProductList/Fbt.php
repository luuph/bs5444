<?php
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
 * @package    Bss_FBT
 * @author     Extension Team
 * @copyright  Copyright (c) 2017-2018 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */
namespace Bss\FBT\Block\Product\ProductList;

use Magento\Catalog\Model\ResourceModel\Product\Collection;
use Magento\Framework\View\Element\AbstractBlock;

class Fbt extends \Magento\Catalog\Block\Product\AbstractProduct implements \Magento\Framework\DataObject\IdentityInterface
{

    /**
     * @var $itemCollection
     */
    protected $itemCollection;

    /**
     * @var $fbt_itemCollection
     */
    protected $fbt_itemCollection;

    /**
     * @var \Magento\Catalog\Model\Product\Visibility
     */
    protected $catalogProductVisibility;

    /**
     * @var \Magento\Framework\Stdlib\DateTime\DateTime
     */
    protected $timezone;

    /**
     * @var \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory
     */
    protected $productCollectionFactory;

    /**
     * @var \Bss\FBT\Helper\Data
     */
    protected $helper;

    /**
     * @var \Magento\Rule\Model\Condition\Sql\Expression
     */
    protected $expressionFactory;

    /**
     * @var \Bss\FBT\Helper\HelperModel
     */
    protected $helperModel;

    /**
     * Fbt constructor.
     * @param \Magento\Catalog\Block\Product\Context $context
     * @param \Magento\Catalog\Model\Product\Visibility $catalogProductVisibility
     * @param \Magento\Framework\Stdlib\DateTime\DateTime $timezone
     * @param \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory
     * @param \Bss\FBT\Helper\Data $helper
     * @param \Magento\Rule\Model\Condition\Sql\ExpressionFactory $expressionFactory
     * @param \Bss\FBT\Helper\HelperModel $helperModel
     * @param array $data
     */
    public function __construct(
        \Magento\Catalog\Block\Product\Context $context,
        \Magento\Catalog\Model\Product\Visibility $catalogProductVisibility,
        \Magento\Framework\Stdlib\DateTime\DateTime $timezone,
        \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory,
        \Bss\FBT\Helper\Data $helper,
        \Magento\Rule\Model\Condition\Sql\ExpressionFactory $expressionFactory,
        \Bss\FBT\Helper\HelperModel $helperModel,
        array $data = []
    ) {
        $this->catalogProductVisibility = $catalogProductVisibility;
        $this->timezone = $timezone;
        $this->productCollectionFactory = $productCollectionFactory;
        $this->helper = $helper;
        $this->expressionFactory = $expressionFactory;
        $this->helperModel = $helperModel;
        parent::__construct(
            $context,
            $data
        );
    }

    /**
     * @return $this
     */
    protected function _prepareData()
    {
        $product = $this->_coreRegistry->registry('product');
        /* @var $product \Magento\Catalog\Model\Product */
        $this->itemCollection = $product->getFbtProductCollection()->addAttributeToSelect(
            'required_options'
        )->setPositionOrder()->addStoreFilter();

        if ($this->helperModel->helperOptionProduct()->isCheckOut()) {
            $this->_addProductAttributesAndPrices($this->itemCollection);
        }
        $this->itemCollection->setVisibility($this->catalogProductVisibility->getVisibleInCatalogIds());

        $this->itemCollection->load();

        foreach ($this->itemCollection as $product) {
            $product->setDoNotUseCategoryId(true);
        }

        return $this;
    }

    /**
     * @return \Magento\Catalog\Block\Product\AbstractProduct
     */
    protected function _beforeToHtml()
    {
        $this->_prepareData();
        return parent::_beforeToHtml();
    }

    /**
     * @return mixed
     */
    public function getItems()
    {
        return $this->itemCollection;
    }

    /**
     * @return Collection
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @throws \Zend_Db_Statement_Exception
     */
    public function getItemsFbt()
    {
        $product = $this->_coreRegistry->registry('product');
        $productId = $product->getId();
        $sortableString = $this->helper->getSortItemType();
        $sortableString = $this->sortTableString($sortableString);
        $sortable = null;
        parse_str($sortableString, $sortable);
        foreach ($sortable['sort'] as $value) {
            if ($value == 4) {
                # Auto
                $startdate = $this->helper->getStartDate();
                $dateStart = date(' 00:00:00' . 'Y-m-d', strtotime(str_replace('/', '-', $startdate)));
                $dateEnd = date('Y-m-d' . ' 23:59:59', strtotime($this->timezone->gmtDate()));

                $order_ids = $this->helperModel->modelOrderItem()->getOrderIds($dateStart, $dateEnd, $productId);

                $productIds = $this->helperModel->modelOrderItem()->getProductIds($order_ids, $productId);

                arsort($productIds);
                $productIds = $this->getProductId($productIds);
                $collection = $this->productCollectionFactory->create();
                $collection->addAttributeToSelect('*');
                $collection->addFieldToFilter('entity_id', ['in' => $productIds]);
                $this->fbt_itemCollection = $collection;
                $this->fbt_itemCollection->setVisibility($this->catalogProductVisibility->getVisibleInCatalogIds());
                $this->loadItem();
                if ($this->fbt_itemCollection->getSize() < 1) {
                    $this->fbt_itemCollection->getSelect()->order($this->expressionFactory->create(['expression' =>'FIELD(entity_id, ' . implode(',', $productIds).')']));
                    $this->fbt_itemCollection->setPageSize(25);
                    continue;
                } else {
                    break;
                }
            } else {
                $this->getItemCollection($value, $product);

                $this->addProductAttributes();
                $this->fbt_itemCollection->setVisibility($this->catalogProductVisibility->getVisibleInCatalogIds());

                $this->loadItem();
                if ($this->fbt_itemCollection->getSize() < 1) {
                    continue;
                } else {
                    break;
                }
            }
        }
        return $this->fbt_itemCollection;
    }

    /**
     * @return array|string[]
     */
    public function getIdentities()
    {
        $identities = [];
        foreach ($this->getItems() as $item) {
            $identities = array_merge($identities, $item->getIdentities());
        }
        return $identities;
    }

    /**
     * @return bool
     */
    public function canItemsAddToCart()
    {
        foreach ($this->getItems() as $item) {
            if (!$item->isComposite() && $item->isSaleable() && !$item->getRequiredOptions()) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return mixed
     */
    public function getCurrentProduct()
    {
        return $this->_coreRegistry->registry('product');
    }

    /**
     * @param $value
     * @param $product
     */
    protected function getItemCollection($value, $product)
    {
        if ($value == 0) {
            # Related Products
            $this->fbt_itemCollection = $product->getRelatedProductCollection()->addAttributeToSelect('required_options')->setPositionOrder()->addStoreFilter();
        } elseif ($value == 1) {
            # Up-Sell Products
            $this->fbt_itemCollection = $product->getUpSellProductCollection()->setPositionOrder()->addStoreFilter();
        } elseif ($value == 2) {
            # Cross-Sell Products
            $this->fbt_itemCollection = $product->getCrossSellProductCollection()->addAttributeToSelect($this->_catalogConfig->getProductAttributes())->setPositionOrder()->addStoreFilter();
        } elseif ($value == 3) {
            # Frequently Bought Together Products
            $this->fbt_itemCollection = $product->getFbtProductCollection()->addAttributeToSelect('required_options')->setPositionOrder()->addStoreFilter();
        }
    }

    /**
     * @param $item_collection
     * @param $product
     * @param $order_ids
     * @return array
     */
    protected function getProductOrderId($item_collection, $product, $order_ids)
    {
        if ($item_collection->getSize() > 0) {
            foreach ($item_collection as $item) {
                if ($item->getProductId() == $product->getId()) {
                    $order_ids[] = $item->getOrderId();
                }
            }
        }
        return $order_ids;
    }

    /**
     * @param $productIds
     * @return mixed
     * @SuppressWarnings(PHPMD.UnusedFormalParameter
     */
    protected function getProductId($productIds)
    {
        foreach (array_keys($productIds) as $productId) {
            $productIds[$productId] = $productId;
        }
        return $productIds;
    }

    /**
     *
     */
    protected function addProductAttributes()
    {
        if ($this->helperModel->helperOptionProduct()->isCheckOut()) {
            $this->_addProductAttributesAndPrices($this->fbt_itemCollection);
        }
    }

    /**
     * @param $sortableString
     * @return string
     */
    protected function sortTableString($sortableString)
    {
        if (!$sortableString) {
            $sortableString = 'sort[]=0&sort[]=1&sort[]=2&sort[]=3&sort[]=4';
        }
        return $sortableString;
    }

    /**
     *
     */
    protected function loadItem()
    {
        $this->fbt_itemCollection->load();
    }

    /**
     * @param $productIds
     * @param $_item
     * @return mixed
     */
    protected function getItemeQty($productIds, $_item)
    {
        if (isset($productIds[$_item->getProductId()])) {
            $productIds[$_item->getProductId()] += $_item->getQtyOrdered();
        } else {
            $productIds[$_item->getProductId()] = $_item->getQtyOrdered();
        }
        return $productIds[$_item->getProductId()];
    }

    /**
     * @return bool
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function priceIncludesTax()
    {
        return $this->helperModel->helperOptionProduct()->priceIncludesTax();
    }

    /**
     * @return string
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function getBaseUrl()
    {
        return $this->helperModel->helperOptionProduct()->getBaseUrl();
    }

    /**
     * @return mixed
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function getCurrentSymbol()
    {
        return $this->helperModel->helperOptionProduct()->getCurrentSymbol();
    }

    /**
     * @param $item
     * @return int|void
     */
    public function countItem($item)
    {
        return count($item);
    }
}
