﻿namespace UCosmic.Domain.Establishments
{
    public static class EstablishmentConstraints
    {
        public const int CeebCodeLength = 6;
        public const int UCosmicCodeLength = 6;
    }

    public static class EstablishmentNameConstraints
    {
        public const int TextMaxLength = 400;
    }

    public static class EstablishmentUrlConstraints
    {
        public const int ValueMaxLength = 200;
    }
}
