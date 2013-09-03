﻿using System;
using System.Linq;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Degrees
{
    public class DegreeCountByEstablishmentId : BaseEntityQuery<Degree>, IDefineQuery<int>
    {
        public int EstablishmentId { get; private set; }
        //public DateTime? FromDate { get; private set; }
        //public DateTime? ToDate { get; private set; }
        //public bool NoUndated { get; private set; }
        //public bool IncludeFuture { get; private set; }

        public DegreeCountByEstablishmentId(int inEstablishmentId
                                            //,DateTime? fromDateUtc = null
                                            //,DateTime? toDateUtc = null
                                            )
        {
            //if ((fromDateUtc.HasValue && !toDateUtc.HasValue) || (!fromDateUtc.HasValue && toDateUtc.HasValue))
            //{
            //    throw new ArgumentException("Both fromDateUtc and toDateUtc must be provided.");
            //}

            EstablishmentId = inEstablishmentId;
            //FromDate = fromDateUtc;
            //ToDate = toDateUtc;
        }

        //public DegreeCountByEstablishmentId(int inEstablishmentId
        //                                      ,DateTime fromDateUtc
        //                                      ,DateTime toDateUtc
        //                                      ,bool noUndated
        //                                      ,bool includeFuture
        //                        )
        //{
        //    EstablishmentId = inEstablishmentId;
        //    FromDate = fromDateUtc;
        //    ToDate = toDateUtc;
        //    NoUndated = noUndated;
        //    IncludeFuture = includeFuture;
        //}
    }

    public class HandleDegreeCountByEstablishmentIdQuery : IHandleQueries<DegreeCountByEstablishmentId, int>
    {
        private readonly IQueryEntities _entities;

        public HandleDegreeCountByEstablishmentIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public int Handle(DegreeCountByEstablishmentId query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Degree>()
                            .Count(d => ((d.Person.Affiliations.Count(x => x.IsDefault) == 1) &&
                                        (d.Person.Affiliations.FirstOrDefault(x => x.IsDefault).EstablishmentId == query.EstablishmentId)) ||
                                        (d.Person.Affiliations.Any( a => a.Establishment.RevisionId == query.EstablishmentId)) ||
                                        (d.Person.Affiliations.Any( a => a.CampusId.HasValue && (a.CampusId == query.EstablishmentId))) ||
                                        (d.Person.Affiliations.Any( a => a.CollegeId.HasValue && (a.CampusId == query.EstablishmentId))) ||
                                        (d.Person.Affiliations.Any( a => a.Establishment.Ancestors.Any(n => n.AncestorId == query.EstablishmentId)))
                );


        }
    }
}
