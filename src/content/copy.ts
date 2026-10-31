// Site copy. Reviewed and approved by Allam on 22 Oct 2026 (Sprint 1 content review).
// Any new or changed entry goes back to PROPOSED until he approves it.
// Factual statements do not live here: they live in claims.yaml.

type CopyStatus = 'PROPOSED' | 'APPROVED';

export const hero = {
  status: 'APPROVED' as CopyStatus,
  eyebrow: 'GTM engineering · Lead operations · Automation',
  h1: 'I build the systems that move leads from first click to the sales team',
  // The subhead holds facts, so it is rendered from claims.yaml (id: hero-subhead).
  subheadClaim: 'hero-subhead',
  // Phones (<768px) show this shorter version instead (approved by Allam, mobile pass).
  subheadMobileClaim: 'hero-subhead-mobile',
  primaryCta: 'View work',
  emailCta: 'Email me',
  contactCta: 'Contact',
};

export const signal = {
  status: 'APPROVED' as CopyStatus,
  title: 'How a lead moves',
  intro: 'Five stations between a click and a conversation. This is the path my work is built around.',
  stations: [
    { id: 'click', label: 'Click', sentence: 'A visitor lands from an ad, a search, or a link.' },
    { id: 'capture', label: 'Capture', sentence: 'The form or chat captures who they are — cleanly, once.' },
    { id: 'qualify', label: 'Qualify', sentence: 'Rules and questions decide how warm the lead is.' },
    { id: 'route', label: 'Route', sentence: 'The lead goes to the right rep — fairly, and fast.' },
    { id: 'respond', label: 'Respond', sentence: 'A human follows up while the intent is still fresh.' },
  ],
  gate: ['email', 'duplicate', 'score'],
  lanes: ['Rep A', 'Rep B', 'Rep C'],
  illustrative: 'Illustrative · fictional data',
};

export const work = {
  status: 'APPROVED' as CopyStatus,
  title: 'Selected work',
  intro:
    'One system I built and shipped for AOG Developments, one site I built that never launched, and one tested prototype. Each page says what I did, what I did not, and what is not measured.',
  readMore: 'Read case study',
};

export const capabilities = {
  status: 'APPROVED' as CopyStatus,
  title: 'What I work on',
  groups: [
    {
      title: 'CRM & lead lifecycle design',
      body: 'Stages, fields and handoffs that keep a lead from going cold between marketing and sales.',
      // No Tools line: this is process design, not a platform run in production (Allam, 22 Oct 2026).
      toolsClaim: null,
    },
    {
      title: 'Workflow automation',
      body: 'Webhooks, validation and routing logic that run the same way every time.',
      toolsClaim: 'cap-automation-tools',
    },
    {
      title: 'Web builds & internal tools',
      body: 'Landing pages, bilingual flows, and offline touch-screen tools for the sales floor.',
      toolsClaim: 'cap-frontend-tools',
    },
    {
      title: 'Paid acquisition & tracking',
      body: 'Running media buying, then knowing where each lead came from and where it stalled, before anything is automated.',
      toolsClaim: 'cap-tracking-tools',
    },
  ],
};

export const approach = {
  status: 'APPROVED' as CopyStatus,
  title: 'How I work',
  principles: [
    { title: 'Map the journey before automating it', body: 'A workflow is only as good as the handoff it replaces.' },
    { title: 'Test with fictional data first', body: 'My current builds run against fixtures before any real lead touches them.' },
    { title: 'Document the limits', body: 'Every project states what was mocked, what broke, and what was not measured.' },
  ],
  aboutLink: 'More about me',
};

export const contact = {
  status: 'APPROVED' as CopyStatus,
  title: 'Let’s route this conversation.',
  copy: 'Copy',
  copied: 'Email address copied',
  linkedin: 'LinkedIn',
};

export const notFound = {
  status: 'APPROVED' as CopyStatus,
  title: 'Signal lost.',
  body: 'This page does not exist, or it moved. The work is still where it was.',
};

export const caseTemplate = {
  status: 'APPROVED' as CopyStatus,
  sections: [
    'Status',
    'Context',
    'Problem',
    'My role (and what I didn’t do)',
    'Constraints',
    'Architecture / workflow',
    'What I built',
    'Evidence',
    'Verified outcome',
    'Limitations',
    'Next step',
  ],
  pending: 'Not yet published. Evidence for this section is still being gathered.',
  notMeasured: 'Not measured.',
  diagramCaption: 'Illustrative diagram — not a production screenshot',
};
