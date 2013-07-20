﻿using System;
using System.Linq;
using System.Security.Principal;

namespace UCosmic.Domain.Files
{
    public class CreateLooseFile
    {
        public CreateLooseFile(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public byte[] Content { get; set; }
        public string Name { get; set; }
        public string MimeType { get; set; }
        public LooseFile Created { get; internal set; }
    }

    public class HandleCreateLooseFileCommand : IHandleCommands<CreateLooseFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IQueryEntities _detachedEntities;

        public HandleCreateLooseFileCommand(ICommandEntities entities, IUnitOfWork unitOfWork
            , IQueryEntities detachedEntities
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _detachedEntities = detachedEntities;
        }

        public void Handle(CreateLooseFile command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = new LooseFile
            {
                Content = command.Content,
                Length = command.Content.Length,
                MimeType = command.MimeType,
                Name = command.Name,
                CreatedByPrincipal = command.Principal.Identity.Name,
            };

            _entities.Create(entity);
            _unitOfWork.SaveChanges();
            command.Created = _detachedEntities.Query<LooseFile>()
                .SingleOrDefault(x => x.RevisionId == entity.RevisionId);
        }
    }
}
