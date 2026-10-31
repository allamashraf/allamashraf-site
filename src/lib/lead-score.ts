// Lead scorer for the "Lead Field" draft: the prototype's rules and keyword lists exactly as
// supplied by Allam on 22 Oct 2026 (case-insensitive substring match on the message).
// Pure function, no I/O: nothing typed is sent or stored.

export type LeadLabel = 'Hot' | 'Warm' | 'Cold';
export type RuleId = 'budget' | 'price' | 'visit' | 'phone' | 'urgency' | 'short';

export interface FiredRule {
  id: RuleId;
  label: string;
  points: number;
}

export interface LeadScore {
  score: number;
  label: LeadLabel;
  followUpDays: 1 | 2 | 3;
  fired: FiredRule[];
}

export const RULES: Record<RuleId, { label: string; points: number }> = {
  budget: { label: 'Budget given', points: 25 },
  price: { label: 'Price or payment words', points: 20 },
  visit: { label: 'Site-visit words', points: 30 },
  phone: { label: 'Valid phone', points: 10 },
  urgency: { label: 'Urgency words', points: 20 },
  short: { label: 'Empty or under 5 characters', points: -15 },
};

export const KEYWORDS = {
  price: ['price', 'payment', 'installment', 'down payment', 'cash', 'سعر', 'تقسيط', 'دفعة', 'مقدم', 'كاش'],
  visit: ['visit', 'site visit', 'viewing', 'معاينة', 'زيارة', 'اشوف'],
  urgency: ['immediate', 'urgent', 'asap', 'this month', 'دلوقتي', 'فوري', 'حالاً', 'النهارده', 'الشهر ده'],
} as const;

const matches = (message: string, words: readonly string[]) => {
  const text = message.toLowerCase();
  return words.some((w) => text.includes(w.toLowerCase()));
};

export function labelFor(score: number): LeadLabel {
  if (score >= 60) return 'Hot';
  if (score >= 30) return 'Warm';
  return 'Cold';
}

const FOLLOW_UP: Record<LeadLabel, 1 | 2 | 3> = { Hot: 1, Warm: 2, Cold: 3 };

export function scoreLead(message: string, budgetGiven: boolean, validPhone: boolean): LeadScore {
  const fired: FiredRule[] = [];
  const fire = (id: RuleId) => fired.push({ id, ...RULES[id] });

  if (budgetGiven) fire('budget');
  if (matches(message, KEYWORDS.price)) fire('price');
  if (matches(message, KEYWORDS.visit)) fire('visit');
  if (validPhone) fire('phone');
  if (matches(message, KEYWORDS.urgency)) fire('urgency');
  if ([...message.trim()].length < 5) fire('short');

  const raw = fired.reduce((sum, r) => sum + r.points, 0);
  const score = Math.max(0, Math.min(100, raw));
  const label = labelFor(score);
  return { score, label, followUpDays: FOLLOW_UP[label], fired };
}

/** Round-robin over the three fictional reps (illustrative). */
export const REPS = ['Rep A', 'Rep B', 'Rep C'] as const;
export const nextRep = (count: number) => REPS[count % REPS.length] as (typeof REPS)[number];
