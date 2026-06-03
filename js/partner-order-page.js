(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var role = body.getAttribute("data-partner-role");
    var root = body.getAttribute("data-partner-root") || "../../";
    var loginPath = body.getAttribute("data-login-path");
    var cartEl = document.getElementById("partner-cart");
    var badge = document.getElementById("partner-role-badge");
    var logoutBtn = document.getElementById("partner-logout");

    if (!PartnerAuth.requireRole(role, loginPath)) {
      return;
    }

    var partnerId = PartnerAuth.getPartnerId();
    var partnerName = PartnerAuth.getPartnerName();

    if (badge) {
      var suffix = partnerId ? " · " + partnerId : "";
      badge.textContent =
        PartnerPricing.roleLabel(role) + suffix + (partnerName ? " · " + partnerName : "");
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        PartnerAuth.logout();
        window.location.href = loginPath;
      });
    }

    PartnerPricing.loadCatalog(root).then(function (data) {
      var symbol = data.currencySymbol || "Rs.";
      if (cartEl && window.PartnerOrder) {
        window.PartnerOrder.renderCart(cartEl, {
          role: role,
          partnerId: partnerId,
          partnerName: partnerName,
          currencySymbol: symbol
        });
        window.PartnerOrder.updateHeaderBadge();
      }
    });
  });
})();
