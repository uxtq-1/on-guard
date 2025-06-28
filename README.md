# OPS Solutions Services Website

This repository contains the static website for **OPS Solutions Services**. It showcases the company’s business operations, contact center offerings, IT support services and professional staffing solutions.

The site is a traditional front-end project with HTML, CSS and JavaScript and is intended to be hosted on any static web platform such as GitHub Pages, Netlify or Cloudflare Pages.

## Directory Layout

- `index.html` &ndash; main landing page.
- `html/` &ndash; secondary pages (About, Careers, Blog, etc.) and `html/modals/` which holds standalone modal fragments such as the contact form.
- `css/` &ndash; style sheets organised by component:
  - `base/` &ndash; global styles and responsive overrides.
  - `pages/` &ndash; page specific styles including `contact_us.css`.
  - `modals/` &ndash; modal specific styles.
- `js/` &ndash; JavaScript files:
  - `pages/` &ndash; logic for each page, e.g. `contact_us.js` for the contact form.
  - `service-worker.js` &ndash; PWA service worker.
- `manifest.json` &ndash; web app manifest for PWA support.

## Building and Serving

No build step is required. The site can be viewed by running a static web server from the repository root. Example options:

```bash
# Using Node.js
npx serve

# Using Python
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

## Customising the Contact Form `workerUrl`

Form submissions are optionally sent to a Cloudflare Worker. To enable this feature, edit `js/pages/contact_us.js` and set the `workerUrl` constant near the top of the file:

```javascript
// js/pages/contact_us.js
const workerUrl = "https://your-worker.example.com"; // Cloudflare Worker endpoint
```

Leave the value blank to disable submissions. When configured, the form’s data is sent via `POST` to the Worker which should handle the message (e.g. sending an email or storing the data).

## Offline Caching

The service worker pre-caches essential assets listed in `urlsToCache`, including a fallback `offline.html` page. If a network request fails, navigation requests return the offline page so the interface remains functional without connectivity.

### Service Worker Path

The registration call in `js/pages/main.js` registers the worker using:

```javascript
navigator.serviceWorker.register('js/service-worker.js');
```

This assumes the site is served from the root of your domain with the `js` directory at the same level as `index.html`. If your deployment differs, update the path accordingly so the service worker can be found.

