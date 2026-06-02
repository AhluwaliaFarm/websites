(function () {
  "use strict";

  var CART_KEY = "partnerCart";

  var DEFAULT_CONTACT = {
    phoneE164: "917986839571",
    email: "ahluwaliafarm@gmail.com"
  };

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getCart() {
    return safeJsonParse(sessionStorage.getItem(CART_KEY) || "[]", []);
  }

  function setCart(cart) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart || []));
  }

  function clearCart() {
    setCart([]);
  }

  function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function upsertItem(cart, item) {
    var idx = cart.findIndex(function (x) {
      return x && x.productId === item.productId;
    });
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 0) + (item.qty || 0);
      cart[idx].unitPrice = item.unitPrice;
      cart[idx].roleUnitLabel = item.roleUnitLabel;
      cart[idx].productName = item.productName;
      cart[idx].productWeight = item.productWeight;
      return cart;
    }
    cart.push(item);
    return cart;
  }

  function addItem(item) {
    var cart = getCart();
    var qty = Math.max(1, Math.floor(toNumber(item.qty) || 1));
    upsertItem(cart, {
      productId: item.productId,
      productName: item.productName || "",
      productWeight: item.productWeight || "",
      qty: qty,
      unitPrice: item.unitPrice === null || item.unitPrice === undefined ? null : toNumber(item.unitPrice),
      roleUnitLabel: item.roleUnitLabel || ""
    });
    setCart(cart);
    return cart;
  }

  function removeItem(productId) {
    var cart = getCart().filter(function (x) {
      return x && x.productId !== productId;
    });
    setCart(cart);
    return cart;
  }

  function setQty(productId, qty) {
    var cart = getCart();
    var q = Math.max(1, Math.floor(toNumber(qty) || 1));
    cart.forEach(function (x) {
      if (x && x.productId === productId) {
        x.qty = q;
      }
    });
    setCart(cart);
    return cart;
  }

  function computeTotals(cart) {
    var total = 0;
    var hasPrice = false;
    (cart || []).forEach(function (x) {
      if (!x) return;
      if (x.unitPrice === null || x.unitPrice === undefined) return;
      total += (x.unitPrice || 0) * (x.qty || 0);
      hasPrice = true;
    });
    return { total: total, hasPrice: hasPrice };
  }

  function escapeText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function buildOrderText(opts) {
    var role = opts.role;
    var partnerId = opts.partnerId;
    var partnerName = opts.partnerName;
    var currencySymbol = opts.currencySymbol || "Rs.";
    var cart = opts.cart || [];
    var note = escapeText(opts.note || "");

    var header =
      "Order request (" +
      (role === "distributor" ? "Distributor" : "Retailer") +
      ")" +
      "\nPartner ID: " +
      (partnerId || "-") +
      (partnerName ? "\nPartner: " + partnerName : "") +
      "\nDate: " +
      new Date().toLocaleString();

    var lines = cart.map(function (x, i) {
      var name = escapeText(x.productName);
      var weight = escapeText(x.productWeight);
      var qty = x.qty || 1;
      var pricePart =
        x.unitPrice === null || x.unitPrice === undefined
          ? ""
          : " @ " + currencySymbol + " " + x.unitPrice;
      var suffix = weight ? " (" + weight + ")" : "";
      return (i + 1) + ". " + name + suffix + " — Qty: " + qty + pricePart;
    });

    var totals = computeTotals(cart);
    var totalLine = totals.hasPrice ? "\nTotal (approx): " + currencySymbol + " " + totals.total : "";
    var noteLine = note ? "\nNote: " + note : "";

    return header + "\n\nItems:\n" + lines.join("\n") + totalLine + noteLine;
  }

  function whatsappUrl(phoneE164, text) {
    var phone = String(phoneE164 || "").replace(/[^\d]/g, "");
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
  }

  function mailtoUrl(email, subject, body) {
    var to = encodeURIComponent(email || "");
    return (
      "mailto:" +
      to +
      "?subject=" +
      encodeURIComponent(subject || "Order request") +
      "&body=" +
      encodeURIComponent(body || "")
    );
  }

  function renderCart(container, opts) {
    if (!container) return;
    var cart = getCart();
    var currencySymbol = opts.currencySymbol || "Rs.";
    var totals = computeTotals(cart);
    var partnerId = opts.partnerId || "";
    var partnerName = opts.partnerName || "";
    var role = opts.role;

    if (!container.__partnerCartBound) {
      container.__partnerCartBound = true;
      container.addEventListener("click", function (e) {
        var t = e.target;
        if (!t) return;
        var removeId = t.getAttribute("data-cart-remove");
        if (removeId) {
          removeItem(removeId);
          renderCart(container, opts);
          return;
        }
        if (t.getAttribute("data-cart-clear")) {
          clearCart();
          renderCart(container, opts);
          return;
        }
        var send = t.getAttribute("data-send");
        if (send) {
          var noteEl = document.getElementById("partner-order-note");
          var text = buildOrderText({
            role: role,
            partnerId: partnerId,
            partnerName: partnerName,
            currencySymbol: currencySymbol,
            cart: getCart(),
            note: noteEl ? noteEl.value : ""
          });

          var contact = opts.contact || DEFAULT_CONTACT;
          if (send === "whatsapp") {
            window.open(whatsappUrl(contact.phoneE164, text), "_blank", "noopener,noreferrer");
            return;
          }
          var subject =
            "Order request - " +
            (role === "distributor" ? "Distributor" : "Retailer") +
            (partnerId ? " - " + partnerId : "");
          window.location.href = mailtoUrl(contact.email, subject, text);
        }
      });

      container.addEventListener("input", function (e) {
        var t = e.target;
        if (!t) return;
        var qtyFor = t.getAttribute("data-cart-qty");
        if (qtyFor) {
          setQty(qtyFor, t.value);
          renderCart(container, opts);
        }
      });
    }

    var header =
      '<div class="partner-cart-header">' +
      "<h2 class=\"partner-cart-title\">Your order</h2>" +
      "<p class=\"partner-cart-subtitle\">" +
      (partnerName ? "Partner: " + PartnerPricing.escapeHtml(partnerName) + " · " : "") +
      (partnerId ? "ID: " + PartnerPricing.escapeHtml(partnerId) : "") +
      "</p>" +
      "</div>";

    if (!cart.length) {
      container.innerHTML =
        '<div class="partner-cart-card">' +
        header +
        '<p class="partner-cart-empty">No items yet. Add products to build an order.</p>' +
        "</div>";
      return;
    }

    var rows = cart
      .map(function (x) {
        var price =
          x.unitPrice === null || x.unitPrice === undefined
            ? "Contact for price"
            : currencySymbol + " " + x.unitPrice;
        var total =
          x.unitPrice === null || x.unitPrice === undefined
            ? ""
            : currencySymbol + " " + (x.unitPrice * (x.qty || 0));
        var weight = x.productWeight ? " · " + PartnerPricing.escapeHtml(x.productWeight) : "";
        return (
          '<div class="partner-cart-row" data-cart-row="' +
          PartnerPricing.escapeHtml(x.productId) +
          '">' +
          '<div class="partner-cart-row-main">' +
          '<p class="partner-cart-item-name">' +
          PartnerPricing.escapeHtml(x.productName) +
          "</p>" +
          '<p class="partner-cart-item-meta">' +
          PartnerPricing.escapeHtml(x.productId) +
          weight +
          "</p>" +
          "</div>" +
          '<div class="partner-cart-row-price">' +
          '<p class="partner-cart-price">' +
          PartnerPricing.escapeHtml(price) +
          "</p>" +
          (total ? '<p class="partner-cart-line-total">' + PartnerPricing.escapeHtml(total) + "</p>" : "") +
          "</div>" +
          '<div class="partner-cart-row-actions">' +
          '<label class="partner-cart-qty-label">Qty</label>' +
          '<input class="partner-cart-qty" type="number" min="1" value="' +
          (x.qty || 1) +
          '" inputmode="numeric" data-cart-qty="' +
          PartnerPricing.escapeHtml(x.productId) +
          '">' +
          '<button type="button" class="btn btn-secondary btn-sm partner-cart-remove" data-cart-remove="' +
          PartnerPricing.escapeHtml(x.productId) +
          '">Remove</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    var note =
      '<div class="partner-cart-note">' +
      '<label for="partner-order-note" class="partner-cart-qty-label">Order note (optional)</label>' +
      '<textarea id="partner-order-note" class="partner-cart-textarea" rows="2" placeholder="Delivery address, preferred time, etc."></textarea>' +
      "</div>";

    var totalLine = totals.hasPrice
      ? '<p class="partner-cart-total">Total (approx): <strong>' +
        PartnerPricing.escapeHtml(currencySymbol + " " + totals.total) +
        "</strong></p>"
      : '<p class="partner-cart-total">Total: <strong>Contact for price</strong></p>';

    var actions =
      '<div class="partner-cart-actions">' +
      '<button type="button" class="btn btn-primary partner-cart-send" data-send="whatsapp">Send on WhatsApp</button>' +
      '<button type="button" class="btn btn-secondary partner-cart-send" data-send="email">Send by email</button>' +
      '<button type="button" class="btn btn-secondary partner-cart-clear" data-cart-clear="1">Clear</button>' +
      "</div>";

    container.innerHTML =
      '<div class="partner-cart-card">' +
      header +
      '<div class="partner-cart-rows">' +
      rows +
      "</div>" +
      note +
      totalLine +
      actions +
      "</div>";
  }

  window.PartnerOrder = {
    getCart: getCart,
    clearCart: clearCart,
    addItem: addItem,
    removeItem: removeItem,
    setQty: setQty,
    renderCart: renderCart,
    buildOrderText: buildOrderText
  };
})();

