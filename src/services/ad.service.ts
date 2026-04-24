import axios from "axios";

const providers = [
  "google",
  "appnexus",
  "rubicon",
];

export const getVastWithFallback = async (user: any) => {
  for (const provider of providers) {
    try {
      const vastUrl = buildUrl(provider, user);

      const res = await axios.get(vastUrl, { timeout: 2000 });

      if (res.status === 200 && res.data.includes("<VAST")) {
        return { vastUrl, provider };
      }
    } catch (e) {
      console.warn(`Failover: ${provider} failed`);
    }
  }

  return { vastUrl: null, provider: null };
};

const buildUrl = (provider: string, user: any) => {
  switch (provider) {
    case "google":
      return `https://pubads.g.doubleclick.net/gampad/ads?iu=/12345/abc&sz=640x480&output=xml_vast4&unviewed_position_start=1&env=vp&gdfp_req=1&description_url=[description_url]&correlator=${Date.now()}`;

    case "appnexus":
      return `https://ib.adnxs.com/ut/vast?placement_id=123456&user_id=${user?.id || 'guest'}`;

    case "rubicon":
      return `https://ads.rubiconproject.com/ad/1234.xml?site=5678&zone=91011&width=640&height=360`;

    default:
      return "";
  }
};
