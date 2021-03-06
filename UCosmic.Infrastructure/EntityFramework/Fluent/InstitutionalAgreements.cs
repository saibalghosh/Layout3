﻿using System.Data.Entity.ModelConfiguration;
using UCosmic.Domain.InstitutionalAgreements;

namespace UCosmic.EntityFramework
{
    public class InstitutionalAgreementConfigurationOrm : RevisableEntityTypeConfiguration<InstitutionalAgreementConfiguration>
    {
        public InstitutionalAgreementConfigurationOrm()
        {
            ToTable(typeof(InstitutionalAgreementConfiguration).Name, DbSchemaName.InstitutionalAgreements);

            // has one establishment
            HasOptional(d => d.ForEstablishment)
                .WithMany()
                .HasForeignKey(d => d.ForEstablishmentId)
                .WillCascadeOnDelete();
        }
    }

    public class InstitutionalAgreementTypeValueOrm : EntityTypeConfiguration<InstitutionalAgreementTypeValue>
    {
        public InstitutionalAgreementTypeValueOrm()
        {
            ToTable(typeof(InstitutionalAgreementTypeValue).Name, DbSchemaName.InstitutionalAgreements);

            HasKey(p => p.Id);

            // has one configuration
            HasRequired(d => d.Configuration)
                .WithMany(p => p.AllowedTypeValues)
                .HasForeignKey(d => d.ConfigurationId)
                .WillCascadeOnDelete();

            Property(p => p.Text).IsRequired().HasMaxLength(150);
        }
    }

    public class InstitutionalAgreementStatusValueOrm : EntityTypeConfiguration<InstitutionalAgreementStatusValue>
    {
        public InstitutionalAgreementStatusValueOrm()
        {
            ToTable(typeof(InstitutionalAgreementStatusValue).Name, DbSchemaName.InstitutionalAgreements);

            HasKey(p => p.Id);

            // has one configuration
            HasRequired(d => d.Configuration)
                .WithMany(p => p.AllowedStatusValues)
                .HasForeignKey(d => d.ConfigurationId)
                .WillCascadeOnDelete();

            Property(p => p.Text).IsRequired().HasMaxLength(50);
        }
    }

    public class InstitutionalAgreementContactTypeValueOrm : EntityTypeConfiguration<InstitutionalAgreementContactTypeValue>
    {
        public InstitutionalAgreementContactTypeValueOrm()
        {
            ToTable(typeof(InstitutionalAgreementContactTypeValue).Name, DbSchemaName.InstitutionalAgreements);

            HasKey(p => p.Id);

            // has one configuration
            HasRequired(d => d.Configuration)
                .WithMany(p => p.AllowedContactTypeValues)
                .HasForeignKey(d => d.ConfigurationId)
                .WillCascadeOnDelete();

            Property(p => p.Text).IsRequired().HasMaxLength(150);
        }
    }

    public class InstitutionalAgreementOrm : RevisableEntityTypeConfiguration<InstitutionalAgreement>
    {
        public InstitutionalAgreementOrm()
        {
            ToTable(typeof(InstitutionalAgreement).Name, DbSchemaName.InstitutionalAgreements);

            // offspring is no longer derived from children
            //Ignore(p => p.Offspring);

            // has 0 or 1 umbrella
            HasOptional(d => d.Umbrella)
                .WithMany(p => p.Children)
                .Map(m => m.MapKey("UmbrellaId"))
                .WillCascadeOnDelete(false);

            // has many participants
            HasMany(p => p.Participants)
                .WithRequired(d => d.Agreement)
                .Map(m => m.MapKey("AgreementId"))
                .WillCascadeOnDelete(true);

            // has many contacts
            HasMany(p => p.Contacts)
                .WithRequired(d => d.Agreement)
                .Map(m => m.MapKey("AgreementId"))
                .WillCascadeOnDelete(true);

            // has many files
            HasMany(p => p.Files)
                .WithRequired(d => d.Agreement)
                .Map(m => m.MapKey("AgreementId"))
                .WillCascadeOnDelete(true);

            // has many ancestors
            HasMany(p => p.Ancestors)
                .WithRequired(d => d.Offspring)
                .HasForeignKey(d => d.OffspringId)
                .WillCascadeOnDelete(false);

            // has many offspring
            HasMany(p => p.Offspring)
                .WithRequired(d => d.Ancestor)
                .HasForeignKey(d => d.AncestorId)
                .WillCascadeOnDelete(false);

            Property(p => p.Title).IsRequired().HasMaxLength(500);
            Property(p => p.Type).IsRequired().HasMaxLength(150);
            Property(p => p.Status).IsRequired().HasMaxLength(50);
            Property(p => p.Description).IsMaxLength();
            Property(p => p.VisibilityText).HasColumnName("Visibility").IsRequired().HasMaxLength(20);
        }
    }

    public class InstitutionalAgreementNodeOrm : EntityTypeConfiguration<InstitutionalAgreementNode>
    {
        public InstitutionalAgreementNodeOrm()
        {
            ToTable(typeof(InstitutionalAgreementNode).Name, DbSchemaName.InstitutionalAgreements);

            HasKey(p => new { p.AncestorId, p.OffspringId });
        }
    }

    public class InstitutionalAgreementParticipantOrm : EntityTypeConfiguration<InstitutionalAgreementParticipant>
    {
        public InstitutionalAgreementParticipantOrm()
        {
            ToTable(typeof(InstitutionalAgreementParticipant).Name, DbSchemaName.InstitutionalAgreements);

            HasKey(k => k.Id);

            // has one establishment
            HasRequired(d => d.Establishment)
                .WithMany()
                .Map(m => m.MapKey("EstablishmentId"))
                .WillCascadeOnDelete(false); // do not delete agreements when deleting establishment
        }
    }

    public class InstitutionalAgreementContactOrm : RevisableEntityTypeConfiguration<InstitutionalAgreementContact>
    {
        public InstitutionalAgreementContactOrm()
        {
            ToTable(typeof(InstitutionalAgreementContact).Name, DbSchemaName.InstitutionalAgreements);

            // has one establishment
            HasRequired(d => d.Person)
                .WithMany()
                .Map(m => m.MapKey("PersonId"))
                .WillCascadeOnDelete(true);

            Property(p => p.Type).IsRequired().HasMaxLength(150);
        }
    }

    public class InstitutionalAgreementFileOrm : RevisableEntityTypeConfiguration<InstitutionalAgreementFile>
    {
        public InstitutionalAgreementFileOrm()
        {
            ToTable(typeof(InstitutionalAgreementFile).Name, DbSchemaName.InstitutionalAgreements);
            HasKey(m => m.RevisionId);
        }
    }
}
