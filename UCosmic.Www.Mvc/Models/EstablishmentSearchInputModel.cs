﻿using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Www.Mvc.Models
{
    public class EstablishmentSearchInputModel
    {
        public EstablishmentSearchInputModel()
        {
            PageSize = 10;
            PageNumber = 1;
        }

        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public static class EstablishmentSearchInputModelProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentSearchInputModel, EstablishmentsByKeyword>()

                    // map the country code
                    .ForMember(d => d.CountryCode, o => o.ResolveUsing(s =>
                    {
                        // a country code value of -1 implies finding results without a country code
                        if (s.CountryCode == "-1") return null;

                        // a country code value of "" implies finding all results regardless of country code
                        if (string.IsNullOrWhiteSpace(s.CountryCode)) return string.Empty;

                        return s.CountryCode;
                    }))

                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                        {
                            var orderBy = new Dictionary<Expression<Func<EstablishmentView, object>>, OrderByDirection>();
                            if (string.IsNullOrWhiteSpace(s.OrderBy))
                                orderBy.Add(e => e.RevisionId, OrderByDirection.Ascending);

                            else if (s.OrderBy.Equals("country-asc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.CountryName, OrderByDirection.Ascending);
                            else if (s.OrderBy.Equals("country-desc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.CountryName, OrderByDirection.Descending);

                            else if (s.OrderBy.Equals("name-asc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.TranslatedName, OrderByDirection.Ascending);
                            else if (s.OrderBy.Equals("name-desc", StringComparison.OrdinalIgnoreCase))
                                orderBy.Add(e => e.TranslatedName, OrderByDirection.Descending);

                            return orderBy;
                        }))

                    // map the pager options
                    .ForMember(d => d.Pager, o => o.MapFrom(s =>
                        new PagedQueryRequest
                        {
                            PageNumber = s.PageNumber,
                            PageSize = s.PageSize,
                        }))
                ;
            }
        }
    }
}