﻿using SimpleInjector;
#if AZURE
using System;
using Microsoft.ApplicationServer.Caching;
using UCosmic.Configuration;
using UCosmic.Logging;
#endif

namespace UCosmic.Cache
{
    public static class SimpleInjectorCacheProviderRegistration
    {
        public static void TryRegisterAzureCacheProvider(this Container container)
        {
#if AZURE
            try
            {
                var factory = new DataCacheFactory();
                factory.GetDefaultCache();
                container.RegisterAzureCacheProvider();
            }
            catch (Exception ex)
            {
                var config = new DotNetConfigurationManager();
                var logger = new ElmahExceptionLogger(config.DefaultMailFromAddress, config.EmergencyMailAddresses);
                logger.Log(ex);
            }
#endif
        }

#if AZURE
        private static void RegisterAzureCacheProvider(this Container container)
        {
            container.RegisterSingle(() => new DataCacheFactory());
            container.RegisterSingle(() => container.GetInstance<DataCacheFactory>().GetDefaultCache());
            container.Register<IProvideCache>(() => new AzureCacheProvider(container.GetInstance<DataCache>()));
        }
#endif
    }
}
