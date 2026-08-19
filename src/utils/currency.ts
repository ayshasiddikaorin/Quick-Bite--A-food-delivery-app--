/**
 * Format an amount as Bangladeshi Taka (BDT), whole taka without decimals.
 * Uses the Bangladeshi/Indian grouping style (lakh/crore), e.g. BDT 1,25,000.
 */
export function formatBDT(amount: number): string {
  const whole = Math.round(amount);
  return `BDT ${whole.toLocaleString('en-IN')}`;
}

/** Round to nearest whole taka. */
export function roundTaka(amount: number): number {
  return Math.round(amount);
}
