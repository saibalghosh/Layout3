﻿using AutoMapper;
using UCosmic.Domain.Files;

namespace UCosmic.Web.Mvc.Models
{
    public sealed class FileMedium
    {
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public byte[] Content { get; set; }
    }

    public static class FileMediumProfiler
    {
        public class ModelToCreateLooseFile : Profile
        {
            protected override void Configure()
            {
                CreateMap<FileMedium, CreateLooseFile>()
                    .ForMember(d => d.Content, o => o.MapFrom(s => s.Content))
                    .ForMember(d => d.MimeType, o => o.MapFrom(s => s.ContentType))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.FileName))
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.Created, o => o.Ignore())
                ;
            }
        }
    }
}