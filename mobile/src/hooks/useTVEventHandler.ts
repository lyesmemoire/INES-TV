import { useEffect } from 'react';
/* @ts-ignore - TVEventHandler might not be in standard types */
import { TVEventHandler } from 'react-native';

/**
 * 🎮 TV EVENT HANDLER POLYFILL
 * Staff Level utility to manage physical remote events on Android TV.
 */
export default function useTVEventHandler(callback: (evt: any) => void) {
  useEffect(() => {
    const tvEventHandler = new TVEventHandler();

    tvEventHandler.enable(null, (_: any, evt: any) => {
      if (evt) {
        callback(evt);
      }
    });

    return () => {
      tvEventHandler.disable();
    };
  }, [callback]);
}
