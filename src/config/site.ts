import { EMAIL_PUBLISHED, PUBLISH_MODE } from 'astro:env/server';

export const SITE = {
  name: 'Allam Ashraf',
  url: 'https://allamashraf.dev',
  locale: 'en',
  location: 'Cairo, Egypt',
  // Shown only when EMAIL_PUBLISHED=true (after the forwarding test passes).
  email: 'allam@allamashraf.dev',
  // Supplied by Allam on 22 Oct 2026; claim "linkedin-url" is VERIFIED. Keep both in sync.
  linkedinUrl: 'https://www.linkedin.com/in/allam-ashraf' as string | null,
  // null unless Allam agrees to list GitHub.
  githubUrl: null as string | null,
  // Approved verbatim (decision 2). Do not edit without Allam.
  availability: 'Open to GTM Engineering & RevOps roles — and selective project collaborations.',
} as const;

export const emailPublished = EMAIL_PUBLISHED;
export const isProd = PUBLISH_MODE === 'prod';
