# Ahluwalia Farm

Display website for **Ahluwalia Farm** — organic multiflora honey and cage-free eggs from Amritsar, Punjab.

## View locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

Use a local server (not `file://`) so partner pages can load `data/products.json`.

## Structure

- `index.html` — single-page site (Home, Product, About Us, Contact)
- `products/` — product categories and detail pages
- `partner/` — password-protected distributor and retailer pricing
- `data/products.json` — trade prices (wholesale, trade, retail)
- `css/styles.css` — styles
- `js/main.js` — navigation and subtle animations
- `js/auth.js`, `js/partner-*.js` — partner login and catalog
- `assets/` — logo and product images

## Partner pricing (distributors & retailers)

### URLs to share

| Role | Login URL |
|------|-----------|
| Distributor | `/partner/distributor/login.html` |
| Retailer | `/partner/retailer/login.html` |

After login, partners see a product catalog with role-specific prices:

- **Distributor:** wholesale (farm → distributor) and sell-to-retailer
- **Retailer:** your cost (trade) and suggested retail

### Default passwords (change after first deploy)

| Role | Default password |
|------|------------------|
| Distributor | `ahluwalia-dist-2026` |
| Retailer | `ahluwalia-retail-2026` |

### Change passwords

1. Generate a SHA-256 hash:

   ```bash
   python3 scripts/hash-password.py "your-new-password"
   ```

2. Paste the hash into [`js/auth-config.js`](js/auth-config.js):
   - `distributorPasswordHash` — distributor login
   - `retailerPasswordHash` — retailer login

3. Republish the site. Never commit plaintext passwords.

To start from the template, copy [`js/auth-config.example.js`](js/auth-config.example.js) to `auth-config.js` and add your hashes.

### Update product prices

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

After editing JSON, refresh the partner catalog in the browser (no HTML changes needed for price updates).

### Security note

Login runs in the browser on static hosting (e.g. GitHub Pages). Password hashes hide trade prices from casual visitors, but a technical user could inspect the deployed site. For stronger protection, use host-level access control (e.g. Netlify/Cloudflare) or a backend later.

Partner catalog pages use `noindex` so search engines are less likely to list them.

## Publish to GitHub

```bash
./publish-to-github.sh
```
