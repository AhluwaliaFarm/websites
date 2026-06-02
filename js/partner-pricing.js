(function () {
  "use strict";

  function formatAmount(amount, symbol) {
    if (amount === null || amount === undefined) {
      return "Contact for price";
    }
    return symbol + " " + amount;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderPriceTiers(role, prices, symbol) {
    var sym = symbol || "Rs.";
    var wholesale = prices.wholesale;
    var trade = prices.trade;
    var retail = prices.retail;

    if (role === "distributor") {
      return (
        '<div class="price-tier" role="group" aria-label="Distributor pricing">' +
        '<p class="price-tier-row"><span class="price-tier-label">Wholesale</span> ' +
        '<span class="price-tier-value">' +
        escapeHtml(formatAmount(wholesale, sym)) +
        "</span></p>" +
        '<p class="price-tier-row"><span class="price-tier-label">Sell to retailer</span> ' +
        '<span class="price-tier-value">' +
        escapeHtml(formatAmount(trade, sym)) +
        "</span></p>" +
        "</div>"
      );
    }

    return (
      '<div class="price-tier" role="group" aria-label="Retailer pricing">' +
      '<p class="price-tier-row"><span class="price-tier-label">Your cost</span> ' +
      '<span class="price-tier-value">' +
      escapeHtml(formatAmount(trade, sym)) +
      "</span></p>" +
      '<p class="price-tier-row"><span class="price-tier-label">Suggested retail</span> ' +
      '<span class="price-tier-value">' +
      escapeHtml(formatAmount(retail, sym)) +
      "</span></p>" +
      "</div>"
    );
  }

  function loadCatalog(root) {
    return fetch(root + "data/products.json").then(function (res) {
      if (!res.ok) {
        throw new Error("Could not load product catalog.");
      }
      return res.json();
    });
  }

  function roleLabel(role) {
    return role === "distributor" ? "Distributor" : "Retailer";
  }

  function categoryLabel(category) {
    var labels = {
      honey: "Organic Honey",
      eggs: "Cage-Free Eggs",
      turmeric: "Turmeric",
      "mustard-oil": "Mustard Oil"
    };
    return labels[category] || category;
  }

  window.PartnerPricing = {
    formatAmount: formatAmount,
    renderPriceTiers: renderPriceTiers,
    loadCatalog: loadCatalog,
    roleLabel: roleLabel,
    categoryLabel: categoryLabel,
    escapeHtml: escapeHtml
  };
})();
