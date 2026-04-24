import { useEffect } from "react";
import { TVEventHandler } from "react-native";

/**
 * Hook to manage D-Pad / Remote control events for Android TV.
 * @param onEvent Callback function to handle specific event types.
 */
export function useTVRemote(onEvent?: (event: string) => void) {
  useEffect(() => {
    // @ts-ignore - TVEventHandler might not be in standard mobile types
    const handler = new TVEventHandler();

    handler.enable(null, (_: any, evt: any) => {
      if (!evt) return;

      console.log("TV EVENT:", evt.eventType);

      onEvent?.(evt.eventType);
    });

    return () => handler.disable();
  }, [onEvent]);
}
