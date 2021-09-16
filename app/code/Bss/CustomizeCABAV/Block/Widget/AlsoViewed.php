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
 * @package    Bss_CustomizeCABAV
 * @author     Extension Team
 * @copyright  Copyright (c) 2021 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */

namespace Bss\CustomizeCABAV\Block\Widget;

class AlsoViewed extends \Bss\CABAV\Block\Widget\AlsoViewed
{
    const MODE_GRID = 1;
    const MODE_SLIDER = 0;

    protected $_template = "Bss_CustomizeCABAV::widget/alsoviewed.phtml";
}
