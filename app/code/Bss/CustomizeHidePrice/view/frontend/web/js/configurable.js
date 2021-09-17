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
 * @package    Bss_HidePrice
 * @author     Extension Team
 * @copyright  Copyright (c) 2017-2020 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */
define([
    'jquery',
    'underscore',
    'priceUtils'
], function ($, _, priceUtils) {
    'use strict';

    return function (widget) {

        $.widget('mage.configurable', widget, {

            /**
             * Configure an option, initializing it's state and enabling related options, which
             * populates the related option's selection and resets child option selections.
             * @private
             * @param {*} element - The element associated with a configurable option.
             */
            _configureElement: function (element) {
                this._super(element);
                if (this.options.spConfig) {
                    var childProductData = this.options.spConfig.hidePrice;
                    if (!$.isEmptyObject(childProductData) && childProductData && childProductData.child && !$.isEmptyObject(childProductData.child)) {
                        this._UpdateHidePrice();
                    }
                }
            },

            _fillSelect: function (element) {
                if ($('#check-version-bss-hide').length) {
                    this._super(element);
                } else {
                    var attributeId = element.id.replace(/[a-z]*/, ''),
                        options = this._getAttributeOptions(attributeId),
                        prevConfig,
                        index = 1,
                        allowedProducts,
                        finalPrice = 0,
                        i,
                        j,
                        optionFinalPrice,
                        optionPriceDiff,
                        optionPrices = this.options.spConfig.optionPrices,
                        allowedProductMinPrice,
                        allowedOptions = [];
                    if (!$.isEmptyObject(this.options.spConfig.prices)) {
                        finalPrice = parseFloat(this.options.spConfig.prices.finalPrice.amount)
                    }
                    this._clearSelect(element);
                    element.options[0] = new Option('', '');
                    element.options[0].innerHTML = this.options.spConfig.chooseText;
                    prevConfig = false;

                    if (element.prevSetting) {
                        prevConfig = element.prevSetting.options[element.prevSetting.selectedIndex];
                    }

                    if (options) {
                        for (var indexKey in this.options.spConfig.index) {
                            /* eslint-disable max-depth */
                            if (this.options.spConfig.index.hasOwnProperty(indexKey)) {
                                var a = this.options.spConfig.index[indexKey];
                                allowedOptions = allowedOptions.concat(_.values(a));
                            }
                        }

                        if (prevConfig) {
                            var allowedProductsByOption = {};
                            var allowedProductsAll = [];

                            for (i = 0; i < options.length; i++) {
                                /* eslint-disable max-depth */
                                for (j = 0; j < options[i].products.length; j++) {
                                    // prevConfig.config can be undefined
                                    if (prevConfig.config &&
                                        prevConfig.config.allowedProducts &&
                                        prevConfig.config.allowedProducts.indexOf(options[i].products[j]) > -1) {
                                        if (!allowedProductsByOption[i]) {
                                            allowedProductsByOption[i] = [];
                                        }
                                        allowedProductsByOption[i].push(options[i].products[j]);
                                        allowedProductsAll.push(options[i].products[j]);
                                    }
                                }
                            }

                            if (typeof allowedProductsAll[0] !== 'undefined' &&
                                typeof optionPrices[allowedProductsAll[0]] !== 'undefined') {
                                var allowedProductsAllMinPrice = this._getAllowedProductWithMinPrice(allowedProductsAll);
                                finalPrice = parseFloat(optionPrices[allowedProductsAllMinPrice].finalPrice.amount);
                            }
                        }

                        for (i = 0; i < options.length; i++) {
                            if (prevConfig && typeof allowedProductsByOption[i] === 'undefined') {
                                continue; //jscs:ignore disallowKeywords
                            }

                            allowedProducts = prevConfig ? allowedProductsByOption[i] : options[i].products.slice(0);
                            optionPriceDiff = 0;

                            if (typeof allowedProducts[0] !== 'undefined' &&
                                typeof optionPrices[allowedProducts[0]] !== 'undefined') {
                                allowedProductMinPrice = this._getAllowedProductWithMinPrice(allowedProducts);
                                if ($.isEmptyObject(optionPrices[allowedProductMinPrice])) {
                                    optionFinalPrice = 0;
                                } else {
                                    optionFinalPrice = parseFloat(optionPrices[allowedProductMinPrice].finalPrice.amount);
                                }
                                optionPriceDiff = optionFinalPrice - finalPrice;
                                if (typeof options[i].initialLabel != 'undefined') {
                                    options[i].label = options[i].initialLabel;
                                }
                                
                                if (!jQuery('#hideprice').length) {
                                    if (optionPriceDiff !== 0) {
                                        options[i].label += ' ' + priceUtils.formatPrice(
                                            optionPriceDiff,
                                            this.options.priceFormat,
                                            true
                                        );
                                    }
                                }
                            }

                            if (allowedProducts.length > 0 || _.include(allowedOptions, options[i].id)) {
                                options[i].allowedProducts = allowedProducts;
                                element.options[index] = new Option(this._getOptionLabel(options[i]), options[i].id);

                                if (typeof options[i].price !== 'undefined') {
                                    element.options[index].setAttribute('price', options[i].price);
                                }

                                if (allowedProducts.length === 0) {
                                    element.options[index].disabled = true;
                                }

                                element.options[index].config = options[i];
                                index++;
                            }

                            /* eslint-enable max-depth */
                        }
                    }
                }
            },

            _UpdateHidePrice: function () {
                var $widget = this,
                    index = '',
                    currentEl = 'currentEl',
                    childProductData = this.options.spConfig.hidePrice,
                    $useHidePrice,
                    $showPrice,
                    $content;
                $(".super-attribute-select").each(function () {
                    var option_id = $(this).attr("option-selected");
                    if (typeof option_id === "undefined" && $(this).val() !== "") {
                        option_id = $(this).val();
                    }
                    if (option_id !== null && $(this).val() !== "") {
                        index += option_id + '_';
                    }
                });

                if (jQuery('#hideprice').length) { //product page
                    if (typeof childProductData !== "undefined" && !jQuery.isEmptyObject(childProductData)) {
                        if (!childProductData['child'].hasOwnProperty(currentEl)) {
                            childProductData['child'][currentEl] = jQuery('#hideprice').html();
                        }

                        if (!childProductData['child'].hasOwnProperty(index)) {
                            $widget._ResetHidePrice(childProductData['child'][currentEl]);
                            return false;
                        }
                        $useHidePrice = childProductData['child'][index]['hide_price'];
                        $showPrice = childProductData['child'][index]['show_price'];

                        $content = childProductData['child'][index]['hide_price_content'];
                        if (!$useHidePrice) {
                            jQuery('.price-box.price-final_price').css('display', 'block');
                            jQuery('#hideprice').html(childProductData['child'][currentEl]);
                            jQuery('#hideprice').find('.qty-changer').css('display', 'block');
                        } else {
                            if (!$showPrice) {
                                jQuery('.price-box.price-final_price').css('display', 'none');
                            } else {
                                jQuery('.price-box.price-final_price').css('display', 'block');
                            }
                            if ($(".qty-changer").length > 0){
                                jQuery('#hideprice').find('.qty-changer').css('display', 'none');
                            }
                            jQuery('#hideprice').html($content);
                        }
                    }
                } else { //category page
                    if (typeof childProductData !== "undefined" && !jQuery.isEmptyObject(childProductData)) {
                        if (!childProductData.hasOwnProperty('parent_id')) {
                            return false;
                        }

                        var selector = childProductData['selector'];
                        var element = '#hideprice_price' + childProductData['parent_id'];

                        if (!childProductData['child'].hasOwnProperty(index)) {
                            $widget._ResetHidePriceCategory(childProductData['child'][currentEl], element, selector);
                            return false;
                        }

                        $useHidePrice = childProductData['child'][index]['hide_price'];
                        $showPrice = childProductData['child'][index]['show_price'];
                        $content = childProductData['child'][index]['hide_price_content'];

                        if (!$useHidePrice) {
                            jQuery(element).parent().find('.action.tocart').show();
                            jQuery(element).parent().find(selector).show();
                            jQuery(element).parents(".product-item-details").find('.action.tocart').show();
                            jQuery(element).parents(".product-item-details").find(selector).show();
                            jQuery('#hideprice_price' + childProductData['parent_id']).show();
                            jQuery('#hideprice_' + childProductData['parent_id']).html('');
                        } else {
                            jQuery(element).parent().find('.action.tocart').hide();
                            jQuery(element).parent().find(selector).hide();
                            jQuery(element).parents(".product-item-details").find('.action.tocart').hide();
                            jQuery(element).parents(".product-item-details").find(selector).hide();
                            if (!$showPrice) {
                                jQuery('#hideprice_price' + childProductData['parent_id']).hide();
                            } else {
                                jQuery('#hideprice_price' + childProductData['parent_id']).show();
                            }
                            jQuery('#hideprice_' + childProductData['parent_id']).html($content);
                        }
                    } else {
                        return false;
                    }
                }
            },

            _ResetHidePrice: function (currentEl) {
                jQuery('.price-box.price-final_price').css('display', 'block');
                jQuery('#hideprice').html(currentEl);
                if (jQuery(".qty-changer").length > 0){
                    jQuery('#hideprice').find('.qty-changer').css('display', 'block');
                }
            },

            _ResetHidePriceCategory: function (elm, selector) {
                jQuery(elm).show();
                jQuery(elm).parent().find('.action.tocart').show();
                jQuery(elm).parent().find(selector).show();
                jQuery(elm).parents(".product-item-details").find('.action.tocart').show();
                jQuery(elm).parents(".product-item-details").find(selector).show();
                jQuery(elm).prev().html('');
            },

            /**
             * Get product with minimum price from selected options.
             *
             * @param {Array} allowedProducts
             * @returns {String}
             * @private
             */
            _getAllowedProductWithMinPrice: function (allowedProducts) {
                var childProductData = this.options.spConfig.hidePrice;
                if (!$.isEmptyObject(childProductData) && childProductData && childProductData.child && !$.isEmptyObject(childProductData.child)) {
                    $.each(childProductData.child, function (index, child) {
                        if (child['hide_price'] === true) {
                            allowedProducts = $.grep(allowedProducts, function (value) {
                                return value != child['entity'];
                            });
                        }
                    });
                }
                return this._super(allowedProducts);
            }
        });

        return $.mage.configurable;
    }
});
