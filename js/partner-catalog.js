(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var role = body.getAttribute("data-partner-role");
    var loginPath = body.getAttribute("data-login-path");
    var grid = document.getElementById("partner-category-grid");
    var statusEl = document.getElementById("catalog-status");
    var badge = document.getElementById("partner-role-badge");
    var logoutBtn = document.getElementById("partner-logout");
    var categoryBase = body.getAttribute("data-category-base") || "category.html";

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

    if (window.PartnerOrder && window.PartnerOrder.updateHeaderBadge) {
      window.PartnerOrder.updateHeaderBadge();
    }

    if (grid && window.PartnerCategories) {
      PartnerCategories.renderCategoryGrid(grid, categoryBase);
      if (statusEl) {
        statusEl.remove();
      }
    } else if (statusEl) {
      statusEl.textContent = "Could not load categories.";
    }
  });
})();
