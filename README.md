# Ahluwalia Farm

Display website for **Ahluwalia Farm** — organic multiflora honey and cage-free eggs from Amritsar, Punjab.

## View locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

Use a local server (not `file://`) so partner pages can load `data/products.json` and `data/partners.json`.

## Structure

- `index.html` — single-page site (Home, Product, About Us, Contact)
- `products/` — product categories and detail pages
- `partner/` — partner login, categories, product detail, and ordering
- `data/products.json` — product catalog and default trade prices
- `data/partners.json` — partner accounts (ID, password hash, per-partner price overrides)
- `css/styles.css` — styles
- `js/main.js` — navigation and subtle animations
- `js/auth.js`, `js/partner-*.js` — partner login, catalog, cart, and orders
- `assets/` — logo and product images (use URL-safe filenames, e.g. `honey-main.png`)

## Partner pricing (distributors & retailers)

### URLs to share

| Role | Login URL |
|------|-----------|
| Distributor | `/partner/distributor/login.html` |
| Retailer | `/partner/retailer/login.html` |

### Partner flow after login

1. **Catalog** (`catalog.html`) — choose a category (same four categories as the public home page)
2. **Category** (`category.html?cat=honey`) — browse products with partner-specific prices
3. **Product** (`product.html?id=...`) — view details and **Add to order**
4. **Order** (`order.html`) — review cart, then send via **WhatsApp** or **email**

The header shows **Order (N)** on all partner pages (item count in cart).

### Sample partner accounts

| Role | Partner ID | Default password |
|------|------------|------------------|
| Distributor | `DIST001` | `ahluwalia-dist-2026` |
| Retailer | `RET001` | `ahluwalia-retail-2026` |

### Add or edit partners

Edit [`data/partners.json`](data/partners.json). Each partner needs:

- `id` — login Partner ID (e.g. `DIST002`)
- `role` — `distributor` or `retailer`
- `name` — display name
- `passwordHash` — SHA-256 of their password (see below)
- `priceOverrides` — optional per-product prices (product `id` as key)

Generate a password hash:

```bash
python3 scripts/hash-password.py "their-password"
```

### Update product prices (default for all partners)

Edit [`data/products.json`](data/products.json). Each product has:

```json
"prices": {
  "wholesale": 300,
  "trade": 350,
  "retail": 400
}
```

Use `null` for any price that is not set yet (shows “Contact for price” in partner views).

| Field | Meaning |
|-------|---------|
| `wholesale` | Farm price to distributor (distributors only) |
| `trade` | Distributor price to retailer (distributors and retailers) |
| `retail` | Suggested end-customer price (retailers only) |

Egg products are separate SKUs: `eggs-6-pack`, `eggs-12-pack`, `eggs-30-pack`.

After editing JSON, refresh the partner pages in the browser.

### Security note

Login runs in the browser on static hosting (e.g. GitHub Pages). Password hashes and partner data are visible to anyone who inspects the deployed site. For stronger protection, use host-level access control or a backend later.

Partner pages use `noindex` so search engines are less likely to list them.

## Publish to GitHub

```bash
./publish-to-github.sh
```
