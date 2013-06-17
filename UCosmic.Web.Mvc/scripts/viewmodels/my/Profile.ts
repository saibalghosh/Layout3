/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Flasher.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="../employees/ServerApiModel.d.ts" />
/// <reference path="../activities/Activities.ts" />
/// <reference path="../geographicExpertises/GeographicExpertises.ts" />
/// <reference path="../languageExpertises/LanguageExpertises.ts" />
/// <reference path="../degrees/Degrees.ts" />
/// <reference path="../affiliations/Affiliations.ts" />

module ViewModels.My {

    class Affiliation {
        establishmentId: KnockoutObservableNumber = ko.observable();
        establishment: KnockoutObservableString = ko.observable();
        jobTitles: KnockoutObservableNumber = ko.observable();
        isDefault: KnockoutObservableBool = ko.observable(false);
        isPrimary: KnockoutObservableBool = ko.observable(false);
        isAcknowledged: KnockoutObservableBool = ko.observable(false);
        isClaimingStudent: KnockoutObservableBool = ko.observable(false);
        isClaimingEmployee: KnockoutObservableBool = ko.observable(false);
        isClaimingInternationalOffice: KnockoutObservableBool = ko.observable(false);
        isClaimingAdministrator: KnockoutObservableBool = ko.observable(false);
        isClaimingFaculty: KnockoutObservableBool = ko.observable(false);
        isClaimingStaff: KnockoutObservableBool = ko.observable(false);
        campusId: KnockoutObservableAny = ko.observable();     // nullable
        campus: KnockoutObservableString = ko.observable();
        collegeId: KnockoutObservableAny = ko.observable();     // nullable
        college: KnockoutObservableString = ko.observable();
        departmentId: KnockoutObservableAny = ko.observable();  // nullable
        department: KnockoutObservableString = ko.observable();
        facultyRankId: KnockoutObservableAny = ko.observable(); // nullable
        facultyRank: KnockoutObservableString = ko.observable();
    }

    export class Profile implements KnockoutValidationGroup {

        private _sammy: Sammy.Application = Sammy();
        //private _isInitialized: bool = false;
        private _originalValues: IServerProfileApiModel;
        private _activitiesViewModel: ViewModels.Activities.ActivityList = null;
        private _geographicExpertisesViewModel: ViewModels.GeographicExpertises.GeographicExpertiseList = null;
        private _languageExpertisesViewModel: ViewModels.LanguageExpertises.LanguageExpertiseList = null;
        private _degreesViewModel: ViewModels.Degrees.DegreeList = null;
        private _affiliationsViewModel: ViewModels.Affiliations.AffiliationList = null;

        hasPhoto: KnockoutObservableBool = ko.observable();
        isPhotoExtensionInvalid: KnockoutObservableBool = ko.observable(false);
        isPhotoTooManyBytes: KnockoutObservableBool = ko.observable(false);
        isPhotoFailureUnexpected: KnockoutObservableBool = ko.observable(false);
        photoFileExtension: KnockoutObservableString = ko.observable();
        photoFileName: KnockoutObservableString = ko.observable();
        photoSrc: KnockoutObservableString = ko.observable(
            App.Routes.WebApi.My.Profile.Photo.get({ maxSide: 128 }));
        photoUploadSpinner = new Spinner(new SpinnerOptions(400));
        photoDeleteSpinner = new Spinner(new SpinnerOptions(400));

        isDisplayNameDerived: KnockoutObservableBool = ko.observable();
        displayName: KnockoutObservableString = ko.observable();
        private _userDisplayName: string = '';

        personId: number = 0;

        salutation: KnockoutObservableString = ko.observable();
        firstName: KnockoutObservableString = ko.observable();
        middleName: KnockoutObservableString = ko.observable();
        lastName: KnockoutObservableString = ko.observable();
        suffix: KnockoutObservableString = ko.observable();

        isFacultyRankEditable: () => bool;
        isFacultyRankVisible: () => bool;
        facultyRankText: () => string;
        facultyRanks: KnockoutObservableFacultyRankModelArray = ko.observableArray();
        facultyRankId: KnockoutObservableNumber = ko.observable();
        preferredTitle: KnockoutObservableString = ko.observable();
        affiliations: any[];

        gender: KnockoutObservableString = ko.observable();
        isActive: KnockoutObservableBool = ko.observable();
        genderText: () => string;
        isActiveText: () => string;

        $photo: KnockoutObservableJQuery = ko.observable();
        $facultyRanks: KnockoutObservableJQuery = ko.observable();
        $nameSalutation: KnockoutObservableJQuery = ko.observable();
        $nameSuffix: KnockoutObservableJQuery = ko.observable();
        $editSection: JQuery;
        $confirmPurgeDialog: JQuery;

        isValid: () => bool;
        errors: KnockoutValidationErrors;
        editMode: KnockoutObservableBool = ko.observable(false);
        saveSpinner = new Spinner(new SpinnerOptions(200));

        private _initialize() {
        }

        constructor() {
            this._initialize();

            //this._setupRouting();
            //this._setupValidation();
            //this._setupKendoWidgets();
            //this._setupDisplayNameDerivation();
            //this._setupCardComputeds();

            //this._sammy.run('#/activities');
        }

        load(startTab: string): JQueryPromise {
            var deferred: JQueryDeferred = $.Deferred();

            // start both requests at the same time
            var facultyRanksPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.FacultyRanks.get())
                .done((data: Employees.IServerFacultyRankApiModel[], textStatus: string, jqXHR: JQueryXHR): void => {
                    facultyRanksPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    facultyRanksPact.reject(jqXHR, textStatus, errorThrown);
                });

            var viewModelPact = $.Deferred();
            $.get(App.Routes.WebApi.My.Profile.get())
                .done((data: IServerProfileApiModel, textStatus: string, jqXHR: JQueryXHR): void => {
                    viewModelPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });

            // only process after both requests have been resolved
            $.when(facultyRanksPact, viewModelPact)
                //.then(
                .done(
                (facultyRanks: Employees.IServerFacultyRankApiModel[], viewModel: IServerProfileApiModel): void => {

                    this.facultyRanks(facultyRanks); // populate the faculty ranks menu

                    ko.mapping.fromJS(viewModel, { ignore: "personId" }, this); // populate the scalars
                    this.personId = viewModel.personId;

                    this._originalValues = viewModel;

                    //if (!this._isInitialized) {
                    //    $(this).trigger('ready'); // ready to apply bindings
                    //    this._isInitialized = true; // bindings have been applied
                    //    this.$facultyRanks().kendoDropDownList(); // kendoui dropdown for faculty ranks
                    //}

                    
                    this._setupValidation();
                    this._setupKendoWidgets();
                    this._setupDisplayNameDerivation();
                    this._setupCardComputeds();

                    if ( startTab === "" ) {
                        this._setupRouting();
                        this._sammy.run("#/activities");
                    }
                    else {
                        var url = location.href;
                        var index = url.lastIndexOf( "?" );
                        if ( index != -1 ) {
                            this._startTab( startTab );
                            this._setupRouting();
                        } else {
                            this._setupRouting();
                            this._sammy.run("#/" + startTab);
                        }
                    }

                    deferred.resolve();
                })
                //,
                // one of the responses failed (never called more than once, even on multifailures)
                //(xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                //    //alert('a GET API call failed :(');
                //});
                .fail( ( xhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    deferred.reject( xhr, textStatus, errorThrown );
                } );

            return deferred;
        }

        private _startTab(tabName: string): void {
            var viewModel: any;
            var tabStrip = $("#tabstrip").data("kendoTabStrip");

            if ( tabName === "activities" ) {
                if ( this._activitiesViewModel == null ) {
                    this._activitiesViewModel = new ViewModels.Activities.ActivityList( this.personId );
                    this._activitiesViewModel.load()
                        .done( (): void => {
                            ko.applyBindings( this._activitiesViewModel, $( "#activities" )[0] );
                        } )
                        .fail( function ( jqXhr, textStatus, errorThrown ) {
                            alert( textStatus + "|" + errorThrown );
                        } );
                }
                if (tabStrip.select() != 0) {
                    tabStrip.select(0);
                }
            } else if ( tabName === "geographic-expertise" ) {
                if ( this._geographicExpertisesViewModel == null ) {
                    this._geographicExpertisesViewModel = new ViewModels.GeographicExpertises.GeographicExpertiseList( this.personId );
                    this._geographicExpertisesViewModel.load()
                        .done( (): void => {
                            ko.applyBindings( this._geographicExpertisesViewModel, $( "#geographic-expertises" )[0] );
                        } )
                        .fail( function ( jqXhr, textStatus, errorThrown ) {
                            alert( textStatus + "|" + errorThrown );
                        } );
                }
                if (tabStrip.select() != 1) {
                    tabStrip.select(1);
                }
            } else if ( tabName === "language-expertise" ) {
                if ( this._languageExpertisesViewModel == null ) {
                    this._languageExpertisesViewModel = new ViewModels.LanguageExpertises.LanguageExpertiseList( this.personId );
                    this._languageExpertisesViewModel.load()
                        .done( (): void => {
                            ko.applyBindings( this._languageExpertisesViewModel, $( "#language-expertises" )[0] );
                        } )
                        .fail( function ( jqXhr, textStatus, errorThrown ) {
                            alert( textStatus + "|" + errorThrown );
                        } );
                }
                if (tabStrip.select() != 2) {
                    tabStrip.select(2);
                }
            } else if ( tabName === "formal-education" ) {
                if ( this._degreesViewModel == null ) {
                    this._degreesViewModel = new ViewModels.Degrees.DegreeList( this.personId );
                    this._degreesViewModel.load()
                        .done( (): void => {
                            ko.applyBindings( this._degreesViewModel, $( "#degrees" )[0] );
                        } )
                        .fail( function ( jqXhr, textStatus, errorThrown ) {
                            alert( textStatus + "|" + errorThrown );
                        } );
                }
                if (tabStrip.select() != 3) {
                    tabStrip.select(3);
                }
            } else if ( tabName === "affiliations" ) {
                //if ( this._affiliationsViewModel == null ) {
                //    this._affiliationsViewModel = new ViewModels.Affiliations.AffiliationList( this.personId );
                //    this._affiliationsViewModel.load()
                //        .done( (): void => {
                //            ko.applyBindings( this._affiliationsViewModel, $( "#affiliations" )[0] );
                //        } )
                //        .fail( function ( jqXhr, textStatus, errorThrown ) {
                //            alert( textStatus + " |" + errorThrown );
                //        } );
                //}
                if (tabStrip.select() != 4) {
                    tabStrip.select(4);
                }
            }
        }

        tabClickHandler(event: any): void {
            var tabName = event.item.innerText; // IE
            if (tabName == null) tabName = event.item.textContent; // FF
            if (tabName === "Activities" ) tabName = "activities";
            if (tabName === "Geographic Expertise" ) tabName = "geographic-expertise";
            if (tabName === "Language Expertise" ) tabName = "language-expertise";
            if (tabName === "Formal Education" ) tabName = "formal-education";
            if (tabName === "Affiliations" ) tabName = "affiliations";
            //this._startTab( tabName );
            location.href = "#/" + tabName;
        }

        startEditing(): void { // show the editor
            this.editMode(true);
            if (this.$editSection.length) {
                this.$editSection.slideDown();
            }
        }

        stopEditing(): void { // hide the editor
            this.editMode(false);
            if (this.$editSection.length) {
                this.$editSection.slideUp();
            }
        }

        cancelEditing(): void {
            ko.mapping.fromJS(this._originalValues, {}, this); // restore original values
            this.stopEditing();
        }

        saveInfo(): void {

            if (!this.isValid()) {
                this.errors.showAllMessages();
            }
            else {
                var apiModel = ko.mapping.toJS(this);

                this.saveSpinner.start();
                $.ajax({
                    url: App.Routes.WebApi.My.Profile.put(),
                    type: 'PUT',
                    data: apiModel
                })
                .done((responseText: string, statusText: string, xhr: JQueryXHR) => {
                    App.flasher.flash(responseText);
                    this.stopEditing();
                    this._initialize(); // re-initialize original values
                })
                .fail(() => {
                    //alert('a PUT API call failed :(');
                })
                .always((): void => {
                    this.saveSpinner.stop();
                });
            }
        }

        startDeletingPhoto(): void {
            if (this.$confirmPurgeDialog && this.$confirmPurgeDialog.length) {
                this.$confirmPurgeDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: (): void => {
                                this.$confirmPurgeDialog.dialog('close');
                                this._deletePhoto();
                            }
                        },
                        {
                            text: 'No, cancel delete',
                            click: (): void => {
                                this.$confirmPurgeDialog.dialog('close');
                                this.photoDeleteSpinner.stop();
                            },
                            'data-css-link': true
                        }
                    ]
                });
            }
            else if (confirm('Are you sure you want to delete your profile photo?')) {
                this._deletePhoto();
            }
        }

        private _deletePhoto(): void {
            this.photoDeleteSpinner.start();
            this.isPhotoExtensionInvalid(false);
            this.isPhotoTooManyBytes(false);
            this.isPhotoFailureUnexpected(false);
            $.ajax({ // submit ajax DELETE request
                url: App.Routes.WebApi.My.Profile.Photo.del(),
                type: 'DELETE'
            })
            .always((): void => {
                this.photoDeleteSpinner.stop();
            })
            .done((response: string, statusText: string, xhr: JQueryXHR): void => {
                if (typeof response === 'string') App.flasher.flash(response);
                this.hasPhoto(false);
                this.photoSrc(App.Routes.WebApi.My.Profile.Photo
                    .get({ maxSide: 128, refresh: new Date().toUTCString() }));
            })
            .fail((): void => {
                this.isPhotoFailureUnexpected(true);
            });
        }

        private _setupRouting(): void {
            this._sammy.route('get', '#/', (): void => {this._startTab('activities');});
            this._sammy.route('get', '#/activities', (): void => {this._startTab('activities');});
            this._sammy.route('get', '#/geographic-expertise', (): void => {this._startTab('geographic-expertise');});
            this._sammy.route('get', '#/language-expertise', (): void => {this._startTab('language-expertise');});
            this._sammy.route('get', '#/formal-education', (): void => {this._startTab('formal-education');});
            this._sammy.route('get', '#/affiliations', (): void => {this._startTab('affiliations');});
        }

        // client validation rules
        private _setupValidation(): void {
            this.displayName.extend({
                required: {
                    message: 'Display name is required.'
                },
                maxLength: 200
            });

            this.salutation.extend({
                maxLength: 50
            });

            this.firstName.extend({
                maxLength: 100
            });

            this.middleName.extend({
                maxLength: 100
            });

            this.lastName.extend({
                maxLength: 100
            });

            this.suffix.extend({
                maxLength: 50
            });

            this.preferredTitle.extend({
                maxLength: 500
            });

            ko.validation.group(this);
        }

        // comboboxes for salutation & suffix
        private _setupKendoWidgets(): void {

            var tabstrip = $( '#tabstrip' );
            tabstrip.kendoTabStrip( {
                select: ( e:any ): void => { this.tabClickHandler( e ); },
                animation: false
            } ).show();

            // when the $element observables are bound, they will have length
            // use this opportinity to apply kendo extensions
            this.$nameSalutation.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length)
                    newValue.kendoComboBox({
                        dataTextField: "text",
                        dataValueField: "value",
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.People.Names.Salutations.get()
                                }
                            }
                        })
                    });
            });
            this.$nameSuffix.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length)
                    newValue.kendoComboBox({
                        dataTextField: "text",
                        dataValueField: "value",
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.People.Names.Suffixes.get()
                                }
                            }
                        })
                    });
            });

            // this is getting a little long, can probably factor out event handlers / validation stuff
            this.$photo.subscribe((newValue: JQuery): void => {
                if (newValue && newValue.length) {
                    newValue.kendoUpload({
                        multiple: false,
                        showFileList: false,
                        localization: {
                            select: 'Choose a photo to upload...'
                        },
                        async: {
                            saveUrl: App.Routes.WebApi.My.Profile.Photo.post(),
                            removeUrl: App.Routes.WebApi.My.Profile.Photo.kendoRemove()
                        },
                        upload: (e: any): void => {
                            // client-side check for file extension
                            var allowedExtensions: string[] = ['.png', '.jpg', '.jpeg', '.gif'];
                            this.isPhotoExtensionInvalid(false);
                            this.isPhotoTooManyBytes(false);
                            this.isPhotoFailureUnexpected(false);
                            $(e.files).each((index: number): void => {
                                var isExtensionAllowed: bool = false;
                                var isByteNumberAllowed: bool = false;
                                var extension: string = e.files[index].extension;
                                this.photoFileExtension(extension || '[NONE]');
                                this.photoFileName(e.files[index].name);
                                for (var i = 0; i < allowedExtensions.length; i++) {
                                    if (allowedExtensions[i] === extension.toLowerCase()) {
                                        isExtensionAllowed = true;
                                        break;
                                    }
                                }
                                if (!isExtensionAllowed) {
                                    e.preventDefault(); // prevent upload
                                    this.isPhotoExtensionInvalid(true); // update UI with feedback
                                }
                                else if (e.files[index].rawFile.size > (1024 * 1024)) {
                                    e.preventDefault(); // prevent upload
                                    this.isPhotoTooManyBytes(true); // update UI with feedback
                                }
                            });
                            if (!e.isDefaultPrevented()) {
                                this.photoUploadSpinner.start(); // display async wait message
                            }
                        },
                        complete: (): void => {
                            this.photoUploadSpinner.stop(); // hide async wait message
                        },
                        success: (e: any): void => {
                            // this event is triggered by both upload and remove requests
                            // ignore remove operations becuase they don't actually do anything
                            if (e.operation == 'upload') {
                                if (e.response && e.response.message) {
                                    App.flasher.flash(e.response.message);
                                }
                                this.hasPhoto(true);
                                this.photoSrc(App.Routes.WebApi.My.Profile.Photo
                                    .get({ maxSide: 128, refresh: new Date().toUTCString() }));
                            }
                        },
                        error: (e: any): void => {
                            // kendo response is as json string, not js object
                            var fileName: string, fileExtension: string;

                            if (e.files && e.files.length > 0) {
                                fileName = e.files[0].name;
                                fileExtension = e.files[0].extension;
                            }
                            if (fileName) this.photoFileName(fileName);
                            if (fileExtension) this.photoFileExtension(fileExtension);

                            if (e.XMLHttpRequest.status === 415)
                                this.isPhotoExtensionInvalid(true);
                            else if (e.XMLHttpRequest.status === 413)
                                this.isPhotoTooManyBytes(true);
                            else this.isPhotoFailureUnexpected(true);
                        }
                    });
                }
            });
        }

        // logic to derive display name
        private _setupDisplayNameDerivation(): void {
            this.displayName.subscribe((newValue: string): void => {
                if (!this.isDisplayNameDerived()) {
                    // stash user-entered display name only when it is not derived
                    this._userDisplayName = newValue;
                }
            });

            ko.computed((): void => {
                // generate display name if it has been API-initialized
                if (this.isDisplayNameDerived() /* && this._isInitialized */) {
                    var data = ko.mapping.toJS(this);
                    $.ajax({
                        url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                        type: 'GET',
                        cache: false,
                        data: data
                    }).done((result: string): void => {
                        this.displayName(result);
                    });
                }
                else /* if (this._isInitialized) */ {
                    // prevent user display name from being blank
                    if (!this._userDisplayName)
                        this._userDisplayName = this.displayName();
                    // restore user-entered display name
                    this.displayName(this._userDisplayName);
                }
            }).extend({ throttle: 400 }); // wait for observables to stop changing
        }

        private _setupCardComputeds(): void {

            // text translation for gender codes
            this.genderText = ko.computed((): string => {
                var genderCode = this.gender();
                if (genderCode === 'M') return 'Male';
                if (genderCode === 'F') return 'Female';
                if (genderCode === 'P') return 'Gender Undisclosed';
                return 'Gender Unknown';
            });

            // friendly string for isActive boolean
            this.isActiveText = ko.computed((): string => {
                return this.isActive() ? 'Active' : 'Inactive';
            });

            // do not display faculty rank editor for tenants that do not have
            // employee module settings or faculty rank options
            this.isFacultyRankEditable = ko.computed((): bool => {
                return this.facultyRanks() && this.facultyRanks().length > 0;
            });

            // compute the selected faculty rank text
            this.facultyRankText = ko.computed((): string => {
                var id = this.facultyRankId();
                for (var i = 0; i < this.facultyRanks().length; i++) {
                    var facultyRank: Employees.IServerFacultyRankApiModel = this.facultyRanks()[i];
                    if (id === facultyRank.id) {
                        return facultyRank.rank;
                    }
                }
                return undefined;
            });

            // do not display faculty rank on the form card when it is not set
            // or when it is set to other
            this.isFacultyRankVisible = ko.computed((): bool => {
                return this.isFacultyRankEditable() &&
                    this.facultyRankId() &&
                    this.facultyRankText() &&
                    this.facultyRankText().toLowerCase() !== 'other';
            });

        }
    }

}

