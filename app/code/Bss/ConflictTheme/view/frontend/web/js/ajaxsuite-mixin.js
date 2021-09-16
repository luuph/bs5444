define(
    [
        'jquery',
        'Bss_MultiWishlist/js/bss_wishlist'
    ],
    function ($, multiwishlist) {
        'use strict';

        var modalWidgetMixin = {
            initEventsWishlist: function()
            {
                $.mage.MultiWishlist._EventListener();
                return this._super();
            }
        };

        return function (targetWidget) {
            $.widget('rokanthemes.ajaxsuite', targetWidget, modalWidgetMixin);

            return $.rokanthemes.ajaxsuite;
        };
    });
