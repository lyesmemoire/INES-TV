package com.streamperf.tv.ads

/**
 * 🎁 REWARDED AD MANAGER
 * Zero-damage UX logic: Value exchange (User watches an ad -> Unlocks fast zap or premiums).
 */
class RewardedAdManager {

    fun canOfferReward(): Boolean {
        return true
    }

    fun showRewardedAd(
        provider: AdProvider,
        onReward: () -> Unit
    ) {
        println("Showing rewarded ad: ${provider.name}")

        // simulate success
        onReward()
    }
}
