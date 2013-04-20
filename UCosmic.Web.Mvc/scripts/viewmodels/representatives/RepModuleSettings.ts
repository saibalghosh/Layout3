/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../sammy/sammy-0.7.1.js" />
/// <reference path="../../app/SideSwiper.js" />

module ViewModels.RepModuleSettings {

    export class RepModuleSettings {

        constructor(public welcomeMessage:string, public emailMessage:string){
        }
    }

    function RepModuleSettings(){
        var self = this;

        self.isBound = ko.observable();

        self.back = function () {
            history.back();
        };
    }
}