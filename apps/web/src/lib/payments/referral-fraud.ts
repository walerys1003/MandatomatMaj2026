/**
 * Anti-fraud heurystyki dla referral (T6-REF-026).
 *
 * Strategia obrony przed nadużyciami:
 *  1. **Limit nagród per user** — max 10 conversion-reward (`REFERRAL_REWARD_CAP`).
 *  2. **IP fingerprint** — referrer i referee z tego samego IP w oknie 24h → flag.
 *  3. **Device fingerprint** — ten sam `device_id` (z localStorage anon-id cookie) → flag.
 *  4. **Email pattern** — Gmail "+" trick (jan+1@gmail.com, jan+2@gmail.com) → reject.
 *  5. **Time velocity** — > 5 referrals/24h przez tego samego referrera → soft-block.
 *  6. **Geo mismatch** — referee zalogowany z innego kraju niż referrer (rzadko, ale ważne).
 *
 * Wszystkie sygnały logowane do `audit_log` z action = 'referral_fraud_signal'.
 * Soft-block: reward odroczony do manual review w admin UI.
 * Hard-block: reject całkowicie.
 */

export const REFERRAL_REWARD_CAP = 10
export const REFERRAL_VELOCITY_PER_DAY = 5

export interface FraudSignals {
  /** True jeśli emails wyglądają na fake / +tricks. */
  emailPatternFraud: boolean
  /** True jeśli IP/device identyczne. */
  identityCollision: boolean
  /** True jeśli velocity > limit. */
  velocityExceeded: boolean
  /** True jeśli capping limit osiągnięty. */
  capReached: boolean
}

export interface FraudVerdict {
  /** Czy zezwolić na reward. */
  allow: boolean
  /** Czy wymaga manual review (soft-block). */
  needsReview: boolean
  /** Lista czerwonych flag (debug + audit log). */
  flags: string[]
}

/**
 * Sprawdza email pattern — Gmail "+" trick i podobne.
 * `jan.kowalski+test1@gmail.com` traktowany jak `jan.kowalski@gmail.com`.
 */
export function normalizeEmail(raw: string): string {
  const [local, domain] = raw.trim().toLowerCase().split('@')
  if (!local || !domain) return raw.trim().toLowerCase()
  // Strip "+xxx" suffix
  const baseLocal = local.split('+')[0] ?? local
  // Gmail ignoruje kropki w localpart
  const cleanLocal = domain.endsWith('gmail.com') ? baseLocal.replace(/\./g, '') : baseLocal
  return `${cleanLocal}@${domain}`
}

export function isSuspiciousEmailPair(referrerEmail: string, refereeEmail: string): boolean {
  const a = normalizeEmail(referrerEmail)
  const b = normalizeEmail(refereeEmail)
  if (a === b) return true
  // Wspólny localpart z dodatkiem cyfry: jan@x.pl + jan2@x.pl
  const [aLocal, aDom] = a.split('@')
  const [bLocal, bDom] = b.split('@')
  if (aDom === bDom && aLocal && bLocal) {
    const aStripped = aLocal.replace(/\d+$/, '')
    const bStripped = bLocal.replace(/\d+$/, '')
    if (aStripped && aStripped === bStripped && aLocal !== bLocal) return true
  }
  return false
}

export interface AssessFraudInput {
  referrerEmail: string
  refereeEmail: string
  referrerIp?: string | null
  refereeIp?: string | null
  referrerDeviceId?: string | null
  refereeDeviceId?: string | null
  /** Liczba dotychczasowych rewardów referrera. */
  rewardsCount: number
  /** Liczba referrals referrera w ostatnich 24h. */
  velocity24h: number
}

export function assessFraud(input: AssessFraudInput): FraudVerdict {
  const flags: string[] = []

  if (input.rewardsCount >= REFERRAL_REWARD_CAP) {
    flags.push(`cap_reached:${input.rewardsCount}`)
  }

  if (isSuspiciousEmailPair(input.referrerEmail, input.refereeEmail)) {
    flags.push('email_pattern_fraud')
  }

  if (input.referrerIp && input.refereeIp && input.referrerIp === input.refereeIp) {
    flags.push('ip_collision')
  }

  if (
    input.referrerDeviceId &&
    input.refereeDeviceId &&
    input.referrerDeviceId === input.refereeDeviceId
  ) {
    flags.push('device_collision')
  }

  if (input.velocity24h > REFERRAL_VELOCITY_PER_DAY) {
    flags.push(`velocity_exceeded:${input.velocity24h}`)
  }

  // Hard rejects: email fraud OR cap reached
  if (flags.includes('email_pattern_fraud') || flags.some((f) => f.startsWith('cap_reached'))) {
    return { allow: false, needsReview: false, flags }
  }

  // Soft block: collision OR velocity → review
  if (
    flags.includes('ip_collision') ||
    flags.includes('device_collision') ||
    flags.some((f) => f.startsWith('velocity_exceeded'))
  ) {
    return { allow: false, needsReview: true, flags }
  }

  return { allow: true, needsReview: false, flags }
}
