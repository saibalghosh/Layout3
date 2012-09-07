﻿using System.Data.Entity;

namespace UCosmic.EntityFramework
{
    public class DoNotDropCreateUpdateOrMigrateDatabase<TContext> : IDatabaseInitializer<TContext> where TContext : DbContext
    {
        public void InitializeDatabase(TContext dbContext)
        {
            // do nothing to initialize the database.
        }
    }
}