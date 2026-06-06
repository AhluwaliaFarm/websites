(function () {
  "use strict";

  var CATEGORIES = [
    {
      id: "honey",
      title: "Organic Honey",
      description: "Raw, unprocessed honey from diverse Punjab wildflowers.",
      image: "assets/honey-main.png"
    },
    {
      id: "eggs",
      title: "Cage-Free Eggs",
      description: "Farm-raised hens and fresh daily collection.",
      image: "assets/eggs-main.png"
    },
    {
      id: "turmeric",
      title: "Turmeric",
      description: "Naturally sourced farm produce (availability varies).",
      image: "assets/turmeric-main.png"
    },
    {
      id: "mustard-oil",
      title: "Mustard Oil",
      description: "Traditional mustard oil for everyday cooking.",
      image: "assets/mustard-oil-main.png"
    }
  ];

  function getCategoryMeta(categoryId) {
    return (
      CATEGORIES.find(function (c) {
        return c.id === categoryId;
      }) || null
    );
  }

  function renderCategoryGrid(container, categoryBase, root) {
    if (!container) return;
    var base = categoryBase || "category.html";
    var assetRoot = root || "";
    var html = CATEGORIES.map(function (cat) {
      var imgSrc = assetRoot + cat.image;
      return (
        '<a class="category-card" href="' +
        base +
        "?cat=" +
        encodeURIComponent(cat.id) +
        '">' +
        '<div class="category-image">' +
        '<img src="' +
        imgSrc +
        '" alt="' +
        PartnerPricing.escapeHtml(cat.title) +
        '" loading="lazy">' +
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
