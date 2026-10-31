import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const claimStatus = z.enum(['VERIFIED', 'USER_REPORTED', 'NEEDS_EVIDENCE', 'NOT_FOR_PUBLICATION']);
export const projectStatus = z.enum(['DELIVERED', 'UNRELEASED', 'PROTOTYPE', 'CONCEPT', 'IN_PROGRESS']);

const PLACEHOLDER = '[[PLACEHOLDER';

const claims = defineCollection({
  loader: file('src/content/claims.yaml'),
  schema: z
    .object({
      text: z.string().min(1),
      status: claimStatus,
      // Public-safe pointer only. Never a path into evidence/ or a private URL.
      evidenceRef: z.string().min(1),
      copy: z.enum(['PROPOSED', 'APPROVED']).optional(),
      approvedBy: z.string().nullable().optional(),
      date: z.string().nullable().optional(),
    })
    .refine((c) => !(c.text.includes(PLACEHOLDER) && (c.status === 'VERIFIED' || c.status === 'USER_REPORTED')), {
      message: 'A claim containing [[PLACEHOLDER]] must not be VERIFIED or USER_REPORTED',
    }),
});

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '*.mdx' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    order: z.number().int(),
    projectStatus,
    statusLine: z.string(),
    org: z.string().optional(),
    // Factual fields point at the claims ledger so prod can withhold them.
    summaryClaim: z.string(),
    roleClaim: z.string(),
    yearClaim: z.string(),
    toolsClaim: z.string(),
    durationClaim: z.string().optional(),
    coverKind: z.enum(['screenshot', 'illustrative']),
    diagram: z.enum(['hotel', 'routing', 'showroom']),
    description: z.string(),
  }),
});

const timeline = defineCollection({
  loader: file('src/content/timeline.yaml'),
  schema: z.object({
    org: z.string(),
    order: z.number().int(),
    kind: z.enum(['work', 'education']),
    roleClaim: z.string(),
    summaryClaim: z.string().optional(),
    startYear: z.number().int().optional(),
    endYear: z.number().int().optional(),
    // Small mono caption for the thematic arc. Lives inside a dated node, never on its own.
    arc: z.string().optional(),
    published: z.boolean(),
  }),
});

const lab = defineCollection({
  loader: file('src/content/lab.yaml'),
  schema: z.object({
    title: z.string(),
    projectStatus,
    note: z.string(),
    summaryClaim: z.string(),
    published: z.boolean(),
  }),
});

export const collections = { claims, work, timeline, lab };
