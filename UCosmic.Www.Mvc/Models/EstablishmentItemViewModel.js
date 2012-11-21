﻿/// <reference path="../scripts/jquery-1.8.0.js" />
/// <reference path="../scripts/knockout-2.1.0.js" />
/// <reference path="../scripts/knockout.mapping-latest.js" />
/// <reference path="../scripts/knockout.validation.debug.js" />
/// <reference path="../scripts/app/app.js" />
/// <reference path="../scripts/app/routes.js" />

ko.validation.rules['uniqueEstablishmentName'] = {
    async: true,
    validator: function (val, vm, callback) {
        if (!vm.isValidatableAsync) {
            callback(true);
        }
        else {
            $.ajax({
                url: '/api/establishments/' + vm.ownerId() + '/names/' + vm.id() + '/validate-text',
                type: 'POST',
                data: vm.serializeData()
            })
            .success(function () {
                callback(true);
            })
            .error(function (xhr) {
                callback({ isValid: false, message: xhr.responseText });
            });
        }
    },
    message: 'error'
};
ko.validation.registerExtenders();

function EstablishmentNameViewModel(js, $parent) {
    var self = this;
    if (!js)
        js = {
            id: 0,
            ownerId: $parent.id,
            text: '',
            isOfficialName: false,
            isFormerName: false,
            languageCode: '',
            languageName: ''
        };
    self.originalValues = js; // hold onto original values so they can be reset on cancel
    ko.mapping.fromJS(js, {}, self); // map api properties to observables

    self.isValidatableAsync = false;
    self.text.subscribe(function (newValue) {
        self.isValidatableAsync = newValue !== self.originalValues.text;
    });

    // validate text property
    self.text.extend({
        required: {
            message: 'Establishment name is required.'
        },
        maxLength: 400,
        uniqueEstablishmentName: self
    });

    var isValidatingAsync = 0;
    self.text.isValidating.subscribe(function (isValidating) {
        if (isValidating) {
            self.isSpinningSaveValidator(true);
            isValidatingAsync++;
        }
        else {
            isValidatingAsync--;
            if (isValidatingAsync < 1) {
                self.isSpinningSaveValidator(false);
                if (self.saveEditorClicked) self.saveEditor();
            }
        }
    });

    self.textElement = undefined; // bind to this so we can focus it on actions
    self.languagesElement = undefined; // bind to this so we can restore on back button
    self.selectedLanguageCode = ko.observable(js.languageCode); // shadow to restore after list items are bound
    $parent.languages.subscribe(function () { // select correct option after options are loaded
        self.selectedLanguageCode(self.languageCode()); // shadow property is bound to dropdown list
    });

    self.isOfficialName.subscribe(function (newValue) { // official name cannot be former name
        if (newValue) self.isFormerName(false);
    });

    self.isSpinningSaveValidator = ko.observable(false);
    self.isSpinningSave = ko.observable(false); // when save button is clicked
    self.editMode = ko.observable(); // shows either form or read-only view
    self.showEditor = function () { // click to hide viewer and show editor
        var editingName = $parent.editingName(); // disallow if another name is being edited
        if (!editingName) {
            $parent.editingName(self.id() || -1); // tell parent which item is being edited
            self.editMode(true); // show the form / hide the viewer
            $(self.textElement).trigger('autosize');
            $(self.textElement).focus(); // focus the text box
        }
    };
    self.saveEditorClicked = false;
    self.saveEditor = function () {
        self.saveEditorClicked = true;
        if (!self.isValid()) { // validate
            self.errors.showAllMessages();
            self.saveEditorClicked = false;
        }
        else if (isValidatingAsync < 1) { // hit server
            self.isSpinningSave(true); // start save spinner
            self.saveEditorClicked = false;

            if (self.id()) {
                $.ajax({ // submit ajax PUT request
                    url: '/api/establishments/' + $parent.id + '/names/' + self.id(), // TODO: put this in stronger URL helper
                    type: 'PUT',
                    data: self.serializeData()
                })
                .success(mutationSuccess).error(mutationError);
            }
            else if ($parent.id) {
                $.ajax({ // submit ajax POST request
                    url: '/api/establishments/' + $parent.id + '/names', // TODO: put this in stronger URL helper
                    type: 'POST',
                    data: self.serializeData()
                })
                .success(mutationSuccess).error(mutationError);
            }
        }
    };

    self.cancelEditor = function () { // decide not to edit this item
        $parent.editingName(undefined); // tell parent no item is being edited anymore
        if (self.id()) {
            ko.mapping.fromJS(self.originalValues, {}, self); // restore original values
            self.editMode(false); // hide the form, show the view
        }
        else {
            $parent.names.shift();
        }
    };

    self.clickOfficialNameCheckbox = function () { // TODO educate users on how to change the official name
        if (self.originalValues.isOfficialName) { // only when the name is already official in the db
            $($parent.genericAlertDialog).find('p.content')
                .html('In order to choose a different official name for this establishment, edit the name you wish to make the new official name.');
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
        }
        return true;
    };

    self.isSpinningPurge = ko.observable(false);
    self.confirmPurgeName = undefined;
    self.purge = function (vm, e) {
        e.stopPropagation();
        if ($parent.editingName()) return;
        if (self.isOfficialName()) {
            $($parent.genericAlertDialog).find('p.content')
                .html('You cannot delete an establishment\'s official name.<br />To delete this name, first assign another name as official.');
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
            return;
        }
        self.isSpinningPurge(true);
        var shouldRemainSpinning = false;
        $(self.confirmPurgeDialog).dialog({
            dialogClass: 'jquery-ui',
            width: 'auto',
            resizable: false,
            modal: true,
            close: function () {
                if (!shouldRemainSpinning) self.isSpinningPurge(false);
            },
            buttons: [
                {
                    text: 'Yes, confirm delete',
                    click: function () {
                        shouldRemainSpinning = true;
                        $(self.confirmPurgeDialog).dialog('close');
                        $.ajax({ // submit ajax DELETE request
                            url: '/api/establishments/ ' + $parent.id + '/names/' + self.id(), // TODO: put this in stronger URL helper
                            type: 'DELETE'
                        })
                        .success(mutationSuccess)
                        .error(mutationError);
                    }
                },
                {
                    text: 'No, cancel delete',
                    click: function () {
                        $(self.confirmPurgeDialog).dialog('close');
                        self.isSpinningPurge(false);
                    },
                    'data-css-link': true
                }
            ]
        });
    };

    self.serializeData = function () {
        return {
            id: self.id(),
            ownerId: self.ownerId(),
            text: $.trim(self.text()),
            isOfficialName: self.isOfficialName(),
            isFormerName: self.isFormerName(),
            languageCode: self.selectedLanguageCode(),
        };
    };
    var mutationError = function (xhr) {
        if (xhr.status === 400) { // validation message will be in xhr response text...
            $($parent.genericAlertDialog).find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
        }
        self.isSpinningSave(false); // stop save spinner TODO: what if server throws non-validation exception?
        self.isSpinningPurge(false);
    };
    var mutationSuccess = function () {
        $parent.requestNames(function () { // when parent receives response,
            $parent.editingName(undefined); // tell parent no item is being edited anymore
            self.editMode(false); // hide the form, show the view
            self.isSpinningSave(false); // stop save spinner
            self.isSpinningPurge(false);
        });
    };

    ko.validation.group(self); // create a separate validation group for this item
}

function EstablishmentItemViewModel(id) {
    var self = this;

    self.id = id || 0; // initialize the aggregate id
    self.genericAlertDialog = undefined;

    // languages dropdowns
    self.languages = ko.observableArray(); // select options
    ko.computed(function () { // get languages from the server
        $.get(app.webApiRoutes.Languages.Get())
        .success(function (response) {
            response.splice(0, 0, { code: undefined, name: '[Language Neutral]' }); // add null option
            self.languages(response); // set the options dropdown
        });
    })
    .extend({ throttle: 1 });

    self.isSpinningNames = ko.observable(true);
    self.names = ko.observableArray();
    self.editingName = ko.observable();
    self.namesMapping = {
        create: function (options) {
            return new EstablishmentNameViewModel(options.data, self);
        }
    };
    self.receiveNames = function (js) {
        ko.mapping.fromJS(js || [], self.namesMapping, self.names);
        self.isSpinningNames(false);
        app.obtrude(document);
    };
    self.requestNames = function (callback) {
        self.isSpinningNames(true);
        $.get('/api/establishments/' + self.id + '/names', {})
        .success(function (response) {
            self.receiveNames(response);
            if (callback) callback(response);
        });
    };
    self.addName = function () {
        var newName = new EstablishmentNameViewModel(null, self);
        self.names.unshift(newName);
        newName.showEditor();
        app.obtrude(document);
    };

    ko.computed(self.requestNames).extend({ throttle: 1 });
}