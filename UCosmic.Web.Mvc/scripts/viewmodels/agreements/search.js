var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Agreements;
(function (Agreements) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/PagedSearch.ts" />
    /// <reference path="../../app/SideSwiper.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../places/ApiModels.d.ts" />
    /// <reference path="SearchResult.ts" />
    /// <reference path="ApiModels.d.ts" />
    (function (ViewModels) {
        var Search = (function (_super) {
            __extends(Search, _super);
            function Search(initDefaultPageRoute) {
                if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
                var _this = this;
                _super.call(this);
                this.initDefaultPageRoute = initDefaultPageRoute;
                this.header = ko.observable();
                // sammy & URL hashing
                this.sammy = Sammy();
                this.sammyBeforeRoute = /\#\/page\/(.*)\//;
                this.sammyGetPageRoute = '#/page/:pageNumber/';
                this.sammyDefaultPageRoute = '/agreements[\/]?';
                // filtering
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
                // lensing
                this.lenses = ko.observableArray([
                    { text: 'Table', value: 'table' },
                    { text: 'List', value: 'list' }
                ]);
                this.lens = ko.observable();
                // items page
                this.$itemsPage = undefined;
                this.sideSwiper = new App.SideSwiper({
                    frameWidth: 710,
                    speed: 'fast',
                    root: '#search'
                });
                this.trail = ko.observableArray([]);
                // results
                this.resultsMapping = {
                    'items': {
                        key: function (data) {
                            return ko.utils.unwrapObservable(data.id);
                        },
                        create: function (options) {
                            return new ViewModels.SearchResult(options.data, options.parent);
                        }
                    },
                    ignore: ['pageSize', 'pageNumber']
                };

                this.requestResults = this.requestResults.bind(this);

                this._setupCountryDropDown();
                this._setupPagingSubscriptions();
                this._setupLensing();
                this._setupSammy();
                this._setupPagingDefaults();
                this.changeLens(this.lenses()[0]);
                ko.computed(function () {
                    _this.requestResults();
                }).extend({ throttle: 1 });
            }
            // countries dropdown
            Search.prototype._setupCountryDropDown = function () {
                var _this = this;
                ko.computed(function () {
                    // populate countryCode based on last value when paging backwards
                    var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        // setup empty value
                        var emptyValue = {
                            code: '-1',
                            name: '[Without country]'
                        };
                        response.splice(response.length, 0, emptyValue);

                        _this.countries(response);

                        if (lastCountryCode && lastCountryCode !== _this.countryCode())
                            _this.countryCode(lastCountryCode);
                    });
                }).extend({ throttle: 1 });
            };

            // paging subscriptions
            Search.prototype._setupPagingSubscriptions = function () {
                var _this = this;
                // whenever pageNumber changes, set the location for sammy
                this.pageNumber.subscribe(function (newValue) {
                    _this.setLocation();
                });
            };

            // lensing
            Search.prototype._setupLensing = function () {
                var _this = this;
                this.changeLens = function (lens) {
                    _this.lens(lens.value);
                };
            };

            Search.prototype._setupSammy = function () {
                var self = this;
                self.sammy.before(self.sammyBeforeRoute, function () {
                    self.beforePage(this);
                });

                self.sammy.get(self.sammyGetPageRoute, function () {
                    self.getPage(this);
                });

                if (self.initDefaultPageRoute) {
                    // match /establishments or /establishments/
                    self.sammy.get(self.sammyDefaultPageRoute, function () {
                        self.initPageHash(this);
                    });
                }
            };

            Search.prototype.getPage = function (sammyContext) {
                var _this = this;
                var trail = this.trail(), clone;
                if (trail.length > 0 && trail[trail.length - 1] === sammyContext.path)
                    return;
                if (trail.length > 1 && trail[trail.length - 2] === sammyContext.path) {
                    // swipe backward
                    trail.pop();
                    this.swipeCallback = function () {
                        clone = _this.$itemsPage.clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.appendTo(_this.$itemsPage.parent());
                        _this.$itemsPage.attr('data-side-swiper', 'off').hide();
                        _this.lockAnimation();
                        $(window).scrollTop(0);
                        _this.sideSwiper.prev(1, function () {
                            _this.$itemsPage.siblings().remove();
                            _this.unlockAnimation();
                        });
                    };
                    return;
                } else if (trail.length > 0) {
                    // swipe forward
                    this.swipeCallback = function () {
                        clone = _this.$itemsPage.clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.insertBefore(_this.$itemsPage);
                        _this.$itemsPage.attr('data-side-swiper', 'off').hide();
                        _this.lockAnimation();
                        $(window).scrollTop(0);
                        _this.sideSwiper.next(1, function () {
                            _this.unlockAnimation();
                        });
                    };
                }
                trail.push(sammyContext.path);
            };

            Search.prototype.beforePage = function (sammyContext) {
                if (this.nextForceDisabled() || this.prevForceDisabled())
                    return false;

                var pageNumber = sammyContext.params['pageNumber'];

                if (pageNumber && parseInt(pageNumber) !== Number(this.pageNumber()))
                    this.pageNumber(parseInt(pageNumber));
                return true;
            };

            Search.prototype.initPageHash = function (sammyContext) {
                sammyContext.app.setLocation('#/page/1/');
            };

            Search.prototype.setLocation = function () {
                var location = '#/page/' + this.pageNumber() + '/';
                if (this.sammy.getLocation() !== location)
                    this.sammy.setLocation(location);
            };

            Search.prototype.lockAnimation = function () {
                this.nextForceDisabled(true);
                this.prevForceDisabled(true);
            };
            Search.prototype.unlockAnimation = function () {
                this.nextForceDisabled(false);
                this.prevForceDisabled(false);
            };

            Search.prototype.swipeCallback = function () {
            };
            Search.prototype.receiveResults = function (js) {
                if (!js) {
                    ko.mapping.fromJS({
                        items: [],
                        itemTotal: 0
                    }, this.resultsMapping, this);
                } else {
                    ko.mapping.fromJS(js, this.resultsMapping, this);
                }
                App.WindowScroller.restoreTop();
                this.spinner.stop();
                this.swipeCallback();
                this.transitionedPageNumber(this.pageNumber());
            };

            Search.prototype.requestResults = function () {
                var _this = this;
                if (this.pageSize() === undefined || this.orderBy() === undefined)
                    return;
                this.spinner.start();

                $.get(App.Routes.WebApi.Establishments.get(), {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    countryCode: this.countryCode(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                }).done(function (response) {
                    _this.receiveResults(response);
                });
            };

            // go to add new
            Search.prototype.gotoAddNew = function () {
                return true;
            };

            // click item
            // TODO: is this still needed?
            Search.prototype.clickAction = function (viewModel, e) {
                //var href, $target = $(e.target);
                //while ($target.length && !$target.attr('href') && !$target.attr('data-href')) {
                //    $target = $target.parent();
                //}
                //if ($target.length) {
                //    href = $target.attr('href') || $target.attr('data-href');
                //    location.href = href.replace('/0/', '/' + viewModel.id() + '/');
                //}
                return true;
            };

            Search.prototype.detailHref = function (id) {
                return App.Routes.Mvc.Establishments.show(id);
            };

            Search.prototype.detailTooltip = function () {
                return 'View & edit this agreement\'s details';
            };

            Search.prototype._setupPagingDefaults = function () {
                this.orderBy('country');
                this.pageSize(10);
            };
            return Search;
        })(App.PagedSearch);
        ViewModels.Search = Search;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));