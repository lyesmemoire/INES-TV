let triggered = false;

export function triggerPopUnder(url: string) {
  if (typeof window === "undefined") return;
  if (triggered) return;

  try {
    const win = window.open(url, "_blank");

    if (win) {
      win.blur();
      window.focus();
      triggered = true;

      console.log("[Ad] Popunder triggered");
    }
  } catch (err) {
    console.warn("[Ad] Popunder blocked", err);
  }
}
