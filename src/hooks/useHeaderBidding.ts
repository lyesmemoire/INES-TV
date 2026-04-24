declare global {
  interface Window {
    pbjs: any;
  }
}

/**
 * Initialize Header Bidding and return a promise that resolves
 * when bids are returned or the timeout is reached.
 */
export const initHeaderBidding = (adUnitCode: string, timeout: number = 1000): Promise<string[]> => {
  return new Promise((resolve) => {
    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];

    const adUnit = {
      code: adUnitCode,
      mediaTypes: {
        video: {
          context: "instream",
          playerSize: [640, 360],
          mimes: ["video/mp4", "application/x-mpegURL"],
          protocols: [2, 3, 5, 6],
          playbackmethod: [2, 4, 6],
          maxduration: 30,
        },
      },
      bids: [
        {
          bidder: "appnexus",
          params: { placementId: "12345678" },
        },
        {
          bidder: "rubicon",
          params: { accountId: "1234", siteId: "5678", zoneId: "91011" },
        },
      ],
    };

    window.pbjs.que.push(() => {
      // Clear previous ad units if any to prevent duplicates on re-mount
      window.pbjs.removeAdUnit(adUnitCode);
      window.pbjs.addAdUnits([adUnit]);

      window.pbjs.requestBids({
        timeout,
        adUnitCodes: [adUnitCode],
        bidsBackHandler: () => {
          // Prebid is done, resolve with targeting keywords
          const targeting = window.pbjs.getAdserverTargeting();
          const keywords = targeting[adUnitCode] ? Object.keys(targeting[adUnitCode]).map(k => `${k}=${targeting[adUnitCode][k]}`) : [];
          console.log(`[HeaderBidding] Bids back for ${adUnitCode}:`, keywords);
          resolve(keywords);
        },
      });
    });
  });
};
