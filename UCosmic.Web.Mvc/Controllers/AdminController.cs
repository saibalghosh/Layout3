﻿using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    [RestfulRouteConvention]
    public partial class AdminController : Controller
    {
        public virtual ActionResult Index()
        {
            return View();
        }

    }
}
