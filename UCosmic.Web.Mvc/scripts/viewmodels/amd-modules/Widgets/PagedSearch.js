/// <reference path="../../../lib-ext.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/knockout/knockout.d.ts" />
define(["require", "exports", './Spinner'], function(require, exports, __Spinner__) {
    var Spinner = __Spinner__;
    var PagedSearch = (function () {
        function PagedSearch() {
            var _this = this;
            // paging observables
            this.pageSize = ko.observable();
            this.pageNumber = ko.observable();
            this.transitionedPageNumber = ko.observable();
            this.itemTotal = ko.observable();
            this.nextForceDisabled = ko.observable(false);
            this.prevForceDisabled = ko.observable(false);
            // results
            this.items = ko.observableArray();
            // filtering
            this.orderBy = ko.observable();
            this.keyword = ko.observable($('input[type=hidden][data-bind="value: keyword"]').val());
            // spinner component
            this.spinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400, true));
            // paging computeds
            this.pageCount = ko.computed(function () {
                return Math.ceil(_this.itemTotal() / _this.pageSize());
            });
            this.pageIndex = ko.computed(function () {
                return parseInt(_this.transitionedPageNumber()) - 1;
            });
            this.firstIndex = ko.computed(function () {
                return _this.pageIndex() * _this.pageSize();
            });
            this.firstNumber = ko.computed(function () {
                return _this.firstIndex() + 1;
            });
            this.lastNumber = ko.computed(function () {
                if (!_this.items)
                    return 0;
                return _this.firstIndex() + _this.items().length;
            });
            this.lastIndex = ko.computed(function () {
                return _this.lastNumber() - 1;
            });
            this.nextEnabled = ko.computed(function () {
                return _this.pageNumber() < _this.pageCount() && !_this.nextForceDisabled();
            });
            this.prevEnabled = ko.computed(function () {
                return _this.pageNumber() > 1 && !_this.prevForceDisabled();
            });

            // paging subscriptions
            this.pageCount.subscribe(function (newValue) {
                if (_this.pageNumber() && _this.pageNumber() > newValue)
                    _this.pageNumber(1);
            });

            // result computeds
            this.hasItems = ko.computed(function () {
                return _this.items() && _this.items().length > 0;
            });
            this.hasManyItems = ko.computed(function () {
                return _this.lastNumber() > _this.firstNumber();
            });
            this.hasNoItems = ko.computed(function () {
                return !_this.spinner.isVisible() && !_this.hasItems();
            });
            this.hasManyPages = ko.computed(function () {
                return _this.pageCount() > 1;
            });
            this.showStatus = ko.computed(function () {
                return _this.hasItems() && !_this.spinner.isVisible();
            });

            // filtering computeds
            this.throttledKeyword = ko.computed(this.keyword).extend({ throttle: 400 });
        }
        // paging methods
        PagedSearch.prototype.nextPage = function () {
            if (this.nextEnabled()) {
                var pageNumber = parseInt(this.pageNumber()) + 1;
                this.pageNumber(pageNumber);
            }
        };
        PagedSearch.prototype.prevPage = function () {
            if (this.prevEnabled())
                history.back();
        };
        PagedSearch.prototype.getPageHash = function (pageNumber) {
            return '#/page/{0}/'.replace('{0}', pageNumber);
        };
        return PagedSearch;
    })();
    exports.PagedSearch = PagedSearch;
});
