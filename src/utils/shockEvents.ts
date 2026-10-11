export interface ShockEvent {
  id: string;
  emoji: string;
  title: string;
  amount: number; // positive for expense shock (deduction), negative for cash bonus
  type: 'expense' | 'bonus';
  severity: 'critical' | 'moderate' | 'minor' | 'positive';
  story: string;
  category: 'Emergency' | 'Social' | 'Transit' | 'Income';
  dailyPaceAdvice: string;
  vaultAdvice: string;
}

export const SHOCK_EVENTS_POOL: ShockEvent[] = [
  {
    id: 'shock-phone-screen',
    emoji: '📱',
    title: 'Phone Screen Damaged',
    amount: 1200,
    type: 'expense',
    severity: 'critical',
    category: 'Emergency',
    story: 'Your phone slipped out of your pocket onto asphalt while catching the metro. The Gorilla glass shattered with dead touch lines. Same-day screen replacement costs ₹1,200.',
    dailyPaceAdvice: 'Absorbing this into daily spend will lower your daily safe-to-spend across remaining days.',
    vaultAdvice: 'Using the savings vault keeps your daily allowance undisturbed, but draws down your locked ₹1,500 emergency buffer.',
  },
  {
    id: 'shock-bike-puncture',
    emoji: '🛵',
    title: 'Bike Puncture & Service',
    amount: 450,
    type: 'expense',
    severity: 'minor',
    category: 'Transit',
    story: 'Ran over glass shards on the highway during your commute. Tyre tube replacement, puncture patch, and emergency brake inspection cost ₹450.',
    dailyPaceAdvice: 'Minor hit easily absorbed by cutting 1 or 2 small coffee runs this week.',
    vaultAdvice: 'Recommended to keep your savings vault locked for major crises; let daily spend absorb this.',
  },
  {
    id: 'shock-roommate-birthday',
    emoji: '🎂',
    title: 'Roommate Birthday Share',
    amount: 700,
    type: 'expense',
    severity: 'moderate',
    category: 'Social',
    story: 'Flatmates secretly booked a rooftop booth, custom Basque cheesecake, and a group gift. Your split comes out to ₹700.',
    dailyPaceAdvice: 'Absorbing this in daily budget tests your financial discipline for the rest of the week.',
    vaultAdvice: 'Never raid an emergency savings vault for social events unless absolutely needed.',
  },
  {
    id: 'shock-freelance-gig',
    emoji: '🎉',
    title: 'Unexpected Freelance Gig',
    amount: -600, // Negative expense = Cash Windfall / Bonus
    type: 'bonus',
    severity: 'positive',
    category: 'Income',
    story: 'A quick UI Figma icon kit commissioned last week was approved and client sent ₹600 directly to your UPI ID!',
    dailyPaceAdvice: 'Injects fresh funds directly into your daily safe-to-spend pool for remaining days!',
    vaultAdvice: 'Lock this ₹600 windfall into your savings vault to reinforce your safety cushion.',
  },
  {
    id: 'shock-dental-visit',
    emoji: '🦷',
    title: 'Emergency Dental Visit',
    amount: 850,
    type: 'expense',
    severity: 'moderate',
    category: 'Emergency',
    story: 'Acute wisdom tooth ache at 1 AM. Emergency clinic consultation, X-ray check, and painkiller prescription cost ₹850.',
    dailyPaceAdvice: 'Lowers daily spending capacity moderately. Requires cutting back on weekend food delivery.',
    vaultAdvice: 'Absorbing from the savings vault leaves ₹650 in reserve, keeping your daily lifestyle undisturbed.',
  },
  {
    id: 'shock-late-fee',
    emoji: '💸',
    title: 'Late Fee / Utility Penalty',
    amount: 250,
    type: 'expense',
    severity: 'minor',
    category: 'Emergency',
    story: 'Overlooked the deadline on an exam fee / academic portal surcharge resulting in an unavoidable penalty fee.',
    dailyPaceAdvice: 'Tiny friction of ~₹11/day. Highly manageable within daily leeway.',
    vaultAdvice: 'Keep savings shield locked for true black-swan events.',
  },
];

let lastShockIndex = -1;

/**
 * Returns a shock event, cycling or randomizing without immediate repetition.
 */
export function getNextShockEvent(forcedId?: string): ShockEvent {
  if (forcedId) {
    const found = SHOCK_EVENTS_POOL.find((e) => e.id === forcedId);
    if (found) return found;
  }

  let nextIndex: number;
  do {
    nextIndex = Math.floor(Math.random() * SHOCK_EVENTS_POOL.length);
  } while (nextIndex === lastShockIndex && SHOCK_EVENTS_POOL.length > 1);

  lastShockIndex = nextIndex;
  return SHOCK_EVENTS_POOL[nextIndex];
}
