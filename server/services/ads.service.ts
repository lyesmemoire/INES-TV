export function getAdConfig(user: any) {
  if (!user) {
    return {
      type: "guest",
      preRoll: true,
      midRollInterval: 1200, // 20 min
      adTag: process.env.AD_TAG_GUEST,
    };
  }

  if (user.plan === "FREE") {
    return {
      type: "free",
      preRoll: true,
      midRollInterval: 1800, // 30 min
      adTag: process.env.AD_TAG_FREE,
    };
  }

  return {
    type: "premium",
    preRoll: false,
    midRollInterval: null,
    adTag: null,
  };
}

export function getAdStrategy(user: any) {
  if (!user) return "AGGRESSIVE";

  const sessionTime = user.sessionTime || 0;

  if (user.plan === "PREMIUM" || user.isPremium) return "NONE";

  if (sessionTime < 60) return "LIGHT"; // onboarding

  if (sessionTime > 300) return "STRONG"; // engagé

  return "MEDIUM";
}
