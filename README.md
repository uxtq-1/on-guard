# Ops Online Support Services Website

This repository contains the static website for **Ops Online Support Services**. It showcases the company’s business operations, contact center offerings, IT support services and professional staffing solutions.

The site is a traditional front-end project with HTML, CSS and JavaScript and is intended to be hosted on any static web platform such as GitHub Pages, Netlify or Cloudflare Pages.

## Directory Layout

- `index.html` &ndash; main landing page.
- `html/` &ndash; secondary pages (About, Careers, Blog, etc.) and `html/modals/` which holds standalone modal fragments such as the contact form.
- `css/` &ndash; style sheets organised by component:
  - `base/` &ndash; global styles and responsive overrides.
  - `chatbot_creation/` &ndash; styles for the chatbot creation interface.
  - `modals/` &ndash; styles for the individual modals such as `contact_us_modal.css`.
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

### Troubleshooting
When the site is opened directly from the filesystem using `file://`, modals may fail to load. Browsers block `fetch()` requests in this context, which prevents the modal HTML fragments from being retrieved. Run a local static server (e.g. `npx serve` or `python3 -m http.server`) before testing to avoid this issue.

## Customising the Contact Form Endpoint

Form submissions are optionally sent to a Cloudflare Worker. The script `js/pages/contact_us.js` looks for a global variable named `CONTACT_WORKER_URL` and falls back to an empty string if it is not set. Define this variable in the page before the script is loaded, or edit the file directly, to point to your worker:

```html
<script>
  window.CONTACT_WORKER_URL = "https://your-worker.example.com";
</script>
<script type="module" src="js/pages/contact_us.js" defer></script>
```

When configured, the form’s data is sent via `POST` to the Worker which should handle the message (for example by sending an email or storing the data). Leaving the value unset disables submissions.

## License

This project is licensed under the [MIT License](LICENSE).

