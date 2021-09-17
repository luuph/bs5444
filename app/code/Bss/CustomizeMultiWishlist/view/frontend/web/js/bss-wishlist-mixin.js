define(['jquery'], function ($) {
    'use strict';

    const defineModuleEnabled = {
        _create: function () {
            this._super();

            if (this.options.isLoggedIn !== '') {
                $('[data-action="add-to-wishlist"]').attr('multiwishlist', 'enabled');
            }
        },
    }

    return function (bssWishlist) {
        $.widget('mage.MultiWishlist', bssWishlist, defineModuleEnabled);

        return $.mage.MultiWishlist;
    }
});
