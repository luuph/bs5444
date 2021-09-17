define([
    'jquery',
    'Rokanthemes_AjaxSuite/js/model/ajaxsuite-popup'
], function ($, ajaxSuitePopup) {
    'use strict';

    const customWishlistAdd = {
        /**
         * Submit add to wishlist event
         */
        initEventsWishlist: function() {
            var self = this, $body = $('body'), getCustomerData;

            // If multiwishlist enabled
            if ($(self.options.ajaxWishList.wishlistBtnSelector).attr('multiwishlist') === 'enabled') {
                return;
            }

            getCustomerData = this.getCustomerData();

            if(!getCustomerData){
                //$(self.options.ajaxWishList.wishlistBtnSelector).addClass("trigger-auth-popup").attr('data-action', 'ajax-popup-login').removeAttr("data-post");
            }
            $body.on('click',self.options.ajaxWishList.wishlistBtnSelector, function (e) {
                var params = {},
                    _this_fixed = $(this);

                if (!getCustomerData) {
                    $(self.options.ajaxWishList.wishlistBtnSelector).addClass("trigger-auth-popup").attr('data-action', 'ajax-popup-login').attr('href', 'javascript:void(0);').removeAttr("data-post");
                    e.preventDefault();
                    return;
                }
                _this_fixed.addClass('loading');
                e.preventDefault();
                e.stopPropagation();

                if($(this).data('post'))
                {
                    params = $(this).data('post').data;
                }

                params['ajax_post'] = true;
                $body.trigger('processStart');
                $.ajax({
                    url: self.options.ajaxWishList.WishlistUrl,
                    data: params,
                    type: 'post',
                    showLoader: false,
                    dataType: 'json',
                    success: function (res) {
                        ajaxSuitePopup.hideModal();
                        if (res['html_popup']) {
                            self.options.popupWrapper.html(res['html_popup']);
                            self.showModal(self.options.popupWrapper);
                        }
                        self.reloadCustomerData(['wishlist']);
                        _this_fixed.removeClass('loading');
                    },
                    error: function (res) {
                        alert('Error in sending ajax request');
                        _this_fixed.removeClass('loading');
                    }
                });
                $body.trigger('processStop');
            });
        },
    }

    return function (ajaxSuite) {
        $.widget('rokanthemes.ajaxsuite', ajaxSuite, customWishlistAdd);

        return $.rokanthemes.ajaxsuite;
    };
});
