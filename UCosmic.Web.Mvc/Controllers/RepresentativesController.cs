using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;

namespace UCosmic.Web.Mvc.Controllers
{
    public class RepresentativesController : Controller
    {
        //
        // GET: /Representatives/

        [GET("/representatives/settings")]
        public ActionResult Settings()
        {
            return View();
        }
    }
}