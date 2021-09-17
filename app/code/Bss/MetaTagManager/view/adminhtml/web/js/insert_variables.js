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
 * @package    Bss_MetaTagManager
 * @author     Extension Team
 * @copyright  Copyright (c) 2018-2019 BSS Commerce Co. ( http://bsscommerce.com )
 * @license    http://bsscommerce.com/Bss-Commerce-License.txt
 */
define([
    'jquery',
    'mage/translate'
], function ($) {
    $.widget('bss.insert_variables', {
        _create: function () {
            let self = this;

            $.fn.extend({
                insertAtCaret: function (myValue) {
                    return this.each(function (i) {
                        if (document.selection) {
                            //For browsers like Internet Explorer
                            this.focus();
                            let sel = document.selection.createRange();
                            sel.text = myValue;
                            this.focus();
                        } else if (this.selectionStart || this.selectionStart === '0') {
                            //For browsers like Firefox and Webkit based
                            let startPos = this.selectionStart;
                            let endPos = this.selectionEnd;
                            let scrollTop = this.scrollTop;
                            this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
                            this.focus();
                            this.selectionStart = startPos + myValue.length;
                            this.selectionEnd = startPos + myValue.length;
                            this.scrollTop = scrollTop;
                        } else {
                            this.value += myValue;
                            this.focus();
                        }
                    })
                }
            });

            let idFrame = null;
            let checkedArray = [];
            $(document).on("click", ".bss-insert-variables", function (ev) {
                idFrame = $(this).parent().parent().find("div.admin__control-wysiwig").children("textarea").attr("name");
                self.openVariablesContainer();
                if ($(this).parent().prev('textarea').length) {
                    $(this).parent().prev().addClass('textarea-active');
                } else if ($(this).parent().prev('.admin__control-wysiwig').length) {
                    $(this).parent().prev('.admin__control-wysiwig').find('textarea').addClass('textarea-active');
                }
            });

            $(document).on("click", ".bss-insert-checked-variables", function (ev) {
                $("input:checkbox[name=attibute-value]:checked").each(function () {
                    checkedArray.push($(this).val());
                });

                //Insert All Checked Value
                $.each(checkedArray, function (index, attributeKey) {
                    let value = attributeKey;
                    let theIdFrame = ".field-" + idFrame;
                    let frameInput = $(theIdFrame);
                    frameInput = frameInput.find("iframe").contents().find('#tinymce');
                    let textIput = frameInput.html();
                    frameInput.html(textIput+'<p>'+value+'</p>');
                    $(".textarea-active").insertAtCaret(value).focus();
                });
                //Reset all checked Value and Close
                $('input:checkbox').removeAttr('checked');
                checkedArray = [];
                self.closeVariablesContainer();
            });

            //Close Button
            $(document).on("click", "#bss-overlay,#bss-close", function (ev) {
                self.closeVariablesContainer();
            });

            //Insert 1 variable by link click
            $(document).on("click", ".variable", function (e) {
                e.preventDefault();
                let value = $(this).data('insert');
                let theIdFrame = ".field-" + idFrame;
                let frameInput = $(theIdFrame);
                frameInput = frameInput.find("iframe").contents().find('#tinymce');
                let textIput = frameInput.html();
                frameInput.html(textIput+'<p>'+value+'</p>');
                $(".textarea-active").insertAtCaret(value).focus();
                self.closeVariablesContainer();
            });
        },
        closeVariablesContainer: function () {
            $(".bss-overlay").hide();
            $(".bss-variables-container").hide("slide",{ direction: "right" },200);
            $(".textarea-active").removeClass("textarea-active");
        },
        openVariablesContainer: function () {
            $(".bss-overlay").show();
            $(".bss-variables-container").show("slide",{ direction: "right" },200);
        }
    });
    return $.bss.insert_variables;
});
