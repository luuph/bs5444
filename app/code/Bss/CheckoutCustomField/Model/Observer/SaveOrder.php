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
 * @package    Bss_CheckoutCustomField
 * @author     Extension Team
 * @copyright  Copyright (c) 2018-2019 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */
namespace Bss\CheckoutCustomField\Model\Observer;

use Magento\Framework\Event\Observer as EventObserver;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Json\Helper\Data as JsonHelper;
use Magento\Store\Model\StoreManagerInterface;

/**
 * Visitor Observer
 */
class SaveOrder implements ObserverInterface
{
    /**
     * @var \Magento\Framework\Json\Helper\Data $jsonHelper
     */
    protected $jsonHelper;

    /**
     * @var \Bss\CheckoutCustomField\Model\GridViewAttribute $gridViewAttribute
     */
    protected $gridViewAttributeFactory;

    /**
     * @var \Bss\CheckoutCustomField\Model\Attribute
     */
    protected $attribute;

    /**
     * @var StoreManagerInterface
     */
    protected $storeManager;

    /**
     * @var \Bss\CheckoutCustomField\Model\AttributeOption
     */
    protected $attributeOption;

    /**
     * @var \Magento\Framework\Escaper
     */
    protected $escaper;

    /**
     * @var \Bss\CheckoutCustomField\Model\ResourceModel\HelperModel
     */
    protected $helperModel;

    /**
     * @var \Bss\CheckoutCustomField\Helper\HelperModel
     */
    protected $helper;

    /**
     * @var \Magento\Framework\App\Request\Http
     */
    protected $request;

    /**
     * SaveOrder constructor.
     * @param JsonHelper $jsonHelper
     * @param \Bss\CheckoutCustomField\Model\Attribute $attribute
     * @param \Bss\CheckoutCustomField\Model\AttributeOption $attributeOption
     * @param StoreManagerInterface $storeManager
     * @param \Bss\CheckoutCustomField\Model\GridViewAttributeFactory $gridViewAttributeFactory
     * @param \Magento\Framework\Escaper $escaper
     * @param \Bss\CheckoutCustomField\Model\ResourceModel\HelperModel $helperModel
     * @param \Magento\Framework\App\Request\Http $request
     * @param \Bss\CheckoutCustomField\Helper\HelperModel $helper
     */
    public function __construct(
        JsonHelper $jsonHelper,
        \Bss\CheckoutCustomField\Model\Attribute $attribute,
        \Bss\CheckoutCustomField\Model\AttributeOption $attributeOption,
        StoreManagerInterface $storeManager,
        \Bss\CheckoutCustomField\Model\GridViewAttributeFactory $gridViewAttributeFactory,
        \Magento\Framework\Escaper $escaper,
        \Bss\CheckoutCustomField\Model\ResourceModel\HelperModel $helperModel,
        \Magento\Framework\App\Request\Http $request,
        \Bss\CheckoutCustomField\Helper\HelperModel $helper
    ) {
        $this->jsonHelper = $jsonHelper;
        $this->attribute = $attribute;
        $this->storeManager = $storeManager;
        $this->attributeOption = $attributeOption;
        $this->gridViewAttributeFactory = $gridViewAttributeFactory;
        $this->escaper = $escaper;
        $this->helperModel = $helperModel;
        $this->request = $request;
        $this->helper = $helper;
    }

    /**
     * @param EventObserver $observer
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function execute(EventObserver $observer)
    {
        $order = $observer->getOrder();
        $quoteId = $order->getQuoteId();
        $jsonCustomField = $this->helperModel->getBssCustomFieldByQuote($quoteId);
        $data = $this->request->getPost();
        if ($order->getBssCustomfield()) {
            return $this;
        } elseif ($jsonCustomField || isset($data['bss_customField'])) {
            $field = isset($data['bss_customField']);
            $customAttr = $field ? $data['bss_customField'] : $this->jsonHelper->jsonDecode($jsonCustomField);
            $customAttr = $this->addBssCustomField($customAttr);
            $order->setBssCustomfield($this->jsonHelper->jsonEncode($customAttr))->save();
            if ($customAttr && is_array($customAttr)) {
                $data = $this->returnData($customAttr);
                if (!empty($data)) {
                    $gridView = $this->gridViewAttributeFactory->create()
                        ->getCollection()
                        ->addFieldToFilter('incrementId', $order->getIncrementId())
                        ->addFieldToFilter('store_id', $order->getStoreId())
                        ->setPageSize(1)
                        ->setCurPage(1)
                        ->getLastItem();
                    if ($gridView->getId()) {
                        $gridView->setData($data)->save();
                    } else {
                        $data['incrementId'] = $order->getIncrementId();
                        $data['store_id'] = $order->getStoreId();
                        $this->gridViewAttributeFactory->create()->setData($data)->save();
                    }
                }
            }
        }
        return $this;
    }

    /**
     * @param string $data
     * @return string
     */
    private function addSlashed($data)
    {
        return $this->escaper->escapeQuote($data, true);
    }

    /**
     * @param array $customAttr
     * @return array
     */
    private function returnData($customAttr)
    {
        $attrType = ['dropdown', 'select', 'boolean'];
        $data = [];
        foreach ($customAttr as $key => $attr) {
            if ($attr['show_gird'] != 2) {
                if ($attr['type'] == 'multiselect') {
                    $data[$this->addSlashed($key)]= $this->addSlashed(implode(",", $attr['value']));
                } elseif (in_array($attr['type'], $attrType)) {
                    $data[$this->addSlashed($key)] = $this->addSlashed(json_encode($attr['value']));
                } else {
                    $data[$this->addSlashed($key)] = $this->addSlashed($attr['value']);
                }
            }
        }
        return $data;
    }

    /**
     * @param $customAttr
     * @return array
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    private function addBssCustomField($customAttr)
    {
        $attrCodes = array_keys($customAttr);
        $bssCustomfield = [];
        $collection = $this->attribute->getCollectionByCode($attrCodes);
        $storeId = $this->helper->returnQuoteFactory()->create()->getStoreId();
        foreach ($collection as $col) {
            $label = $col->getFrontendLabel($storeId);
            if ($col->getFrontendInput() == 'multiselect') {
                $value = [];
                foreach ($customAttr[$col->getAttributeCode()] as $val) {
                    $value[] = $this->attributeOption->getLabel($col->getAttributeId(), $val);
                }
            } elseif ($col->getFrontendInput() == 'select' || $col->getFrontendInput() == 'dropdown') {
                $value = $this->attributeOption
                    ->getLabel($col->getAttributeId(), $customAttr[$col->getAttributeCode()]);
            } elseif ($col->getFrontendInput() == 'boolean') {
                $value = $customAttr[$col->getAttributeCode()] ? __("Yes") : __("No");
            } else {
                $value = $customAttr[$col->getAttributeCode()];
            }
            $bssCustomfield[$col->getAttributeCode()] = [
                'show_gird' => $col->getShowGird(),
                'show_in_order' => $col->getShowInOrder(),
                'show_in_pdf' => $col->getShowInPdf(),
                'show_in_email' => $col->getShowInEmail(),
                'frontend_label' => $label,
                'value' => $value,
                'val' => $customAttr[$col->getAttributeCode()],
                'type' => $col->getFrontendInput()
            ];
        }
        return $bssCustomfield;
    }
}
