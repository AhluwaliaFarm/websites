(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var role = body.getAttribute("data-partner-role");
    var root = body.getAttribute("data-partner-root") || "../../";
    var loginPath = body.getAttribute("data-login-path");
    var productBase = body.getAttribute("data-product-base") || "product.html";
    var grid = document.getElementById("partner-product-grid");
    var statusEl = document.getElementById("catalog-status");
    var badge = document.getElementById("partner-role-badge");
    var logoutBtn = document.getElementById("partner-logout");
    var cartEl = document.getElementById("partner-cart");

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

    PartnerPricing.loadCatalog(root)
      .then(function (data) {
        if (!grid) {
          return;
        }
        var symbol = data.currencySymbol || "Rs.";

        if (cartEl && window.PartnerOrder) {
          window.PartnerOrder.renderCart(cartEl, {
            role: role,
            partnerId: partnerId,
            partnerName: partnerName,
            currencySymbol: symbol
          });
        }

        var html = data.products
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

            var buyPrice = role === "distributor" ? effectivePrices.wholesale : effectivePrices.trade;
            var buyLabel = role === "distributor" ? "Wholesale" : "Your cost";

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
              '<p class="product-category">' +
              PartnerPricing.escapeHtml(PartnerPricing.categoryLabel(product.category)) +
              "</p>" +
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
              "</div></a>" +
              '<div class="partner-order-controls">' +
              '<label class="partner-order-label" for="qty-' +
              PartnerPricing.escapeHtml(product.id) +
              '">Qty</label>' +
              '<input class="partner-order-qty" id="qty-' +
              PartnerPricing.escapeHtml(product.id) +
              '" type="number" min="1" value="1" inputmode="numeric" data-qty-for="' +
              PartnerPricing.escapeHtml(product.id) +
              '">' +
              '<button type="button" class="btn btn-primary btn-sm partner-order-add" data-add="' +
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
              "</div>" +
              "</article>"
            );
          })
          .join("");

        grid.innerHTML = html;

        if (grid && cartEl && window.PartnerOrder) {
          grid.addEventListener("click", function (e) {
            var t = e.target;
            if (!t) return;
            var pid = t.getAttribute("data-add");
            if (!pid) return;
            var qtyInput = document.getElementById("qty-" + pid);
            var qty = qtyInput ? qtyInput.value : "1";
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
