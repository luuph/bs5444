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
 * @package    Bss_ProductGridInlineEditor
 * @author     Extension Team
 * @copyright  Copyright (c) 2017-2018 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */
namespace Bss\ProductGridInlineEditor\Ui\Component\Listing;

/**
 * Class Columns
 *
 * @package Bss\ProductGridInlineEditor\Ui\Component\Listing
 */
class Columns extends \Magento\Catalog\Ui\Component\Listing\Columns
{
    const PRODUCT_GRID_ACTION = 'catalog_product_index';
    /**
     * @var \Magento\Framework\View\Element\UiComponentFactory
     */
    protected $componentFactory;

    /**
     * @var \Bss\ProductGridInlineEditor\Helper\Data
     */
    protected $helper;

    /**
     * @var \Magento\Framework\App\Request\Http
     */
    protected $request;

    /**
     * Columns constructor.
     * @param \Magento\Framework\View\Element\UiComponent\ContextInterface $context
     * @param \Magento\Catalog\Ui\Component\ColumnFactory $columnFactory
     * @param \Magento\Catalog\Ui\Component\Listing\Attribute\RepositoryInterface $attributeRepository
     * @param \Magento\Framework\View\Element\UiComponentFactory $componentFactory
     * @param \Bss\ProductGridInlineEditor\Helper\Data $helper
     * @param \Magento\Framework\App\Request\Http $request
     * @param array $components
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\UiComponent\ContextInterface $context,
        \Magento\Catalog\Ui\Component\ColumnFactory $columnFactory,
        \Magento\Catalog\Ui\Component\Listing\Attribute\RepositoryInterface $attributeRepository,
        \Magento\Framework\View\Element\UiComponentFactory $componentFactory,
        \Bss\ProductGridInlineEditor\Helper\Data $helper,
        \Magento\Framework\App\Request\Http $request,
        array $components = [],
        array $data = []
    ) {
        parent::__construct($context, $columnFactory, $attributeRepository, $components, $data);
        $this->request = $request;
        $this->componentFactory = $componentFactory;
        $this->helper = $helper;
    }

    /**
     * Prepare component configuration
     *
     * @return void
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function prepare()
    {
        $columnSortOrder = self::DEFAULT_COLUMNS_MAX_ORDER;
        foreach ($this->attributeRepository->getList() as $attribute) {
            $config = [];
            if (!isset($this->components[$attribute->getAttributeCode()])) {
                $config['sortOrder'] = ++$columnSortOrder;
                if ($attribute->getIsFilterableInGrid()) {
                    $config['filter'] = $this->getFilterType($attribute->getFrontendInput());
                }
                $column = $this->columnFactory->create($attribute, $this->getContext(), $config);
                $column->prepare();
                $this->addComponent($attribute->getAttributeCode(), $column);
            }
        }
        $typeAllow =  explode(',', $this->helper->getInputTypeAllow());
        if (!empty($typeAllow) && $this->request->getFullActionName() == self::PRODUCT_GRID_ACTION) {
            // add column Attribute Set Id
            $column_attrsetId = $this->addSelectionsColumn($this->getContext());
            $column_attrsetId->prepare();
            $this->addComponent('bss_attribute_set_id', $column_attrsetId);
            // add class name = attribute code
            foreach ($this->components as $key => $component) {
                $config = $component->getConfig();
                $config['fieldClass'] = [$component->getName() => true];
                // if type is input date -> set fomat date MM/dd/YYYY display in grid
                if (isset($config['dataType']) && $config['dataType'] == 'date') {
                    $config['component'] = 'Bss_ProductGridInlineEditor/js/grid/columns/date';
                }
                $this->components[$key]->setConfig($config);
            }
        }
        parent::prepare();
    }

    /**
     * @param \Magento\Framework\View\Element\UiComponent\ContextInterface $context
     * @return \Magento\Framework\View\Element\UiComponentInterface
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function addSelectionsColumn($context)
    {
        $columnName = 'bss_attribute_set_id';
        $config = [
            'indexField' => 'bss_attribute_set_id',
            'sortOrder' => 0
        ];
        $arguments = [
            'data' => [
                'config' => $config,
            ],
            'context' => $context,
        ];
        return $this->componentFactory->create(
            $columnName,
            \Bss\ProductGridInlineEditor\Plugin\Config\DefinitionCustomize::BSS_DEFINITION_KEY,
            $arguments
        );
    }

    /**
     * @param array $dataSource
     * @return array
     */
    public function prepareDataSource(array $dataSource)
    {
        $dataSource = parent::prepareDataSource($dataSource);

        if (empty($dataSource['data']['items'])) {
            return $dataSource;
        }
        $store = $this->helper->storeManager()->getStore(
            $this->context->getFilterParam('store_id', \Magento\Store\Model\Store::DEFAULT_STORE_ID)
        );
        $currency = $this->helper->localeCurrency()->getCurrency($store->getBaseCurrencyCode());
        $fm_price = $currency->toCurrency(sprintf("%f", 1));

        foreach ($dataSource['data']['items'] as &$item) {
            $status = isset($item['status']) ? $item['status'] : 0;
            $item['bss_attribute_set_id'] = $item['attribute_set_id'] . '-' . $item['type_id'];
            $item['bss_attribute_set_id'] .= '-' . $status . '-'.$fm_price;
        }

        return $dataSource;
    }
}
