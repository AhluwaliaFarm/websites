(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var role = body.getAttribute("data-partner-role");
    var root = body.getAttribute("data-partner-root") || "../../";
    var loginPath = body.getAttribute("data-login-path");
    var catalogPath = body.getAttribute("data-catalog-path");
    var panel = document.getElementById("partner-product-panel");
    var statusEl = document.getElementById("product-status");
    var badge = document.getElementById("partner-role-badge");
    var logoutBtn = document.getElementById("partner-logout");
    var cartEl = document.getElementById("partner-cart");
    var params = new URLSearchParams(window.location.search);
    var productId = params.get("id");

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

    if (!productId) {
      if (statusEl) {
        statusEl.textContent = "No product selected.";
      }
      return;
    }

    PartnerPricing.loadCatalog(root)
      .then(function (data) {
        var product = data.products.find(function (p) {
          return p.id === productId;
        });

        if (!product) {
          if (statusEl) {
            statusEl.textContent = "Product not found.";
          }
          return;
        }

        var symbol = data.currencySymbol || "Rs.";
        var badges = (product.badges || [])
          .map(function (b) {
            return '<span class="badge">' + PartnerPricing.escapeHtml(b) + "</span>";
          })
          .join("");
        var publicLink = product.publicDetailUrl
          ? '<p class="partner-public-link"><a href="' +
            root +
            product.publicDetailUrl +
            '">View public product page</a></p>'
          : "";

        document.title = product.name + " | Ahluwalia Farm";

        var o = (overrides && overrides[product.id]) || {};
        var effectivePrices = {
          wholesale:
            o.wholesale !== undefined && o.wholesale !== null ? o.wholesale : product.prices.wholesale,
          trade: o.trade !== undefined && o.trade !== null ? o.trade : product.prices.trade,
          retail: o.retail !== undefined && o.retail !== null ? o.retail : product.prices.retail
        };

        var buyPrice = role === "distributor" ? effectivePrices.wholesale : effectivePrices.trade;
        var buyLabel = role === "distributor" ? "Wholesale" : "Your cost";

        if (cartEl && window.PartnerOrder) {
          window.PartnerOrder.renderCart(cartEl, {
            role: role,
            partnerId: partnerId,
            partnerName: partnerName,
            currencySymbol: symbol
          });
        }

        if (panel) {
          panel.innerHTML =
            '<div class="detail-grid">' +
            '<div class="detail-media">' +
            '<img src="' +
            root +
            product.image +
            '" alt="' +
            PartnerPricing.escapeHtml(product.name) +
            '" loading="lazy">' +
            "</div>" +
            '<aside class="detail-panel">' +
            '<p class="product-category">' +
            PartnerPricing.escapeHtml(PartnerPricing.categoryLabel(product.category)) +
            "</p>" +
            "<h1 class=\"detail-title\">" +
            PartnerPricing.escapeHtml(product.name) +
            "</h1>" +
            '<p class="detail-meta">' +
            PartnerPricing.escapeHtml(product.tagline || "") +
            "</p>" +
            '<p class="product-weight">' +
            PartnerPricing.escapeHtml(product.weight || "") +
            "</p>" +
            PartnerPricing.renderPriceTiers(role, effectivePrices, symbol) +
            '<div class="badges">' +
            badges +
            "</div>" +
            '<p class="product-desc">' +
            PartnerPricing.escapeHtml(product.description || "") +
            "</p>" +
            '<div class="detail-actions">' +
            '<label class="partner-order-label" for="detail-qty">Qty</label>' +
            '<input class="partner-order-qty" id="detail-qty" type="number" min="1" value="1" inputmode="numeric">' +
            '<button type="button" class="btn btn-primary btn-sm partner-order-add" id="detail-add" data-add="' +
            PartnerPricing.escapeHtml(product.id) +
            '" data-name="' +
            PartnerPricing.escapeHtml(product.name) +
            '" data-weight="' +
            PartnerPricing.escapeHtml(product.weight || "") +
            '" data-price="' +
            (buyPrice === null || buyPrice === undefined ? "" : String(buyPrice)) +
            '" data-price-label="' +
            PartnerPricing.escapeHtml(buyLabel) +
            '">Add to order</button>' +
            '<a class="btn btn-secondary btn-sm" href="' +
            catalogPath +
            '">Back to catalog</a>' +
            "</div>" +
            publicLink +
            "</aside></div>";

          if (statusEl) {
            statusEl.remove();
          }
        }

        if (panel && cartEl && window.PartnerOrder) {
          panel.addEventListener("click", function (e) {
            var t = e.target;
            if (!t) return;
            var pid = t.getAttribute("data-add");
            if (!pid) return;
            var qtyEl = document.getElementById("detail-qty");
            var qty = qtyEl ? qtyEl.value : "1";
            var price = t.getAttribute("data-price");
            window.PartnerOrder.addItem({
              productId: pid,
              productName: t.getAttribute("data-name") || pid,
              productWeight: t.getAttribute("data-weight") || "",
              qty: qty,
              unitPrice: price === "" ? null : price,
              roleUnitLabel: t.getAttribute("data-price-label") || ""
            });
            window.PartnerOrder.renderCart(cartEl, {
              role: role,
              partnerId: partnerId,
              partnerName: partnerName,
              currencySymbol: symbol
            });
          });
        }
      })
      .catch(function (err) {
        if (statusEl) {
          statusEl.textContent = err.message || "Failed to load product.";
        }
      });
  });
})();
