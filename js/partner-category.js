(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var role = body.getAttribute("data-partner-role");
    var root = body.getAttribute("data-partner-root") || "../../";
    var loginPath = body.getAttribute("data-login-path");
    var catalogPath = body.getAttribute("data-catalog-path") || "catalog.html";
    var productBase = body.getAttribute("data-product-base") || "product.html";
    var grid = document.getElementById("partner-product-grid");
    var statusEl = document.getElementById("category-status");
    var titleEl = document.getElementById("category-title");
    var subtitleEl = document.getElementById("category-subtitle");
    var badge = document.getElementById("partner-role-badge");
    var logoutBtn = document.getElementById("partner-logout");
    var params = new URLSearchParams(window.location.search);
    var categoryId = params.get("cat");

    if (!PartnerAuth.requireRole(role, loginPath)) {
      return;
    }

    var partnerId = PartnerAuth.getPartnerId();
    var partnerName = PartnerAuth.getPartnerName();
    var overrides = PartnerAuth.getPartnerPriceOverrides();

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

    var meta = PartnerCategories.getCategoryMeta(categoryId);
    if (!meta) {
      if (statusEl) {
        statusEl.textContent = "Category not found.";
      }
      return;
    }

    if (titleEl) {
      titleEl.textContent = meta.title;
    }
    if (subtitleEl) {
      subtitleEl.textContent = meta.description;
    }
    var crumb = document.getElementById("category-crumb");
    if (crumb) {
      crumb.textContent = meta.title;
    }
    document.title = meta.title + " | Ahluwalia Farm";

    PartnerPricing.loadCatalog(root)
      .then(function (data) {
        if (!grid) {
          return;
        }
        var symbol = data.currencySymbol || "Rs.";
        var products = data.products.filter(function (p) {
          return p.category === categoryId;
        });

        if (!products.length) {
          grid.innerHTML =
            '<p class="partner-status">No products in this category yet.</p>';
          if (statusEl) {
            statusEl.remove();
          }
          return;
        }

        var html = products
          .map(function (product) {
            var imgSrc = root + product.image;
            var detailUrl =
              productBase + "?id=" + encodeURIComponent(product.id);
            var badges = (product.badges || [])
              .map(function (b) {
                return '<span class="badge">' + PartnerPricing.escapeHtml(b) + "</span>";
              })
              .join("");

            var o = (overrides && overrides[product.id]) || {};
            var effectivePrices = {
              wholesale:
                o.wholesale !== undefined && o.wholesale !== null
                  ? o.wholesale
                  : product.prices.wholesale,
              trade:
                o.trade !== undefined && o.trade !== null ? o.trade : product.prices.trade,
              retail:
                o.retail !== undefined && o.retail !== null ? o.retail : product.prices.retail
            };

            return (
              '<article class="product-card">' +
              '<a class="product-card-link" href="' +
              detailUrl +
              '">' +
              '<div class="product-card-image">' +
              '<img src="' +
              imgSrc +
              '" alt="' +
              PartnerPricing.escapeHtml(product.name) +
              '" loading="lazy">' +
              "</div>" +
              '<div class="product-card-body">' +
              "<h2 class=\"product-name\">" +
              PartnerPricing.escapeHtml(product.name) +
              "</h2>" +
              '<p class="product-tagline">' +
              PartnerPricing.escapeHtml(product.tagline || "") +
              "</p>" +
              '<p class="product-weight">' +
              PartnerPricing.escapeHtml(product.weight || "") +
              "</p>" +
              PartnerPricing.renderPriceTiers(role, effectivePrices, symbol) +
              '<div class="badges">' +
              badges +
              "</div>" +
              '<span class="category-cta">View details</span>' +
              "</div></a></article>"
            );
          })
          .join("");

        grid.innerHTML = html;
        if (statusEl) {
          statusEl.remove();
        }
      })
      .catch(function (err) {
        if (statusEl) {
          statusEl.textContent = err.message || "Failed to load products.";
        }
      });
  });
})();
