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
 * @category  BSS
 * @package   Bss_FastOrder
 * @author    Extension Team
 * @copyright Copyright (c) 2017-2020 BSS Commerce Co. ( http://bsscommerce.com )
 * @license   http://bsscommerce.com/Bss-Commerce-License.txt
 */
define(
    [
        "jquery",
        'mage/url',
    ],
    function ($, urlBuilder) {
        $(".nav-sections .mini-fast-order-toggle").remove();
        $(".mini-fast-order").on(
            "click",
            function (e) {
                var miniFastOrderToggle = $(".mini-fast-order-toggle");
                if (miniFastOrderToggle.hasClass("hidden")) {
                    $('body').addClass('b-mini-fastorder');
                    if (miniFastOrderToggle.hasClass("ajax")) {
                        miniFastOrderToggle.removeClass("hidden");
                    } else {
                        $.ajax({
                            url: urlBuilder.build("fastorder/mini/form"),
                            type: "post",
                            dataType: "json",
                            data: {},
                            showLoader: true,
                            success: function (result) {
                                miniFastOrderToggle.html(result);
                                miniFastOrderToggle.trigger('contentUpdated');
                                miniFastOrderToggle.removeClass("hidden");
                                miniFastOrderToggle.addClass("ajax");
                            }
                        });
                    }
                } else if (!miniFastOrderToggle.hasClass("hide")) {
                    miniFastOrderToggle.addClass("hidden");
                    $('body').removeClass('b-mini-fastorder');
                }
                // fix loi hien thi mobile close button
                // $('.header .nav-toggle').trigger('click');
            }
        );
        $(".close-mini-fast-order").on("click", function () {
            $('.mini-fast-order-toggle').addClass("hidden");
            $('body').removeClass('b-mini-fastorder');

        });
        $('.links').addClass('nav-fastorder-toggle');
    }
);
