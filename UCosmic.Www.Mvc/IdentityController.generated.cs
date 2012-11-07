// <auto-generated />
// This file was generated by a T4 template.
// Don't change it directly as your change would get overwritten.  Instead, make changes
// to the .tt file (i.e. the T4 template) and save it to regenerate this file.

// Make sure the compiler doesn't complain about missing Xml comments
#pragma warning disable 1591
#region T4MVC

using System;
using System.Diagnostics;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using System.Web.Mvc.Html;
using System.Web.Routing;
using T4MVC;
namespace UCosmic.Www.Mvc.Controllers {
    public partial class IdentityController {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected IdentityController(Dummy d) { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoute(callInfo.RouteValueDictionary);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToActionPermanent(ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoutePermanent(callInfo.RouteValueDictionary);
        }

        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult SignIn() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.SignIn);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public IdentityController Actions { get { return MVC.Identity; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Identity";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "Identity";

        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass {
            public readonly string SignIn = "SignIn";
            public readonly string SignOut = "SignOut";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants {
            public const string SignIn = "SignIn";
            public const string SignOut = "SignOut";
        }


        static readonly ActionParamsClass_SignIn s_params_SignIn = new ActionParamsClass_SignIn();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_SignIn SignInParams { get { return s_params_SignIn; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_SignIn {
            public readonly string returnUrl = "returnUrl";
        }
        static readonly ViewNames s_views = new ViewNames();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ViewNames Views { get { return s_views; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ViewNames {
            public readonly string SignIn = "~/Views/Identity/SignIn.cshtml";
            public readonly string SignOut = "~/Views/Identity/SignOut.cshtml";
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public class T4MVC_IdentityController: UCosmic.Www.Mvc.Controllers.IdentityController {
        public T4MVC_IdentityController() : base(Dummy.Instance) { }

        public override System.Web.Mvc.ActionResult SignIn(string returnUrl) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SignIn);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "returnUrl", returnUrl);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SignIn(UCosmic.Www.Mvc.Models.SignInForm model) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SignIn);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "model", model);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SignOut() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SignOut);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591
