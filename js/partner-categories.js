(function () {
  "use strict";

  var CATEGORIES = [
    {
      id: "honey",
      title: "Organic Honey",
      description: "Raw, unprocessed honey from diverse Punjab wildflowers.",
      icon: "🍯"
    },
    {
      id: "eggs",
      title: "Cage-Free Eggs",
      description: "Farm-raised hens and fresh daily collection.",
      icon: "🥚"
    },
    {
      id: "turmeric",
      title: "Turmeric",
      description: "Naturally sourced farm produce (availability varies).",
      icon: "🌿"
    },
    {
      id: "mustard-oil",
      title: "Mustard Oil",
      description: "Traditional mustard oil for everyday cooking.",
      icon: "🫙"
    }
  ];

  function getCategoryMeta(categoryId) {
    return (
      CATEGORIES.find(function (c) {
        return c.id === categoryId;
      }) || null
    );
  }

  function renderCategoryGrid(container, categoryBase) {
    if (!container) return;
    var base = categoryBase || "category.html";
    var html = CATEGORIES.map(function (cat) {
      return (
        '<a class="category-card" href="' +
        base +
        "?cat=" +
        encodeURIComponent(cat.id) +
        '">' +
        '<div class="category-icon" aria-hidden="true">' +
        cat.icon +
        "</div>" +
        "<h2 class=\"category-title\">" +
        PartnerPricing.escapeHtml(cat.title) +
        "</h2>" +
        '<p class="category-desc">' +
        PartnerPricing.escapeHtml(cat.description) +
        "</p>" +
        '<span class="category-cta">View products</span>' +
        "</a>"
      );
    }).join("");
    container.innerHTML = '<div class="category-grid">' + html + "</div>";
  }

  window.PartnerCategories = {
    CATEGORIES: CATEGORIES,
    getCategoryMeta: getCategoryMeta,
    renderCategoryGrid: renderCategoryGrid
  };
})();
