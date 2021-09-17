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

namespace Bss\CustomizeFBT\Plugin;

class OptionProduct
{
    protected \Magento\Framework\View\LayoutInterface $layout;

    /**
     * @param \Magento\Framework\View\LayoutInterface $layout
     */
    public function __construct(\Magento\Framework\View\LayoutInterface $layout)
    {
        $this->layout = $layout;
    }

    public function aroundGetHtmlMuntiple($subject, callable $proceed, $product_poup, $info_mn_cart, $errormessageCart)
    {
        $template = 'Bss_CustomizeFBT::popup.phtml';
        return $this->layout
            ->createBlock(\Bss\FBT\Block\OptionProduct::class)
            ->setTemplate($template)
            ->setProduct($product_poup)
            ->setCart($info_mn_cart)
            ->setErrorMessageCart($errormessageCart)
            ->setTypeadd('muntiple')
            ->toHtml();
    }

    public function aroundGetHtmlSingle($subject, callable $proceed, $product_poup, $info_mn_cart)
    {
        $template = 'Bss_CustomizeFBT::popup.phtml';
        return $this->layout
            ->createBlock('Bss\FBT\Block\OptionProduct')
            ->setTemplate($template)
            ->setProduct($product_poup)
            ->setCart($info_mn_cart)
            ->setTypeadd('single')
            ->toHtml();
    }
}
