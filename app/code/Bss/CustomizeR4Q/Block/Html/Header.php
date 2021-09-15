<?php
declare(strict_types=1);
namespace Bss\CustomizeR4Q\Block\Html;

class Header extends \Magento\Framework\View\Element\Template
{
    public function _toHtml()
    {
        $header_config = $this->_scopeConfig->getValue(
            'themeoption/header/select_header_type',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        if($header_config && $header_config != ''){
            $this->setTemplate('Bss_CustomizeR4Q::html/headers/'.$header_config.'.phtml');
        }
        else{
            $this->setTemplate('Bss_CustomizeR4Q::html/header_custom.phtml');
        }

        // var_dump($this->getTemplate());exit;
        return parent::_toHtml();
    }
}
