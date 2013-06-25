﻿using System;
using System.Collections.Generic;
using System.Threading;

namespace UCosmic.Domain.Agreements
{
    public class Agreement : Entity
    {
        protected internal Agreement()
        {
            Guid = Guid.NewGuid();
            CreatedOnUtc = DateTime.UtcNow;
            CreatedByPrincipal = Thread.CurrentPrincipal.Identity.Name;

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Participants = new List<AgreementParticipant>();
            Contacts = new List<AgreementContact>();
            Files = new List<AgreementFile>();
            Children = new List<Agreement>();
            Ancestors = new List<AgreementNode>();
            Offspring = new List<AgreementNode>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor

            Visibility = AgreementVisibility.Public;
        }

        public int Id { get; protected set; }
        public Guid Guid { get; protected set; } // TODO: deprecate this

        public int? UmbrellaId { get; protected internal set; }
        public virtual Agreement Umbrella { get; protected internal set; }

        public virtual ICollection<AgreementNode> Ancestors { get; protected internal set; }
        public virtual ICollection<Agreement> Children { get; protected internal set; }
        public virtual ICollection<AgreementNode> Offspring { get; protected internal set; }

        public string Title { get; protected internal set; }
        public bool IsTitleDerived { get; protected internal set; } // TODO, deprecate this
        public string Name { get; protected internal set; }
        public string Description { get; protected internal set; } // TODO, rename this to Content (html wysiwyg)
        public string Notes { get; protected internal set; }
        public string Type { get; protected internal set; }
        public bool? IsAutoRenew { get; protected internal set; }
        public string Status { get; protected internal set; }
        public DateTime StartsOn { get; protected internal set; }
        public DateTime ExpiresOn { get; protected internal set; }
        public bool IsExpirationEstimated { get; protected internal set; }

        public string VisibilityText { get; protected set; }
        public AgreementVisibility Visibility
        {
            get { return VisibilityText.AsEnum<AgreementVisibility>(); }
            protected internal set { VisibilityText = value.AsSentenceFragment(); }
        }

        public virtual ICollection<AgreementParticipant> Participants { get; protected internal set; }
        public virtual ICollection<AgreementContact> Contacts { get; protected internal set; }
        public virtual ICollection<AgreementFile> Files { get; protected internal set; }

        public DateTime CreatedOnUtc { get; protected internal set; }
        public string CreatedByPrincipal { get; protected internal set; }
        public DateTime? UpdatedOnUtc { get; protected internal set; }
        public string UpdatedByPrincipal { get; protected internal set; }
        public byte[] Version { get; protected internal set; }
        
        public override string ToString()
        {
            return string.Format("RevisionId {0}: {1}", Id, Title);
        }
    }

}