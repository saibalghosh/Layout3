/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../languageExpertises/ServiceApiModel.d.ts" />

module ViewModels.LanguageExpertises {
    // ================================================================================
    /* 
      */
    // ================================================================================
    export class LanguageExpertise implements Service.ApiModels.LanguageExpertise.IObservableLanguageExpertise {
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        entityId: KnockoutObservableString;     // guid converted to string
    }
}