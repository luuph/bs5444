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
 * @package   Bss_Breadcrumbs
 * @author    Extension Team
 * @copyright Copyright (c) 2017-2019 BSS Commerce Co. ( http://bsscommerce.com )
 * @license   http://bsscommerce.com/Bss-Commerce-License.txt
 */
define([
    'jquery',
    'Magento_Theme/js/model/breadcrumb-list',
    'underscore',
    'mage/template',
    'text!Magento_Theme/templates/breadcrumbs.html',
    'jquery-ui-modules/widget'
], function ($, breadcrumbList, _, mageTemplate, tpl) {
    'use strict';

    return function (widget) {
        $.widget('mage.breadcrumbs', widget, {
            /** @inheritdoc */
            _render: function () {
                this._super();
                var widgetOptions = this.options,
                    self = this;
                if (undefined !== widgetOptions.seo_breadcrumbs) {
                    var configSeo = widgetOptions.seo_breadcrumbs.config,
                        list = widgetOptions.seo_breadcrumbs.list;
                    if (self._checkBreadcrumbsOrNot(configSeo, list)) {
                        // Create breadcrumbs base on the seo suite breadcrumbs
                        // First, get path of name from home to last category
                        var pathNamesDefault = self._getPathNamesDefault();

                        // Next, get path of category conresponse to last cat which we took at step 1
                        var finalPath = [],
                            removeItems = [];
                        _.each(list, function (item) {
                            var pathItemArr = item.path.split('/'),
                                pathNamesSeo = '',
                                priority = 0;
                            pathNamesSeo = self._getPathNames(pathItemArr, list);

                            if (pathNamesSeo === pathNamesDefault) {
                                removeItems = self._getRemoveItemIds(item, pathItemArr);
                            }
                        });

                        // Last, check priority and remove item from breadcrumbs if item have no priority
                        var removeItemNames = self._getRemoveItemNames(removeItems, list);
                        self._prepareBreadcrumbs(removeItemNames);

                        // Recreate breadcrumbs
                        var html,
                            crumbs = breadcrumbList,
                            template = mageTemplate(tpl);

                        this._decorate(crumbs);

                        html = template({
                            'breadcrumbs': crumbs
                        });

                        if (html.length) {
                            $(this.element).html(html);
                        }
                    }
                }

            },
            /**
             * @return {boolean}
             * @private
             */
            _checkDrirectlyVisitProduct: function () {
                // If customer go to product directly by enter product url
                // So, we will force check this case
                if (breadcrumbList.length === 2) {
                    if (undefined !== breadcrumbList[0] &&
                        breadcrumbList[0].name === 'home' &&
                        breadcrumbList[0].first === true &&
                        undefined !== breadcrumbList[1] &&
                        breadcrumbList[1].name === 'product' &&
                        breadcrumbList[1].last === true) {
                        return true;
                    }
                }
                return false;
            },
            /**
             * @param configSeo
             * @param list
             * @return {boolean}
             * @private
             */
            _checkBreadcrumbsOrNot: function (configSeo, list) {
                return configSeo.enabled === "1" &&
                    configSeo.breadcrumbs_type === 'short' &&
                    configSeo.used_priority === "1" &&
                    !this._checkDrirectlyVisitProduct() &&
                    undefined !== list;
            },
            /**
             * @return {string}
             * @private
             */
            _getPathNamesDefault: function () {
                var pathNamesDefault = '';
                _.each(breadcrumbList, function (breadcrumb) {
                    if (breadcrumb.name === "category") {
                        pathNamesDefault = pathNamesDefault + breadcrumb.label + '+';
                    }
                });
                return pathNamesDefault;
            },
            /**
             * @param pathIds
             * @param list
             * @return {string}
             * @private
             */
            _getPathNames: function (pathIds, list) {
                // Get path names by path ids, to compare with default
                var pathNames = '';
                _.each(pathIds, function (pathId) {
                    _.each(list, function (item) {
                        if (item.entity_id === pathId &&
                            item.entity_id !== "1" &&
                            item.entity_id !== "2") { // CHECK PATH NOT INCLUDED ROOT CATE
                            pathNames = pathNames + item.name + '+';
                        }
                    });
                });
                return pathNames;
            },
            /**
             * @param item
             * @param pathItemArr
             * @return {Array}
             * @private
             */
            _getRemoveItemIds: function (item, pathItemArr) {
                var priority = item.priority_id,
                    i = 0,
                    removeItems = [];
                // ex: 1/2/4/12/6/10
                // if prior = 12, them remove items is [6, 10]
                if (priority !== null && !isNaN(parseInt(priority))) {
                    for (; i < pathItemArr.length; i++) {
                        if (priority === pathItemArr[i]) {
                            break;
                        }
                    }
                }
                if (i !== 0) {
                    removeItems = pathItemArr.splice(i + 1);
                }
                return removeItems;
            },
            /**
             * @param removeItems
             * @param list
             * @return {Array}
             * @private
             */
            _getRemoveItemNames: function (removeItems, list) {
                var removeItemNames = [];
                if (removeItems.length) {
                    _.each(list, function (item) {
                        if (removeItems.indexOf(item.entity_id) !== -1) {
                            removeItemNames.push(item.name);
                        }
                    });
                }
                return removeItemNames;
            },
            /**
             * @param removeItemNames
             * @private
             */
            _prepareBreadcrumbs: function (removeItemNames) {
                var clonedBreadcrumblist = breadcrumbList;
                if (removeItemNames.length) {
                    breadcrumbList = [];
                    _.each(clonedBreadcrumblist, function (item) {
                        if (removeItemNames.indexOf(item.label) === -1) {
                            breadcrumbList.push(item);
                        }
                    });
                }
            }
        });

        return $.mage.breadcrumbs;
    };
});
