(function () {
  "use strict";

  var SESSION_ROLE = "partnerRole";
  var SESSION_AUTH = "partnerAuth";
  var SESSION_PARTNER_ID = "partnerId";
  var SESSION_PARTNER_NAME = "partnerName";
  var SESSION_PARTNER_OVERRIDES = "partnerPriceOverrides";
  var AUTH_TOKEN = "authenticated";

  function getConfig() {
    return window.AUTH_CONFIG || {};
  }

  function hashPassword(password) {
    var encoder = new TextEncoder();
    return crypto.subtle
      .digest("SHA-256", encoder.encode(password))
      .then(function (buffer) {
        return Array.from(new Uint8Array(buffer))
          .map(function (b) {
            return b.toString(16).padStart(2, "0");
          })
          .join("");
      });
  }

  function setSession(role) {
    sessionStorage.setItem(SESSION_ROLE, role);
    sessionStorage.setItem(SESSION_AUTH, AUTH_TOKEN);
  }

  function setPartnerSession(partner) {
    if (!partner) return;
    sessionStorage.setItem(SESSION_PARTNER_ID, partner.id || "");
    sessionStorage.setItem(SESSION_PARTNER_NAME, partner.name || "");
    sessionStorage.setItem(
      SESSION_PARTNER_OVERRIDES,
      JSON.stringify(partner.priceOverrides || {})
    );
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_ROLE);
    sessionStorage.removeItem(SESSION_AUTH);
    sessionStorage.removeItem(SESSION_PARTNER_ID);
    sessionStorage.removeItem(SESSION_PARTNER_NAME);
    sessionStorage.removeItem(SESSION_PARTNER_OVERRIDES);
  }

  function getSessionRole() {
    if (sessionStorage.getItem(SESSION_AUTH) !== AUTH_TOKEN) {
      return null;
    }
    return sessionStorage.getItem(SESSION_ROLE);
  }

  function login(role, password) {
    var config = getConfig();
    var expected =
      role === "distributor"
        ? config.distributorPasswordHash
        : config.retailerPasswordHash;

    if (!expected || expected.indexOf("REPLACE_") === 0) {
      return Promise.resolve({
        ok: false,
        message: "Login is not configured. Set password hashes in js/auth-config.js."
      });
    }

    return hashPassword(password).then(function (hash) {
      if (hash === expected) {
        setSession(role);
        return { ok: true };
      }
      return { ok: false, message: "Incorrect password. Please try again." };
    });
  }

  function loadPartners(root) {
    var base = root || "/";
    return fetch(base + "data/partners.json").then(function (res) {
      if (!res.ok) {
        throw new Error("Could not load partner accounts.");
      }
      return res.json();
    });
  }

  function findPartnerById(partners, id) {
    if (!partners || !Array.isArray(partners)) return null;
    var wanted = (id || "").trim();
    if (!wanted) return null;
    return (
      partners.find(function (p) {
        return String(p.id || "").trim().toLowerCase() === wanted.toLowerCase();
      }) || null
    );
  }

  function loginWithId(role, partnerId, password, root) {
    var id = (partnerId || "").trim();
    if (!id) {
      return Promise.resolve({ ok: false, message: "Please enter your Partner ID." });
    }
    if (!password) {
      return Promise.resolve({ ok: false, message: "Please enter your password." });
    }

    return loadPartners(root)
      .then(function (data) {
        var partner = findPartnerById(data && data.partners, id);
        if (!partner) {
          return { ok: false, message: "Partner ID not found." };
        }
        if (partner.role !== role) {
          return { ok: false, message: "This Partner ID is not allowed for this login page." };
        }
        if (!partner.passwordHash) {
          return { ok: false, message: "This account is not configured yet." };
        }

        return hashPassword(password).then(function (hash) {
          if (hash !== partner.passwordHash) {
            return { ok: false, message: "Incorrect password. Please try again." };
          }
          setSession(role);
          setPartnerSession(partner);
          return { ok: true };
        });
      })
      .catch(function (err) {
        return { ok: false, message: (err && err.message) || "Login failed." };
      });
  }

  function logout() {
    clearSession();
  }

  function requireRole(role, loginPath) {
    var current = getSessionRole();
    if (current !== role) {
      window.location.replace(loginPath);
      return false;
    }
    return true;
  }

  function isAuthenticated(role) {
    return getSessionRole() === role;
  }

  function getPartnerId() {
    if (sessionStorage.getItem(SESSION_AUTH) !== AUTH_TOKEN) {
      return null;
    }
    var id = sessionStorage.getItem(SESSION_PARTNER_ID);
    return id ? id : null;
  }

  function getPartnerName() {
    if (sessionStorage.getItem(SESSION_AUTH) !== AUTH_TOKEN) {
      return null;
    }
    var name = sessionStorage.getItem(SESSION_PARTNER_NAME);
    return name ? name : null;
  }

  function getPartnerPriceOverrides() {
    if (sessionStorage.getItem(SESSION_AUTH) !== AUTH_TOKEN) {
      return {};
    }
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_PARTNER_OVERRIDES) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  window.PartnerAuth = {
    login: login,
    loginWithId: loginWithId,
    logout: logout,
    requireRole: requireRole,
    isAuthenticated: isAuthenticated,
    getSessionRole: getSessionRole,
    getPartnerId: getPartnerId,
    getPartnerName: getPartnerName,
    getPartnerPriceOverrides: getPartnerPriceOverrides
  };
})();
