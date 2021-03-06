/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../PagedSearch.ts" />
/// <reference path="../Flasher.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="SearchResult.ts" />

module ViewModels.Users {

    export class Search extends ViewModels.PagedSearch {

        sammy: Sammy.Application = Sammy();
        $historyJson: KnockoutObservableJQuery = ko.observable();
        private _history: KnockoutObservableStringArray = ko.observableArray([]);
        private _historyIndex: number = 0;
        impersonateForm: Element;
        impersonateUserName: KnockoutObservableString = ko.observable();
        flasherProxy = new App.FlasherProxy();

        constructor() {
            super();
            this._init();
        }

        private _init(): void {
            this._setupHistory();
            this._setupSammy();
            this._setupQueryComputed();
            this._setupPagingDefaults();
        }

        private _pullResults(): JQueryDeferred {
            var deferred = $.Deferred();
            var queryParameters = {
                pageSize: this.pageSize(),
                pageNumber: this.pageNumber(),
                keyword: this.throttledKeyword(),
                orderBy: this.orderBy()
            };
            this.spinner.start();
            this.nextForceDisabled(true);
            this.prevForceDisabled(true);
            $.get(App.Routes.WebApi.Identity.Users.get(), queryParameters)
            .done((response: any[], statusText: string, xhr: JQueryXHR): void => {
                deferred.resolve(response, statusText, xhr);
            })
            .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                deferred.reject(xhr, statusText, errorThrown);
            })
            .always((): void => {
                this.spinner.stop();
                this.nextForceDisabled(false);
                this.prevForceDisabled(false);
            });
            return deferred;
        }

        private _loadResults(results: any): void {
            var resultsMapping = {
                items: {
                    key: (data: any): any => {
                        return ko.utils.unwrapObservable(data.id);
                    },
                    create: (options: any): SearchResult => {
                        return new ViewModels.Users.SearchResult(options.data, this);
                    }
                },
                ignore: ['pageSize', 'pageNumber']
            };
            ko.mapping.fromJS(results, resultsMapping, this);
            this.transitionedPageNumber(this.pageNumber());
        }

        private _setupQueryComputed(): void {
            ko.computed((): void => {
                if (this.pageSize() === undefined || this.orderBy() === undefined)
                    return;

                this._pullResults()
                .done((response: any[]): void => {
                    this._loadResults(response);
                })
                .fail((): void => {
                    //alert('failed to get users :(');
                });
            }).extend({ throttle: 250 });
        }

        private _setupSammy(): void {
            var self = this;

            this.sammy.before(/\#\/page\/(.*)/, function () {
                // do not allow route navigation when pagination buttons are forced disabled
                if (self.nextForceDisabled() || self.prevForceDisabled())
                    return false;

                // detect back / forward buttons
                if (self._history().length > 1) {
                    var toPath = this.path;
                    for (var i = 0; i < self._history().length; i++) {
                        var existingPath = self._history()[i];
                        if (toPath === existingPath) {
                            self._historyIndex = i;
                            return true;
                        }
                    }
                }

                self._history.push(this.path);
                self._historyIndex = self._history().length - 1;
                return true;
            });

            this.sammy.get(this.getPageHash(':pageNumber'), function () {
                var pageNumber = this.params['pageNumber'];
                if (pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber()))
                    self.pageNumber(parseInt(pageNumber));
                document.title = 'Users (Page #' + self.pageNumber() + ')';
            });

            // this causes the hash to default to page 1
            this.sammy.get('/users[\/]?', () => {
                this.sammy.setLocation(this.getPageHash(1));
            });
        }

        private _setupHistory(): void {

            this.$historyJson.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length) {
                    var json = newValue.val();
                    if (json) {
                        var js = $.parseJSON(json);
                        ko.mapping.fromJS(js, {}, this._history);
                    }
                }
            });

            this._history.subscribe((newValue: string[]): void => {
                if (this.$historyJson() && this.$historyJson().length) {
                    var currentJson = this.$historyJson().val();
                    var newJson = ko.toJSON(newValue);
                    if (currentJson !== newJson)
                        this.$historyJson().val(newJson);
                }
            });
        }

        private _setupPagingDefaults(): void {
            this.orderBy($('input[type=hidden][data-bind*="value: orderBy"]').val());
            this.pageSize($('input[type=hidden][data-bind*="value: pageSize"]').val());
        }

        nextPage(): void { // sync prev & next buttons with browser forward & back
            this._gotoPage(1);
        }
        prevPage(): void {
            this._gotoPage(-1);
        }
        private _gotoPage(pageDelta: number): void {
            if (pageDelta == 0) return;
            var isEnabled = pageDelta < 0 ? this.prevEnabled() : this.nextEnabled();
            if (isEnabled) {
                var pageNumber = parseInt(this.pageNumber()) + pageDelta;
                if (pageNumber > 0 && pageNumber <= this.pageCount()) {
                    // detect forward or back button
                    if (this._history().length > 1) {
                        var toPath = location.pathname + this.getPageHash(pageNumber);
                        var i = (pageDelta < 0) ? 0 : this._history().length - 1;
                        var iMove = function () {
                            if (pageDelta < 0) i++;
                            else i--;
                        };
                        for (; i < this._history().length && i >= 0; iMove()) {
                            var existingPath = this._history()[i];
                            if (toPath === existingPath) {
                                // fake a forward or back button click
                                var historyDelta = i - this._historyIndex;
                                history.go(historyDelta);
                                this._historyIndex = i;
                                return;
                            }
                        }
                    }
                    this.pageNumber(pageNumber);
                    var pagePath = this.getPageHash(pageNumber);
                    if (this.sammy.getLocation() !== pagePath)
                        this.sammy.setLocation(pagePath);
                }
            }
        }
    }
}