﻿using System;
using System.Linq;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.People
{
    public class UpdatePerson
    {
        public UpdatePerson(int id)
        {
            Id = id;
        }

        /* Person */
        public int Id { get; private set; }
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }
        ///* Employee */
        //public int? EmployeeId { get; set; }
        //public int? EmployeeFacultyRankId { get; set; }
        //public string EmployeeAdministrativeAppointments { get; set; }
        //public string EmployeeJobTitles { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdatePersonCommand : AbstractValidator<UpdatePerson>
    {
        public ValidateUpdatePersonCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Id)
                .MustFindPersonById(entities)
                    .WithMessage(MustFindPersonById.FailMessageFormat, x => x.Id)
            ;
        }
    }

    public class HandleUpdatePersonCommand : IHandleCommands<UpdatePerson>
    {
        private readonly ICommandEntities _entities;
        //private readonly IHandleCommands<CreateEmployee> _createEmployee;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdatePersonCommand(ICommandEntities entities
            //, IHandleCommands<CreateEmployee> createEmployee
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            //_createEmployee = createEmployee;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdatePerson command)
        {
            Handle2(command);
        }

        private void Handle2(UpdatePerson command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>()
                .SingleOrDefault(p => p.RevisionId == command.Id);
            if (person == null) // person should never be null thanks to validator
                throw new InvalidOperationException(string.Format(
                    "Person '{0}' does not exist", command.Id));

            // only mutate when state is modified
            if (command.IsActive == person.IsActive &&
                command.IsDisplayNameDerived == person.IsDisplayNameDerived &&
                command.DisplayName == person.DisplayName &&
                command.Salutation == person.Salutation &&
                command.FirstName == person.FirstName &&
                command.MiddleName == person.MiddleName &&
                command.LastName == person.LastName &&
                command.Suffix == person.Suffix &&
                command.Gender == person.Gender)
                return;

            // log audit
            var personAudit = new CommandEvent
            {
                RaisedBy = System.Threading.Thread.CurrentPrincipal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.Id,
                    command.IsActive,
                    command.IsDisplayNameDerived,
                    command.DisplayName,
                    command.Salutation,
                    command.FirstName,
                    command.MiddleName,
                    command.LastName,
                    command.Suffix,
                    command.Gender,
                }),
                PreviousState = person.ToJsonAudit(),
            };

            // update values
            person.IsActive = command.IsActive;
            person.IsDisplayNameDerived = command.IsDisplayNameDerived;
            person.DisplayName = command.DisplayName;
            person.Salutation = command.Salutation;
            person.FirstName = command.FirstName;
            person.MiddleName = command.MiddleName;
            person.LastName = command.LastName;
            person.Suffix = command.Suffix;
            person.Gender = command.Gender;

            // push to database
            personAudit.NewState = person.ToJsonAudit();
            _entities.Create(personAudit);
            _entities.Update(person);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }

        //// rather than handle all of these cases, i broke these out into separate commands.
        //// updateperson only deals with scalars on the person entity.
        //// createemployee and updateemployee only work with those aggregates.
        //// there is also a deleteemployee which encapsulates that operation.
        //// to combine all of the ops that are needed by the user profile screen
        //// i also created an updatemyprofile command.
        //// this command takes all of the scalars from the UI form and then reuses
        //// updateperson, createemployee, updateemployee, and deleteemployee.
        //private void Handle1(UpdatePerson command)
        //{
        //    if (command == null) { throw new ArgumentNullException("command"); }

        //    var person = _entities.Get<Person>()
        //        .SingleOrDefault(p => p.RevisionId == command.RevisionId);
        //    if (person == null) // person should never be null thanks to validator
        //        throw new InvalidOperationException(string.Format(
        //            "Person '{0}' does not exist", command.RevisionId));

        //    // log audit
        //    var personAudit = new CommandEvent
        //    {
        //        RaisedBy = command.FirstName + " " + command.LastName,
        //        Name = command.GetType().FullName,
        //        Value = JsonConvert.SerializeObject(new
        //        {
        //            Id = command.RevisionId,
        //            command.IsActive,
        //            command.IsDisplayNameDerived,
        //            command.DisplayName,
        //            command.Salutation,
        //            command.FirstName,
        //            command.MiddleName,
        //            command.LastName,
        //            command.Suffix,
        //            command.Gender,
        //            //command.Picture,
        //        }),
        //        PreviousState = person.ToJsonAudit(),
        //    };


        //    bool personChanged = false;

        //    if (person.IsActive != command.IsActive)
        //    { person.IsActive = command.IsActive; personChanged = true; }
        //    if (person.IsDisplayNameDerived != command.IsDisplayNameDerived)
        //    { person.IsDisplayNameDerived = command.IsDisplayNameDerived; personChanged = true; }
        //    if (person.DisplayName != command.DisplayName)
        //    { person.DisplayName = command.DisplayName; personChanged = true; }
        //    if (person.Salutation != command.Salutation)
        //    { person.Salutation = command.Salutation; personChanged = true; }
        //    if (person.FirstName != command.FirstName)
        //    { person.FirstName = command.FirstName; personChanged = true; }
        //    if (person.MiddleName != command.MiddleName)
        //    { person.MiddleName = command.MiddleName; personChanged = true; }
        //    if (person.LastName != command.LastName)
        //    { person.LastName = command.LastName; personChanged = true; }
        //    if (person.Suffix != command.Suffix)
        //    { person.Suffix = command.Suffix; personChanged = true; }
        //    if (person.Gender != command.Gender)
        //    { person.Gender = command.Gender; personChanged = true; }

        //    /* TODO: Move to UpdateEmployee */
        //    //{
        //    //    Affiliation primaryAffiliation = person.Affiliations.SingleOrDefault(x => x.IsPrimary);
        //    //    if (primaryAffiliation != null)
        //    //    {
        //    //        string workingTitle = (command.WorkingTitle != null) ? command.WorkingTitle.Trim() : null;
        //    //        primaryAffiliation.JobTitles = (!String.IsNullOrEmpty(command.WorkingTitle)) ? workingTitle : null;
        //    //        changed = true;
        //    //    }
        //    //}

        //    /* TODO: Handle these properties. Maybe as separate command? */
        //    //person.Picture = command.Picture;
        //    //person.Affiliations = command.Affiliations;
        //    //{
        //    //    if (person.Emails.Count != command.Emails.Count)
        //    //        { changed |= true; }
        //    //    else
        //    //    {
        //    //        IEnumerator<EmailAddress> pEnumerator = person.Emails.GetEnumerator();
        //    //        IEnumerator<EmailAddress> cEnumerator = command.Emails.GetEnumerator();
        //    //        for (int i = 0; i < person.Emails.Count; i += 1)
        //    //        {
        //    //            pEnumerator.MoveNext();
        //    //            cEnumerator.MoveNext();

        //    //            if ((pEnumerator.Current.Value != cEnumerator.Current.Value) ||
        //    //                (pEnumerator.Current.IsDefault != cEnumerator.Current.IsDefault) ||
        //    //                (pEnumerator.Current.IsConfirmed != cEnumerator.Current.IsConfirmed))
        //    //            {
        //    //                pEnumerator.Current.Value = cEnumerator.Current.Value;
        //    //                pEnumerator.Current.IsDefault = cEnumerator.Current.IsDefault;
        //    //                pEnumerator.Current.IsConfirmed = cEnumerator.Current.IsConfirmed;
        //    //                changed |= true;
        //    //            }
        //    //        }
        //    //    }
        //    //}

        //    Employee employee = null;

        //    if (command.EmployeeId != null)
        //    {
        //        employee = _entities.Get<Employee>()
        //                 .SingleOrDefault(p => p.Id == command.EmployeeId);
        //    }

        //    CommandEvent employeeAudit = null;

        //    if (employee != null)
        //    {
        //        employeeAudit = new CommandEvent
        //        {
        //            RaisedBy = command.FirstName + " " + command.LastName,
        //            Name = command.GetType().FullName,
        //            Value = JsonConvert.SerializeObject(new
        //            {
        //                Id = command.RevisionId,
        //                command.EmployeeFacultyRankId,
        //                command.EmployeeAdministrativeAppointments,
        //                command.EmployeeJobTitles
        //            }),
        //            PreviousState = employee.ToJsonAudit(),
        //        };
        //    }

        //    bool employeeChanged = false;

        //    /* If all employee properties are null, remove entity */
        //    EmployeeFacultyRank employeeFacultyRank = null;
        //    if (command.EmployeeFacultyRankId.HasValue)
        //        employeeFacultyRank = _entities.Get<EmployeeFacultyRank>().Single(x => x.Id == command.EmployeeFacultyRankId.Value);
        //    if ((employee != null) &&
        //        ((employeeFacultyRank == null) || (employeeFacultyRank.Rank == null)) &&
        //        (command.EmployeeAdministrativeAppointments == null) &&
        //        (command.EmployeeJobTitles == null))
        //    {
        //        _entities.Purge(employee);
        //        person.Employee = null;
        //        employee = null; // so Update is not called
        //        employeeChanged = true;
        //    }
        //    else
        //    {
        //        if (employee == null)
        //        {
        //            CreateEmployee createEmployeeCommand = new CreateEmployee
        //            {
        //                //FacultyRank = (command.EmployeeFacultyRank != null) ?
        //                //    _entities.Get<EmployeeFacultyRank>().SingleOrDefault(r => r.Id == command.EmployeeFacultyRank.Id) :
        //                //    null,
        //                FacultyRankId = command.EmployeeFacultyRankId,
        //                AdministrativeAppointments = command.EmployeeAdministrativeAppointments,
        //                JobTitles = command.EmployeeJobTitles,
        //                PersonId = person.RevisionId,
        //                NoCommit = true,
        //            };

        //            _createEmployee.Handle(createEmployeeCommand);
        //            employeeChanged = true;
        //        }
        //        else
        //        {
        //            if ((command.EmployeeFacultyRankId.HasValue) &&
        //               ((employee.FacultyRank == null) || (command.EmployeeFacultyRankId.Value != employee.FacultyRank.Id)))
        //            {
        //                employee.FacultyRank = _entities.Get<EmployeeFacultyRank>()
        //                                                .SingleOrDefault(r => r.Id == command.EmployeeFacultyRankId.Value);
        //                employeeChanged = true;
        //            }

        //            if (command.EmployeeAdministrativeAppointments != employee.AdministrativeAppointments)
        //            {
        //                employee.AdministrativeAppointments = command.EmployeeAdministrativeAppointments;
        //                employeeChanged = true;
        //            }

        //            if (command.EmployeeJobTitles != employee.JobTitles)
        //            {
        //                employee.JobTitles = command.EmployeeJobTitles;
        //                employeeChanged = true;
        //            }
        //        }
        //    }

        //    // update
        //    if (personChanged)
        //    {
        //        personAudit.NewState = person.ToJsonAudit();
        //        _entities.Create(personAudit);
        //        _entities.Update(person);
        //    }

        //    if (employeeChanged)
        //    {
        //        if (employee != null)
        //        {
        //            if (employeeAudit != null)
        //                {
        //                    employeeAudit.NewState = employee.ToJsonAudit();
        //                    _entities.Create(employeeAudit);
        //                }

        //            _entities.Update(employee);
        //        }
        //    }
            
        //    if (personChanged || employeeChanged )
        //    {
        //        _unitOfWork.SaveChanges();
        //        //if (personChanged) { _eventProcessor.Raise(new PersonChanged()); }
        //        //if (employeeChanged) { _eventProcessor.Raise(new EmployeeChanged()); }
        //    }
        //}
    }
}
 