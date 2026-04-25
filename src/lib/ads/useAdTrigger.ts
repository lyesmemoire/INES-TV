import { triggerPopUnder } from "./popunder";

export function useAdTrigger() {
  function onMatchClick() {
    triggerPopUnder("https://your-ad-network-link.com");
  }

  return { onMatchClick };
}
