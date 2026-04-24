/**
 * 💎 PREMIUM STATUS HELPER (Phase 60)
 * Logic to determine if a user gets an ad-free experience.
 */
export function isPremium(user: any) {
  // A user is premium if they have PREMIUM or PRO plan
  return user?.plan === 'PREMIUM' || user?.plan === 'PRO' || user?.isPremium === true;
}
