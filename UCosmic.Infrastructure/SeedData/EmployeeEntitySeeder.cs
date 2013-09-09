﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;


namespace UCosmic.SeedData
{
    public class EmployeeModuleSettingsEntitySeeder : ISeedData
    {
        private readonly UcEmployeeModuleSettingsSeeder _ucEmployeeModuleSettingsSeeder;
        private readonly UsfEmployeeModuleSettingsSeeder _usfEmployeeModuleSettingsSeeder;

        public EmployeeModuleSettingsEntitySeeder(UcEmployeeModuleSettingsSeeder ucEmployeeModuleSettingsSeeder
            , UsfEmployeeModuleSettingsSeeder usfEmployeeModuleSettingsSeeder
        )
        {
            _ucEmployeeModuleSettingsSeeder = ucEmployeeModuleSettingsSeeder;
            _usfEmployeeModuleSettingsSeeder = usfEmployeeModuleSettingsSeeder;
        }

        public void Seed()
        {
            _ucEmployeeModuleSettingsSeeder.Seed();
            _usfEmployeeModuleSettingsSeeder.Seed();
        }
    }

    public class UcEmployeeModuleSettingsSeeder : BaseEmployeeModuleSettingsSeeder
    {
        private readonly ICommandEntities _entities;
        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; private set; }

        public UcEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModuleSettings
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryStore
            )
            : base(queryProcessor, createEmployeeModuleSettings, unitOfWork, binaryStore)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            var establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.OfficialName == "University of Cincinnati");
            if (establishment == null) throw new Exception("Establishment is null");
            CreatedEmployeeModuleSettings = Seed(new CreateEmployeeModuleSettings
            {
                //EmployeeFacultyRanks = new Collection<EmployeeFacultyRank>
                //{
                //    new EmployeeFacultyRank {Rank = "Distinguished University Professor", Number = 1},
                //    new EmployeeFacultyRank {Rank = "Professor", Number = 2},
                //    new EmployeeFacultyRank {Rank = "Associate Professor", Number = 3},
                //    new EmployeeFacultyRank {Rank = "Assistant Professor", Number = 4},
                //    new EmployeeFacultyRank {Rank = "Other", Number = 5}
                //},
                NotifyAdminOnUpdate = false,
                PersonalInfoAnchorText = null, //"My International",
                EstablishmentId = establishment.RevisionId,
                    /* TODO: Need actual UC activity types here. */
                EmployeeActivityTypes = new Collection<EmployeeActivityType>
                {
                    new EmployeeActivityType {Type = "Research or Creative Endeavor", Rank = 1},
                    new EmployeeActivityType {Type = "Teaching or Mentoring", Rank = 2},
                    new EmployeeActivityType {Type = "Award or Honor", Rank = 3},
                    new EmployeeActivityType {Type = "Conference Presentation or Proceeding", Rank = 4},
                    new EmployeeActivityType {Type = "Professional Development, Service or Consulting", Rank = 5}
                }
            });
        }
    }

    public class UsfEmployeeModuleSettingsSeeder : BaseEmployeeModuleSettingsSeeder
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryStore;
        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; private set; }
        private string[] _activityTypeFileNames;
        private IDictionary<string,string> _activityTypeIconBinaryPaths;

        public UsfEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModuleSettings
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryStore
            )
            : base(queryProcessor, createEmployeeModuleSettings, unitOfWork, binaryStore)
        {
            _entities = entities;
            _binaryStore = binaryStore;

            _activityTypeFileNames = new string[]
            {
                "noun_project_762_idea.svg",
                "noun_project_14888_teacher.svg",
                "noun_project_17372_medal.svg",
                "noun_project_16986_podium.svg",
                "noun_project_401_briefcase.svg"
            };

            _activityTypeIconBinaryPaths = new Dictionary<string, string>();
            for (var i = 0; i < _activityTypeFileNames.Length; i += 1)
            {
                _activityTypeIconBinaryPaths[_activityTypeFileNames[i]] =
                    string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                  EmployeeConsts.IconsBinaryStorePath,
                                  _activityTypeFileNames[i]);
            }
        }

        public override void Seed()
        {
            var establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.OfficialName.Contains("University of South Florida"));
            if (establishment == null) throw new Exception("Establishment is null");

            for (var i = 0; i < _activityTypeFileNames.Length; i += 1)
            {
                string iconBinaryPath = _activityTypeIconBinaryPaths[_activityTypeFileNames[i]];
                if (_binaryStore.Get(iconBinaryPath) == null)
                {
                    string filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                    @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\",
                                                    _activityTypeFileNames[i]);

                    using (var fileStream = File.OpenRead(filePath))
                    {
                        var content = fileStream.ReadFully();
                        _binaryStore.Put(iconBinaryPath, content);
                    }
                }
            }

            CreatedEmployeeModuleSettings = Seed(new CreateEmployeeModuleSettings
            {
                EmployeeFacultyRanks = new Collection<EmployeeFacultyRank>
                {
                    new EmployeeFacultyRank {Rank = "Distinguished University Professor", Number = 1},
                    new EmployeeFacultyRank {Rank = "Professor", Number = 2},
                    new EmployeeFacultyRank {Rank = "Associate Professor", Number = 3},
                    new EmployeeFacultyRank {Rank = "Assistant Professor", Number = 4},
                    new EmployeeFacultyRank {Rank = "Other", Number = 5}
                },
                NotifyAdminOnUpdate = false,
                PersonalInfoAnchorText = "My USF Profile",
                EstablishmentId = establishment.RevisionId,
                EmployeeActivityTypes = new Collection<EmployeeActivityType>
                {
                    new EmployeeActivityType
                    {
                        Type = "Research or Creative Endeavor",
                        Rank = 1,
                        CssColor = "blue",
                        IconLength = _binaryStore.Get(_activityTypeIconBinaryPaths["noun_project_762_idea.svg"]).Length,
                        IconMimeType = "image/svg+xml",
                        IconName = "Research",
                        IconPath = string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                          EmployeeConsts.IconsBinaryStorePath, "noun_project_762_idea.svg")

                    },
                    new EmployeeActivityType
                    {
                        Type = "Teaching or Mentoring",
                        Rank = 2,
                        CssColor = "green",
                        IconLength = _binaryStore.Get(_activityTypeIconBinaryPaths["noun_project_14888_teacher.svg"]).Length,
                        IconMimeType = "image/svg+xml",
                        IconName = "Teaching",
                        IconPath = string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                          EmployeeConsts.IconsBinaryStorePath, "noun_project_14888_teacher.svg")
                    },
                    new EmployeeActivityType
                    {
                        Type = "Award or Honor",
                        Rank = 3,
                        CssColor = "yellow",
                        IconLength = _binaryStore.Get(_activityTypeIconBinaryPaths["noun_project_17372_medal.svg"]).Length,
                        IconMimeType = "image/svg+xml",
                        IconName = "Award",
                        IconPath = string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                          EmployeeConsts.IconsBinaryStorePath, "noun_project_17372_medal.svg")
                    },
                    new EmployeeActivityType
                    {
                        Type = "Conference Presentation or Proceeding",
                        Rank = 4,
                        CssColor = "orange",
                        IconLength = _binaryStore.Get(_activityTypeIconBinaryPaths["noun_project_16986_podium.svg"]).Length,
                        IconMimeType = "image/svg+xml",
                        IconName = "Conference",
                        IconPath = string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                          EmployeeConsts.IconsBinaryStorePath, "noun_project_16986_podium.svg")
                    },
                    new EmployeeActivityType
                    {
                        Type = "Professional Development, Service or Consulting",
                        Rank = 5,
                        CssColor = "red",
                        IconLength = _binaryStore.Get(_activityTypeIconBinaryPaths["noun_project_401_briefcase.svg"]).Length,
                        IconMimeType = "image/svg+xml",
                        IconName = "Professional",
                        IconPath = string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                          EmployeeConsts.IconsBinaryStorePath, "noun_project_401_briefcase.svg")
                    }
                },
                OfferCountry = true,
                OfferActivityType = true,
                OfferFundingQuestions = true,
                InternationalPedigreeTitle = "My Formal Education Outside the US",
                ReportsDefaultYearRange = 10
            });
        }
    }

    public abstract class BaseEmployeeModuleSettingsSeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEmployeeModuleSettings> _createEmployeeModuleSettings;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStoreBinaryData _binaryStore;

        protected BaseEmployeeModuleSettingsSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployeeModuleSettings> createEmployeeModule
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryStore)
        {
            _queryProcessor = queryProcessor;
            _createEmployeeModuleSettings = createEmployeeModule;
            _unitOfWork = unitOfWork;
            _binaryStore = binaryStore;
        }

        public abstract void Seed();

        protected EmployeeModuleSettings Seed(CreateEmployeeModuleSettings command)
        {
            // make sure entity does not already exist
            var employeeModuleSettings = _queryProcessor.Execute(
                new EmployeeModuleSettingsByEstablishmentId(command.EstablishmentId, true));

            if (employeeModuleSettings != null) return employeeModuleSettings;

            /* Create default Global View icon */
            var globalViewIconBinaryPath = string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                                      EmployeeConsts.IconsBinaryStorePath,
                                                      EmployeeConsts.DefaultGlobalViewIconGuid);
            if (_binaryStore.Get(globalViewIconBinaryPath) == null)
            {
                string filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\",
                                                "global_24_black.png");

                using (var fileStream = File.OpenRead(filePath))
                {
                    var content = fileStream.ReadFully();
                    _binaryStore.Put(globalViewIconBinaryPath, content);
                }                
            }

            /* Create default Find an Expert icon */
            var findAnExportIconBinaryPath = string.Format("{0}/{1}/{2}", EmployeeConsts.SettingsBinaryStoreBasePath,
                                          EmployeeConsts.IconsBinaryStorePath,
                                          EmployeeConsts.DefaultFindAnExpertIconGuid);
            if (_binaryStore.Get(findAnExportIconBinaryPath) == null)
            {
                var filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                             @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\",
                                             "noun_project_5795_compass.svg");
                using (var fileStream = File.OpenRead(filePath))
                {
                    var content = fileStream.ReadFully();
                    _binaryStore.Put(findAnExportIconBinaryPath, content);
                }
            }

            if (String.IsNullOrEmpty(command.GlobalViewIconPath))
            {
                command.GlobalViewIconFileName = "global_24_black.png";
                command.GlobalViewIconLength = _binaryStore.Get(globalViewIconBinaryPath).Length;
                command.GlobalViewIconMimeType = "image/png";
                command.GlobalViewIconName = "GlobalViewIcon";
                command.GlobalViewIconPath = globalViewIconBinaryPath;
            }

            if (String.IsNullOrEmpty(command.FindAnExpertIconPath))
            {
                command.FindAnExpertIconFileName = "noun_project_5795_compass.svg";
                command.FindAnExpertIconLength = _binaryStore.Get(findAnExportIconBinaryPath).Length;
                command.FindAnExpertIconMimeType = "image/svg+xml";
                command.FindAnExpertIconName = "FindAnExpertIcon";
                command.FindAnExpertIconPath = findAnExportIconBinaryPath;
            }

            _createEmployeeModuleSettings.Handle(command);

            _unitOfWork.SaveChanges();

            return command.CreatedEmployeeModuleSettings;
        }
    }

    public class EmployeeEntitySeeder : ISeedData
    {
        private readonly UcEmployeeSeeder _ucEmployeeSeeder;
        private readonly UsfEmployeeSeeder _usfEmployeeSeeder;

        public EmployeeEntitySeeder(UcEmployeeSeeder ucEmployeeSeeder
            , UsfEmployeeSeeder usfEmployeeSeeder
        )
        {
            _ucEmployeeSeeder = ucEmployeeSeeder;
            _usfEmployeeSeeder = usfEmployeeSeeder;
        }

        public void Seed()
        {
            _ucEmployeeSeeder.Seed();
            _usfEmployeeSeeder.Seed();
        }
    }

    public class UcEmployeeSeeder : BaseEmployeeSeeder
    {
        public UcEmployeeSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployee> createEmployee
            , IUnitOfWork unitOfWork
            , ICommandEntities entities
            )
            : base(queryProcessor, createEmployee, unitOfWork, entities)
        {
        }

        public override void Seed()
        {
            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Dan" && x.LastName == "Ludwig");
                if (person == null) throw new Exception("UC person not found.");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for UC.");

                //EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Professor");
                //if (facultyRank == null) throw new Exception("UC Professor rank not found.");

                Seed(new CreateEmployee
                {
//                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "UCosmic CTO",
                    JobTitles = "Software Architect",
                    PersonId = person.RevisionId
                });
            }
            /*
            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Saibal" && x.LastName == "Ghosh");
                if (person == null) throw new Exception("UC person not found.");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for UC.");

                EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Professor");
                if (facultyRank == null) throw new Exception("UC Professor rank not found.");

                Seed(new CreateEmployee
                {
                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "UCosmic Dev",
                    JobTitles = "UCosmic Dev",
                    PersonId = person.RevisionId
                });
            }
            */
            /* More employees ... */
        }
    }

    public class UsfEmployeeSeeder : BaseEmployeeSeeder
    {
        public UsfEmployeeSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployee> createEmployee
            , IUnitOfWork unitOfWork
            , ICommandEntities entities
            )
            : base(queryProcessor, createEmployee, unitOfWork, entities)
        {
        }

        public override void Seed()
        {
            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Douglas" && x.LastName == "Corarito");
                if (person == null) throw new Exception("USF person not found");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Professor");
                if (facultyRank == null) throw new Exception("USF Professor rank not found.");

                Seed(new CreateEmployee
                {
                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "USF World UCosmic Developer",
                    JobTitles = "Software Developer",
                    PersonId = person.RevisionId
                });
            }

            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Margaret" && x.LastName == "Kusenbach");
                if (person == null) throw new Exception("USF person not found");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                EmployeeFacultyRank facultyRank = employeeModuleSettings.FacultyRanks.Single(x => x.Rank == "Associate Professor");
                if (facultyRank == null) throw new Exception("USF Associate Professor rank not found.");

                Seed(new CreateEmployee
                {
                    FacultyRankId = facultyRank.Id,
                    AdministrativeAppointments = "Director of Sociology Graduate Program",
                    JobTitles = "Director",
                    PersonId = person.RevisionId
                });
            }

            {
                Person person = Entities.Get<Person>().SingleOrDefault(x => x.FirstName == "William" && x.LastName == "Hogarth");
                if (person == null) throw new Exception("USF person not found");

                EmployeeModuleSettings employeeModuleSettings = QueryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                Seed(new CreateEmployee
                {
                    JobTitles = "Regional Chancellor",
                    PersonId = person.RevisionId
                });
            }

            /* More employees ... */
        }
    }

    public abstract class BaseEmployeeSeeder : ISeedData
    {
        protected IProcessQueries QueryProcessor { get; set; }
        private readonly IHandleCommands<CreateEmployee> _createEmployee;
        private readonly IUnitOfWork _unitOfWork;
        protected ICommandEntities Entities { get; set; }

        protected BaseEmployeeSeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEmployee> createEmployee
            , IUnitOfWork unitOfWork
            , ICommandEntities entities
            )
        {
            QueryProcessor = queryProcessor;
            _createEmployee = createEmployee;
            _unitOfWork = unitOfWork;
            Entities = entities;
        }

        public abstract void Seed();

        protected Employee Seed(CreateEmployee command)
        {
            // make sure entity does not already exist
            var employee = QueryProcessor.Execute(new EmployeeByPersonId(command.PersonId));

            if (employee != null) return employee;

            _createEmployee.Handle(command);

            _unitOfWork.SaveChanges();

            return command.CreatedEmployee;
        }
    }

}
