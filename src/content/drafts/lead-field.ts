// "Lead Field" draft (review build only; never in build:prod). Everything here is PROPOSED
// and awaits Allam's review. Facts are listed under `claims` so they can move into
// claims.yaml if the draft is adopted.

export const leadField = {
  status: 'PROPOSED' as const,
  draftBanner: 'Draft · not linked anywhere · review build only · copy proposed',
  title: 'Lead Field',
  intro: 'Every dot is a fictional lead. They pass one scoring gate and split by how warm they are. Type a message below and route a lead of your own.',
  stage: {
    gate: 'Scoring gate',
    illustrative: 'Illustrative · fictional data',
    description:
      'Animated illustration: fictional leads flow from the left, pass a scoring gate in the middle and split into three streams labelled Hot, Warm and Cold.',
  },
  scorer: {
    heading: 'Score a lead',
    messageLabel: 'Lead message, in Arabic or English',
    examplesLabel: 'Examples',
    examples: [
      { label: 'Arabic', text: 'عايز أعمل معاينة النهارده وأعرف التقسيط' },
      { label: 'English', text: 'What is the price? I can pay cash this month.' },
      { label: 'Too short', text: 'Hi' },
    ],
    budget: 'Budget given',
    phone: 'Valid phone',
    route: 'Route this lead',
    scoreLabel: 'Score',
    rulesHeading: 'Rules',
    applied: 'applied',
    notApplied: 'not applied',
    routedTo: 'Routed to',
    followUp: (days: number) => `follow-up in ${days} day${days === 1 ? '' : 's'}`,
    routingNote: 'Illustrative round-robin across three fictional reps.',
    privacy: 'Runs in your browser. Nothing you type is sent or stored.',
    noScript: 'The scorer runs in your browser and needs JavaScript. The rules and one worked example are below.',
    exampleHeading: 'Worked example',
  },
  claims: [
    { id: 'lf-rules', text: 'Scoring rules from my lead-routing prototype: budget given +25, price or payment words +20, site-visit words +30, valid phone +10, urgency words +20, empty or under 5 characters -15, clamped 0 to 100.', status: 'USER_REPORTED', copy: 'PROPOSED' },
    { id: 'lf-thresholds', text: '60 and above is Hot, 30 to 59 is Warm, under 30 is Cold, with follow-up in 1, 2 or 3 days.', status: 'USER_REPORTED', copy: 'PROPOSED' },
    { id: 'lf-privacy', text: 'Runs in your browser. Nothing you type is sent or stored.', status: 'VERIFIED (by e2e test)', copy: 'PROPOSED' },
  ],
};
