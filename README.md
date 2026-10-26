# Leaning Oak Ranch

Next.js website for Leaning Oak Ranch in Bakersfield, California.

## Getting Started

Use Node.js 24 (`nvm use` reads `.nvmrc`), install dependencies, and run the development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

The site uses `next/font` to self-host Cardo, Josefin Slab, and Open Sans.

## Contact form configuration

Copy `.env.example` to `.env.local`, then set your provider's values. Never commit credentials. The configured SMTP.com integration uses its HTTP API, matching [the working Trends mailer](https://github.com/citrynmarketingdevelopment/trends-frontend/blob/main/src/features/contact/mail.ts).

- `SMTP_API`, `SMTP_CHANNEL`, and `CONTACT_FROM_EMAIL` configure the SMTP.com HTTP API. The channel is its **Name**, not the SMTP login. The API key is not an SMTP password. This configuration takes precedence over direct SMTP and Resend.
- `CONTACT_FROM_EMAIL=contactforms@citryn.com` uses the authenticated sender also used by Trends, with **Leaning Oak Ranch** as the display name. Use a Leaning Oak address only after its domain or individual sender has been verified with SMTP.com.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM_EMAIL` configure optional direct SMTP delivery when the API/channel settings are blank.
- Use port `587` with `SMTP_SECURE=false` for required STARTTLS, or port `465` with `SMTP_SECURE=true` for TLS from connection start. See [Nodemailer's SMTP documentation](https://nodemailer.com/smtp).
- `CONTACT_TO_EMAIL` is the destination mailbox and defaults to `barbara@leaningoakranch.com`. The visitor's address is used as Reply-To; the sender must be authorized by your mail provider.
- When both the API/channel settings and `SMTP_HOST` are blank, `RESEND_API_KEY` and `RESEND_FROM_EMAIL` enable the existing Resend delivery option. Incomplete configuration or failed sends do not fall back to another provider, to avoid duplicate messages.
- Set both `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for the spam check. Without the public key, the form is disabled and shows phone/email alternatives. Public environment variables must be set before building.

Restart the development server after changing environment variables. Configure the same variables in production before deploying. The SMTP.com API uses HTTPS; direct SMTP needs outbound access to the provider's SMTP port. The contact endpoint requires a Node.js runtime and cannot run on a static-only host.

The Cloudflare **Leaning Oak Ranch** managed widget is configured for `leaningoakranch.com` (including its subdomains). Its real keys are stored only in the ignored `.env.local`. The ignored `.env.development.local` uses Cloudflare's public test keys so local previews work without adding localhost to the production widget. Never copy development test keys into production.

The form refreshes its spam challenge after every submission attempt, retains entered information on failure, and records a lead only after the provider accepts the inquiry. The SMTP.com API integration requires a successful response containing a message ID; HTTP success alone is insufficient. The visitor is the Reply-To, and only the configured venue recipient receives the inquiry.

Check production configuration before launch:

```bash
pnpm check:launch
# Verify API authentication, the active channel, and sender-domain status without sending mail:
pnpm check:launch --email
```

`--smtp` remains an alias for checking the configured transport. In API mode it does not attempt an SMTP-password login. An authentication check does not prove inbox delivery; perform an authorized end-to-end delivery test before launch. The configured API key, active channel, and enabled `citryn.com` sender domain were verified on October 26, 2026.

## Google Analytics and Search Console

The rebuild reuses the existing **Leaning Oak Ranch – GA4** property. No new Analytics account or property was created.

| Setting | Value |
| --- | --- |
| Analytics account | `106954060` |
| GA4 property | `382986588` |
| Web stream | `5387010175` |
| Measurement ID | `G-JCNF32VN9M` |
| Search Console property | `sc-domain:leaningoakranch.com` |

On October 22, 2026, the Search Console domain property was linked to the existing web stream. `generate_lead` was configured as a GA4 key event, counted once per event with no default monetary value. Manage the [Search Console link in Analytics](https://analytics.google.com/analytics/web/#/a106954060p382986588/admin/integrations/search-console) or open [Search Console sitemaps](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Aleaningoakranch.com).

Analytics loads only after the visitor accepts optional cookies, and only on `leaningoakranch.com` or `www.leaningoakranch.com`. Local and preview hosts do not send analytics. Visitors can reopen Cookie preferences and withdraw consent. Page views are tracked on initial consent and Next.js navigation; keep the stream's automatic browser-history page-view tracking **off** to avoid duplicates. That setting was verified off during setup. Other automatic enhanced-measurement events are also off.

| Event | Trigger |
| --- | --- |
| `page_view` | Initial consented view and page navigation |
| `generate_lead` | Confirmed successful inquiry delivery |
| `schedule_tour` | Tour link click |
| `click_to_call` | Phone link click |
| `click_email` | Email link click |
| `view_packages` | Package link click |
| `gallery_open` | Gallery image opened |

Form contents are never sent to Analytics. Explicit page-view URLs omit query strings and fragments. The public measurement ID and existing Google HTML verification token are included in `.env.example`; retain the domain's existing DNS verification as well.

This is a Next.js rebuild, so Google tags are integrated directly; the WordPress Site Kit plugin is not needed here. The live domain still serves the earlier WordPress site until this repository is deployed. Verify consented page views and `generate_lead` in GA4 Realtime after deployment and the delivery test.

## SEO and verification

Page titles, descriptions, and canonical URLs are defined in `src/content/site.ts`. The sitemap uses the same page inventory. Next.js serves `src/app/sitemap.ts` at `/sitemap.xml` and `src/app/robots.ts` at `/robots.txt`; physical files in `public` are not needed. `/image-sitemap.xml` lists the venue photographs.

Run `pnpm verify` for lint, types, form/analytics tests, the production build, and asset/SEO checks. Read `SITE_AUDIT.txt` for the earlier live-site comparison and remaining differences.

Both the stable `/sitemap.xml` URL and the currently live WordPress `/sitemap_index.xml` URL were submitted to Search Console on October 22, 2026, and both were verified with **Success** status. This confirms fetching, not completion of indexing. The rebuild redirects the old sitemap index to `/sitemap.xml`. After deployment, confirm Google can fetch the new sitemap and submit `/image-sitemap.xml`, which is not present on the current WordPress site.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
