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
 * @package    Bss_QuoteExtension
 * @author     Extension Team
 * @copyright  Copyright (c) 2018-2019 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */
namespace Bss\CustomizeR4Q\Model\Quote\Address;

/**
 * Class Renderer used for formatting the quote address
 *
 * @package Bss\QuoteExtension\Model\Quote\Address
 */
class Renderer extends \Bss\QuoteExtension\Model\Quote\Address\Renderer
{

    /**
     * @var \Magento\Customer\Model\Address\Config
     */
    protected $addressConfig;

    /**
     * @var \Magento\Framework\Event\ManagerInterface
     */
    protected $eventManager;

    /**
     * @var \Magento\Quote\Model\Quote\Address\ToOrderAddress
     */
    protected $quoteAddressToOrderAddress;

    /**
     * Renderer constructor.
     * @param \Magento\Customer\Model\Address\Config $addressConfig
     * @param \Magento\Framework\Event\ManagerInterface $eventManager
     * @param \Magento\Quote\Model\Quote\Address\ToOrderAddress $quoteAddressToOrderAddress
     */
    public function __construct(
        \Magento\Customer\Model\Address\Config $addressConfig,
        \Magento\Framework\Event\ManagerInterface $eventManager,
        \Magento\Quote\Model\Quote\Address\ToOrderAddress $quoteAddressToOrderAddress
    ) {
        $this->addressConfig = $addressConfig;
        $this->eventManager = $eventManager;
        $this->quoteAddressToOrderAddress = $quoteAddressToOrderAddress;
        \Magento\Sales\Model\Order\Address\Renderer::__construct($addressConfig, $eventManager);
    }

    /**
     * Format address in a specific way
     *
     * @param \Magento\Quote\Model\Quote\Address $address
     * @param string $type
     * @return string|null
     */
    public function formatQuoteAddress(\Magento\Quote\Model\Quote\Address $address, $type)
    {
        $address = $this->quoteAddressToOrderAddress->convert($address);
        return $this->format($address, $type);
    }
}
