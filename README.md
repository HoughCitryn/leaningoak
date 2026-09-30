# Leaning Oak Ranch

Next.js website for Leaning Oak Ranch in Bakersfield, California.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

The site uses `next/font` to self-host Cardo, Josefin Slab, and Open Sans.

## Contact form configuration

Copy `.env.example` to `.env.local`, then set your provider's values. Never commit credentials.

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM_EMAIL` configure SMTP delivery.
- Use port `587` with `SMTP_SECURE=false` for required STARTTLS, or port `465` with `SMTP_SECURE=true` for TLS from connection start. See [Nodemailer's SMTP documentation](https://nodemailer.com/smtp).
- `CONTACT_TO_EMAIL` is the destination mailbox and defaults to `barbara@leaningoakranch.com`. The visitor's address is used as Reply-To; the sender must be authorized by your mail provider.
- When `SMTP_HOST` is blank, `RESEND_API_KEY` and `RESEND_FROM_EMAIL` enable the existing Resend delivery option. A failed SMTP send is not automatically retried through Resend, to avoid duplicate messages.
- Set both `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for the spam check. Without the public key, the form is disabled and shows phone/email alternatives. Public environment variables must be set before building.

Restart the development server after changing environment variables. Configure the same variables in production before deploying. SMTP needs a Node.js server with outbound access to the provider's port. The contact endpoint cannot run on a static-only host.

## SEO and verification

Page titles, descriptions, and canonical URLs are defined in `src/content/site.ts`. The sitemap uses the same page inventory. Next.js serves `src/app/sitemap.ts` at `/sitemap.xml` and `src/app/robots.ts` at `/robots.txt`; physical files in `public` are not needed. `/image-sitemap.xml` lists the venue photographs.

Run `pnpm verify` for lint, types, inquiry tests, the production build, and asset/SEO checks. Read `SITE_AUDIT.txt` for the live-site comparison and remaining differences.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
