define([
    'jquery'
], function ($) {
    'use strict';

    const getOptions = function (optionValues) {
        return {
            responsiveClass: true,
            loop: false,
            rewind: true,
            // margin: 10,
            nav: true,
            responsive: {
                0: {
                    items: 1
                },
                540: {
                    items: 2
                },
                768: {
                    items: 3
                },
                1200: {
                    items: optionValues.items || 5
                }
            },
            dotsSpeed: optionValues.slideSpeed || 500,
            dots: false,
            autoPlay: optionValues.autoPlay || true,
            autoplayHoverPause: true
        }
    };

    const customizeFbt = {
        _init: function () {
            var owl = $('.fbt .product-items');

            if (owl.length) {
                owl.addClass('owl-carousel')
            }

            this._super();
        },

        _createSlide: function () {
            var $widget = this,
                owl = $('.fbt .product-items'),
                carouselOptions = { // option ver cũ
                    items : $widget.options.items,
                    responsive:{
                        0:{
                            items:1,
                            nav:true
                        },
                        479:{
                            items:1,
                            nav:false,
                            loop:true
                        },
                        768:{
                            items:2,
                            nav:false,
                            loop:true
                        },
                        980:{
                            items:3,
                            nav:false,
                            loop:true
                        },
                        1199:{
                            items:$widget.options.items,
                            nav:false,
                            loop:true
                        }
                    },
                    stagePadding: 50,
                    margin:10,
                    singleItem : false,
                    itemsScaleUp : false,
                    paginationSpeed : 800,
                    rewindSpeed : 1000,
                    navigation : true,
                    rewindNav : true,
                    scrollPerPage : false,
                    pagination : false,
                    paginationNumbers: false,
                    slideSpeed : $widget.options.slideSpeed,
                    autoPlay : $widget.options.autoPlay
            };

            owl.owlCarousel(getOptions(this.options));
        },

        reinitcarousel : function(rm,v) {
            var js_array = this.options.js_array,
                owl = $('.fbt .product-items'),
                owlItems;

            if (!rm) {
                // move to tmp DOM
                $('.fbt .product-items .fbt_' + v).appendTo('.slide-n-fbt');
            } else {
                // Copy from tmp DOM to list
                $('.slide-n-fbt .fbt_' + v).appendTo('.fbt .product-items');
            }

            if (!rm) {
                owlItems = $('.fbt .owl-wrapper .owl-item');

                if (owlItems.length === 0) {
                    owlItems = $('.fbt .owl-stage .owl-item')
                }

                owlItems.each(function(){
                    // Remove owl container item
                    if($(this).find('li').length === 0 ) {
                        $(this).remove()
                    }
                });

                owl.find('.owl-wrapper-outer').remove();
                owl.find('.owl-controls').remove();
            }

            if ($('.fbt .owl-item li').length === 0) {
                $('.fbt .owl-stage-outer').remove();
                $('.fbt .owl-nav').remove();
                $('.fbt .owl-dots').remove();
            }

            owl.trigger('destroy.owl.carousel');
            // owl.data('owl.carousel').destroy();
            // owl.owlCarousel('destroy');
            // owl.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
            // owl.find('.owl-stage-outer').children().unwrap();

            // var options = {
            //     // Most important owl features
            //     loop: false,
            //     rewind: true,
            //     responsiveClass:true,
            //     items : $widget.options.items,
            //     responsive:{
            //         0:{
            //             items:1,
            //             nav:true
            //         },
            //         479:{
            //             items:1,
            //             nav:false,
            //             loop:true
            //         },
            //         768:{
            //             items:2,
            //             nav:false,
            //             loop:true
            //         },
            //         980:{
            //             items:3,
            //             nav:false,
            //             loop:true
            //         },
            //         1199:{
            //             items:$widget.options.items,
            //             nav:false,
            //             loop:true
            //         }
            //     },
            //     stagePadding: 50,
            //     margin:10,
            //     itemsCustom : false,
            //     singleItem : false,
            //     itemsScaleUp : false,
            //
            //     //Basic Speeds
            //     // slideSpeed : ,
            //     paginationSpeed : this.options.slideSpeed,
            //     rewindSpeed : 1000,
            //
            //     //Autoplay
            //     autoPlay : this.options.autoPlay,
            //     stopOnHover : true,
            //
            //     // Navigation
            //     navigation : true,
            //     navigationText : ["",""],
            //     rewindNav : true,
            //     scrollPerPage : false,
            //
            //     //Pagination
            //     pagination : false,
            //     paginationNumbers: false
            // };

            this._createSlide();

            if ($('.fbt .owl-item li').length > 1) {
                $.each(js_array,function(index,value){
                    $('.fbt .owl-wrapper').append($('.fbt .owl-item .li'+ value).parent());
                })
            }
        },

        _sendAjax: function (addUrl, data) {
            var $widget = this;
            $.fancybox.showLoading();
            $.fancybox.helpers.overlay.open({parent: 'body'});
            $.ajax({
                type: 'post',
                url: addUrl,
                data: data,
                dataType: 'json',
                success: function (data) {
                    if (data.popup) {
                        $('#bss_fbt_cart_popup').html(data.popup);
                        $('#bss_fbt_cart_popup').trigger('contentUpdated');
                        $.fancybox({
                            href: '#bss_fbt_cart_popup',
                            modal: false,
                            width: '75%',
                            autoSize: false,
                            height: '65%',
                            helpers: {
                                overlay: {
                                    locked: false
                                }
                            },
                            afterClose: function () {
                            }
                        });
                    }else{
                        $.fancybox.hideLoading();
                        $('.fancybox-overlay').hide();
                        return false;
                    }
                },
                error: function () {
                    // window.location.href = '';
                }
            });
        }
    }

    return function (fbt) {
        $.widget('mage.FBT', fbt, customizeFbt)

        return $.mage.FBT;
    }
});
