define([
    'jquery',
    'mage/translate',
    'Magento_Customer/js/customer-data',
    'Rokanthemes_AjaxSuite/js/model/ajaxsuite-popup',
    'mage/validation/validation'
], function ($, $t, customerData, ajaxsuitepopup) {
    'use strict';

    $.widget('rokanthemes.ajaxsuite', {
        options: {
                popupWrapperSelector : '#mb-ajaxsuite-popup-wrapper',
                ajaxCart: {
                    enabled: 0,
                    actionAfterSuccess: 'popup',
                    continueShoppingSelector: '#button_continue_shopping',
                    minicartSelector: '[data-block="minicart"]',
                    messagesSelector: '[data-placeholder="messages"]',
                    initConfig: {
                        'show_success_message': true,
                        'timerErrorMessage': 3000,
                        'addWishlistItemUrl': null
                    },
                    formKey: null,
                    formKeyInputSelector: 'input[name="form_key"]',
                    addToCartButtonSelector: 'button.tocart',
                    addToCartUrl: null,
                    addToCartInWishlistUrl: null,
                    wishlistAddToCartUrl: null,
                    checkoutCartUrl: null,
                    addToCartButtonDisabledClass: 'disabled',
                    addToCartButtonTextWhileAdding: $t('Adding...'),
                    addToCartButtonTextAdded: $t('Added'),
                    addToCartButtonTextDefault: $t('Add to Cart')
                },
                ajaxWishList: {
                    enabled: 0,
                    WishlistUrl: null,
                    wishlistBtnSelector: '[data-action="add-to-wishlist"]',
                    btnCloseSelector: '#ajaxwishlist_btn_close_popup',
                    btnCancelSelector: '#ajaxwishlist_btn_cancel',
                    btnToLoginSelector: '#ajaxwishlist_btn_to_login'
                },
                ajaxCompare: {
                    enabled: 0,
                    compareSelector: '.tocompare',
                    CompareUrl: null,
                },
                quickView: {
                    enabled: 0
                },
                popupSelector: '#ajaxsuite-popup-content',
                loginUrl: null,
                customerId: null

        },
        _create: function() {
            this._bind();
            this.options.popupWrapper = $('<div />', {
                    'id': 'mb-ajaxsuite-popup-wrapper'
                }).appendTo($('#ajaxsuite-popup-content'));
        },
        showModal: function (element) {
            ajaxsuitepopup.createPopUp(element);
            ajaxsuitepopup.showModal();
            return ajaxsuitepopup;
        },
        getCustomerData: function()
        {
            var customer = customerData.get('customer');
            var customerInfo = customer();
            if (customerInfo && customerInfo.fullname) {
                return true;
            }
            return false;
        },
        // initEventsWishlist: function()
        // {
        //     var self = this;
        //     var get_customer_data = this.getCustomerData();
        //
        //     if(!get_customer_data){
        //         //$(self.options.ajaxWishList.wishlistBtnSelector).addClass("trigger-auth-popup").attr('data-action', 'ajax-popup-login').removeAttr("data-post");
        //     }
        //     $('body').on('click',self.options.ajaxWishList.wishlistBtnSelector, function (e) {
        //         if (!get_customer_data) {
        //             $(self.options.ajaxWishList.wishlistBtnSelector).addClass("trigger-auth-popup").attr('data-action', 'ajax-popup-login').attr('href', 'javascript:void(0);').removeAttr("data-post");
        //             e.preventDefault();
        //             return;
        //         }
		// 		var _this_fixed = $(this);
        //         _this_fixed.addClass('loading');
        //         e.preventDefault();
        //         e.stopPropagation();
        //         if($(this).data('post'))
        //         {
        //             var params = $(this).data('post').data;
        //         }else
        //         {
        //             var params = {};
        //         }
        //         params['ajax_post'] = true;
        //         $('body').trigger('processStart');
        //         $.ajax({
        //             url: self.options.ajaxWishList.WishlistUrl,
        //             data: params,
        //             type: 'post',
        //             showLoader: false,
        //             dataType: 'json',
        //             success: function (res) {
        //                 ajaxsuitepopup.hideModal();
        //                 if (res.html_popup) {
        //                     self.options.popupWrapper.html(res.html_popup);
        //                     self.showModal(self.options.popupWrapper);
        //                 }
        //                 self.reloadCustomerData(['wishlist']);
		// 				_this_fixed.removeClass('loading');
        //             },
        //             error: function (res) {
        //                 alert('Error in sending ajax request');
		// 				_this_fixed.removeClass('loading');
        //             }
        //         });
        //         $('body').trigger('processStop');
        //     });
        // },
        initEventsCompare: function () {
            var self = this;
            $('body').on('click',self.options.ajaxCompare.compareSelector, function (e) {

                e.preventDefault();
                e.stopPropagation();
				var _this_fixed = $(this);
                _this_fixed.addClass('loading');
                var params = $(this).data('post').data;
                if($(this).data('post'))
                {
                    var params = $(this).data('post').data;
                }else
                {
                    var params = {};
                }
                $('body').trigger('processStart');
                $.ajax({
                    url: self.options.ajaxCompare.CompareUrl,
                    data: params,
                    type: 'post',
                    showLoader: false,
                    dataType: 'json',
                    success: function (res) {
                        ajaxsuitepopup.hideModal();
                        if (res.html_popup) {
                            self.options.popupWrapper.html(res.html_popup);
                            self.showModal(self.options.popupWrapper);
                        }
                        self.reloadCustomerData(['compare-products']);
						_this_fixed.removeClass('loading');
                    },
                    error: function (res) {
                        alert('Error in sending ajax request');
						_this_fixed.removeClass('loading');
                    }
                });
                $('body').trigger('processStop');
            });
        },
        initEventsAjaxCart: function()
        {
            var self = this;
            $('body').delegate(self.options.ajaxCart.addToCartButtonSelector, 'click', function (e) {
                var form = $(this).closest('form');
                if(form.length)
                {
                    var action = form.attr('action');
                    if(action.indexOf('checkout/cart/add') != -1)
                    {
                        e.preventDefault();
                        if ($(this).closest('.product-info-main').length) {             //In product details page
                            var dataForm = $(this).closest('form#product_addtocart_form');
                            var validate = dataForm.validation('isValid');
                            if (validate) {
                                var form = $(this).closest('form');
                                self.ajaxCartSubmit(form);
                            }
                            return;
                        }
                        self.ajaxCartSubmit(form);
                    }
                }
            });
            $('body').on('click', self.options.ajaxCart.continueShoppingSelector, function (e) {
                ajaxsuitepopup.hideModal();
            });
            $(document).on('ajaxComplete', function (event, xhr, settings) {
                if (settings.type.match(/get/i)
                    && settings.url.match(/customer\/section\/load/i)
                    && _.isObject(xhr.responseJSON) &&
                    xhr.responseJSON.cart
                ) {
                    if($(self.options.ajaxCart.minicartSelector).hasClass('ajaxcartcomplete'))
                    {
                        $(self.options.ajaxCart.minicartSelector + ' a.showcart').trigger('click');
                    }
                    $(self.options.ajaxCart.minicartSelector).removeClass('ajaxcartcomplete');
                }
            });
        },
        ajaxCartSubmit: function (form) {
            var self = this;
            $(self.options.ajaxCart.minicartSelector).trigger('contentLoading');
			$('body').addClass('ajax-cart');
            self.disableAddToCartButton(form);
            $.ajax({
                url: form.attr('action').replace('checkout/cart', 'ajaxsuite/cart'),
                data: form.serialize(),
                type: 'post',
                showLoader: false,
                dataType: 'json',
                success: function (res) {
                    ajaxsuitepopup.hideModal();
                    if (res.success) {
                        if(self.options.ajaxCart.actionAfterSuccess == 'popup')
                        {
                            self.options.popupWrapper.html(res.success);
                            self.showModal(self.options.popupWrapper);
                        }else{
                            $(self.options.ajaxCart.minicartSelector).addClass('ajaxcartcomplete');
                        }
                        self.reloadCustomerData(['cart']);
                        //$(self.options.ajaxCart.minicartSelector + ' a.showcart').trigger('click');
                    }
                    else if (res.error && res.url) {
                        window.location.href = res.url;
                    }else if (res.error && res.content) {
                        if(!form.closest(self.options.popupWrapperSelector).length)
                        {
                            self.options.popupWrapper.html(res.content);
                            self.showModal(self.options.popupWrapper);
                        }
                    }else if(res.error)
                    {
                        self.options.popupWrapper.html(res.error);
                        self.showModal(self.options.popupWrapper);
                        window.location.reload();
                    }
                    self.enableAddToCartButton(form);
                    $(self.options.ajaxCart.minicartSelector).trigger('contentUpdated');
					$('body').removeClass('ajax-cart');
                }
            });
        },
        disableAddToCartButton: function (form) {
            var addToCartButton = $(form).find(this.options.ajaxCart.addToCartButtonSelector);
            addToCartButton.addClass(this.options.ajaxCart.addToCartButtonDisabledClass);
            addToCartButton.attr('title', this.options.ajaxCart.addToCartButtonTextWhileAdding);
            addToCartButton.find('span').text(this.options.ajaxCart.addToCartButtonTextWhileAdding);
        },
        enableAddToCartButton: function (form) {
            var self = this, addToCartButton = $(form).find(this.options.ajaxCart.addToCartButtonSelector);
            addToCartButton.find('span').text(this.options.ajaxCart.addToCartButtonTextAdded);
            addToCartButton.attr('title', this.options.ajaxCart.addToCartButtonTextAdded);

            setTimeout(function () {
                addToCartButton.removeClass(self.options.ajaxCart.addToCartButtonDisabledClass);
                addToCartButton.find('span').text(self.options.ajaxCart.addToCartButtonTextDefault);
                addToCartButton.attr('title', self.options.ajaxCart.addToCartButtonTextDefault);
            }, 1000);
        },
        reloadCustomerData: function(sessionName)
        {
            customerData.reload(sessionName, false);
        },
        _bind: function () {
            if(this.options.ajaxCart.enabled)
            {
               this.initEventsAjaxCart();
            }
            // if(this.options.ajaxWishList.enabled)
            // {
            //     this.initEventsWishlist();
            // }
            if(this.options.ajaxCompare.enabled)
            {
                this.initEventsCompare();
            }
        }

    });

    return $.rokanthemes.ajaxsuite;
});
