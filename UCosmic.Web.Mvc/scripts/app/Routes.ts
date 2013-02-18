module App.Routes {

    export var applicationPath: string = '/';

    function hasTrailingSlash(value: string): bool {
        return value.lastIndexOf('/') == value.length - 1;
    }

    export module WebApi {

        export var urlPrefix: string = 'api';

        function makeUrl(relativeUrl: string): string {
            var apiPrefix: string = WebApi.urlPrefix;
            if (!hasTrailingSlash(apiPrefix)) apiPrefix = apiPrefix + '/';
            var url = Routes.applicationPath + apiPrefix + relativeUrl;
            if (!hasTrailingSlash(url)) url = url + '/';
            return url;
        }

        export module Identity {

            export function signIn(): string {
                return makeUrl('sign-in');
            }

            export function signOut(): string {
                return makeUrl('sign-out');
            }
        }

        export module Languages {

            export function get (): string {
                return makeUrl('languages');
            }
        }

        export module Countries {

            export function get (): string {
                return makeUrl('countries');
            }
        }

        export module Places {

            export interface IFilterPlaces {
                parentId?: number;
                isContinent?: bool;
                isCountry?: bool;
                isAdmin1?: bool;
                isAdmin2?: bool;
                isAdmin3?: bool;
            }

            export function get (args: IFilterPlaces): string;

            export function get (latitude: number, longitude: number): string;

            export function get (arg1: any, arg2?: number): string {
                if (!arg2 || typeof arg2 !== 'number')
                    return getByFilterArgs(arg1);
                else
                    return getByLatLng(arg1, arg2);
            }

            function getByFilterArgs(args: IFilterPlaces): string {
                var url = makeUrl('places');
                url = url.substr(0, url.length - 1); // strip trailing slash
                url += '?';
                if (args.parentId) url += 'parentId=' + args.parentId + '&';
                if (args.isContinent) url += 'isContinent=' + args.isContinent + '&';
                if (args.isCountry) url += 'isCountry=' + args.isCountry + '&';
                if (args.isAdmin1) url += 'isAdmin1=' + args.isAdmin1 + '&';
                if (args.isAdmin2) url += 'isAdmin2=' + args.isAdmin2 + '&';
                if (args.isAdmin3) url += 'isAdmin3=' + args.isAdmin3 + '&';
                if (url.lastIndexOf('&') === url.length - 1) // strip trailing amphersand
                    url = url.substr(0, url.length - 1);
                return url;
            }

            function getByLatLng(latitude: number, longitude: number): string {
                var url = 'places/by-coordinates/' + latitude + '/' + longitude;
                return makeUrl(url);
            }
        }

        export module Establishments {

            export function get (establishmentId?: number): string {
                var url = 'establishments';
                if (establishmentId)
                    url += '/' + establishmentId;
                return makeUrl(url);
            }

            export function post (): string {
                return makeUrl('establishments');
            }

            export class Names {

                static get (establishmentId: number, establishmentNameId?: number): string {
                    var url = 'establishments/' + establishmentId + '/names';
                    if (establishmentNameId)
                        url += '/' + establishmentNameId;
                    return makeUrl(url);
                }

                static post(establishmentId: number): string {
                    return Names.get(establishmentId);
                }

                static put(establishmentId: number, establishmentNameId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/names/'
                        + establishmentNameId);
                }

                static del(establishmentId: number, establishmentNameId: number): string {
                    return Names.put(establishmentId, establishmentNameId);
                }

                static validateText(establishmentId: number, establishmentNameId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/names/'
                        + establishmentNameId + '/validate-text');
                }
            }

            export class Urls {

                static get (establishmentId: number, establishmentUrlId?: number): string {
                    var url = 'establishments/' + establishmentId + '/urls';
                    if (establishmentUrlId)
                        url += '/' + establishmentUrlId;
                    return makeUrl(url);
                }

                static post(establishmentId: number): string {
                    return Urls.get(establishmentId);
                }

                static put(establishmentId: number, establishmentUrlId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/urls/'
                        + establishmentUrlId);
                }

                static del(establishmentId: number, establishmentUrlId: number): string {
                    return Urls.put(establishmentId, establishmentUrlId);
                }

                static validateValue(establishmentId: number, establishmentUrlId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/urls/'
                        + establishmentUrlId + '/validate-value');
                }
            }

            export class Locations {

                static get (establishmentId: number): string {
                    var url = 'establishments/' + establishmentId + '/location';
                    return makeUrl(url);
                }

                static put (establishmentId: number): string {
                    return get(establishmentId);
                }
            }

        }

        export module My {
            export module Profile {
                export function get (): string {
                    return makeUrl('my/profile');
                }
                export function put(): string {
                    return get();
                }
                export module Photo {
                    export function get (maxSide?: number, imageResizeQuality?: string,
                        refresh?: bool): string;

                    export function get (maxWidth?: number, maxHeight?: number,
                        imageResizeQuality?: string, refresh?: bool): string;

                    export function get(arg1?: number, arg2?: any, arg3?: any, arg4?: any): string {
                        if (arguments.length === 4
                            || (arguments.length >= 2 && typeof arguments[1] === 'number')
                            || (arguments.length >= 3 && typeof arguments[2] === 'string')
                        ) {
                            return getByMaxSides(arg1, arg2, arg3, arg4);
                        }
                        return getByMaxSide(arg1, arg2, arg3);
                    }

                    function getByMaxSide(maxSide?: number, imageResizeQuality?: string,
                        refresh?: bool): string {
                        var url = initializeGetUrl();
                        if (maxSide) url += 'maxSide=' + maxSide + '&';
                        url = finalizeGetUrl(url, imageResizeQuality, refresh);
                        return url;
                    }

                    function getByMaxSides(maxWidth?: number, maxHeight?: number,
                        imageResizeQuality?: string, refresh?: bool): string {
                        var url = initializeGetUrl();
                        if (maxWidth) url += 'maxWidth=' + maxWidth + '&';
                        if (maxHeight) url += 'maxHeight=' + maxHeight + '&';
                        url = finalizeGetUrl(url, imageResizeQuality, refresh);
                        return url;
                    }

                    function initializeGetUrl(): string {
                        var url = makeUrl('my/profile/photo');
                        url += '?';
                        return url;
                    }

                    function finalizeGetUrl(url: string, imageResizeQuality?: string, refresh?: bool): string {
                        if (imageResizeQuality) url += 'quality=' + imageResizeQuality + '&';
                        if (refresh) url += 'refresh=' + new Date().toUTCString() + '&';
                        if (url.lastIndexOf('&') === url.length - 1) // strip trailing amphersand
                            url = url.substr(0, url.length - 1);
                        if (url.lastIndexOf('?') === url.length - 1) // strip trailing question mark
                            url = url.substr(0, url.length - 1);
                        return url;
                    }

                    export function post() {
                        return makeUrl('my/profile/photo');
                    }
                    export function del() {
                        return post();
                    }
                    export function kendoRemove() {
                        return makeUrl('my/profile/photo/kendo-remove');
                    }
                }
            }
        }

        export module People {
            export module Names {
                export class Salutations {
                    static get (): string {
                        return makeUrl('person-names/salutations');
                    }
                }
                export class Suffixes {
                    static get (): string {
                        return makeUrl('person-names/suffixes');
                    }
                }
                export class DeriveDisplayName {
                    static get (): string {
                        return makeUrl('person-names/derive-display-name');
                    }
                }
            }
        }

        export module Employees {
            export module ModuleSettings {
                export class FacultyRanks {
                    static get (): string {
                        return makeUrl('my/employee-module-settings/faculty-ranks');
                    }
                }
            }
        }
    }

    export module Mvc {

        function makeUrl(relativeUrl: string): string {
            var url = Routes.applicationPath + relativeUrl;
            if (!hasTrailingSlash(url)) url = url + '/';
            return url;
        }

        export module Establishments {
            export function show (establishmentId: number) {
                return makeUrl('establishments/' + establishmentId);
            }
            export function created (location: string) {
                var url = makeUrl('establishments/created');
                url += '?location=' + location;
                return url;
            }
        }
    }

    export module Params {
        export class ImageResizeQuality {
            static THUMBNAIL: string = 'thumbnail';
            static HIGH: string = 'high';
        }
    }
}


