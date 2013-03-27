﻿using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Identity
{
    public class RolesUnfiltered : BaseEntitiesQuery<Role>, IDefineQuery<IQueryable<Role>>
    {
        internal RolesUnfiltered(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        internal IPrincipal Principal { get; private set; }
    }

    public class HandleRolesUnfilteredQuery : IHandleQueries<RolesUnfiltered, IQueryable<Role>>
    {
        private readonly IQueryEntities _entities;
        private readonly IProcessQueries _queryProcessor;

        public HandleRolesUnfilteredQuery(IQueryEntities entities
            , IProcessQueries queryProcessor
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
        }

        public IQueryable<Role> Handle(RolesUnfiltered query)
        {
            var results = _entities.Query<Role>()
                .EagerLoad(_entities, query.EagerLoad);

            // only return agent roles when user is an authorization agent or when user is in the agent role
            if (!query.Principal.IsInRole(RoleName.AuthorizationAgent))
            {
                var rolesList = results.ToList();
                var rolesArray = rolesList.ToArray();
                foreach (var role in rolesArray)
                {
                    if (RoleName.NonTenantRoles.Contains(role.Name) ||
                        (role.Name.Contains("agent", StringComparison.OrdinalIgnoreCase) &&
                            !query.Principal.IsInRole(role.Name)))
                    {
                        rolesList.Remove(rolesList.Single(x => x.Name == role.Name));
                    }
                }

                results = rolesList.AsQueryable();
            }

            results = query.OrderBy != null ? results.OrderBy(query.OrderBy) : results.OrderBy(x => x.RevisionId);

            return results;
        }
    }
}