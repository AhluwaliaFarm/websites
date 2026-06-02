(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var role = body.getAttribute("data-partner-role");
    var catalogPath = body.getAttribute("data-catalog-path");
    var root = body.getAttribute("data-partner-root") || "../../";
    var form = document.getElementById("partner-login-form");
    var errorEl = document.getElementById("login-error");

    if (!form || !role) {
      return;
    }

    if (PartnerAuth.isAuthenticated(role) && catalogPath) {
      window.location.replace(catalogPath);
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var partnerId = form.partnerId ? form.partnerId.value : "";
      var password = form.password.value;

      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = "";
      }

      PartnerAuth.loginWithId(role, partnerId, password, root).then(function (result) {
        if (result.ok) {
          window.location.href = catalogPath;
          return;
        }
        if (errorEl) {
          errorEl.textContent = result.message || "Login failed.";
          errorEl.hidden = false;
        }
      });
    });
  });
})();
