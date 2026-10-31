import { getEntry } from 'astro:content';
import { isProd } from '../config/site';

/** True when <Claim id> will render something in this build (mirrors Claim.astro). */
export async function claimRenders(id: string): Promise<boolean> {
  const claim = await getEntry('claims', id);
  if (!claim) throw new Error(`Claim "${id}" is not in src/content/claims.yaml`);
  const { status } = claim.data;
  return !isProd || status === 'VERIFIED' || status === 'USER_REPORTED';
}
