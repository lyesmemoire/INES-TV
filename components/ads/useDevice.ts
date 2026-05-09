'use client';

import { useEffect, useState } from 'react';

export type DeviceType = 'mobile' | 'desktop';

/**
 * 📱 DEVICE DETECTION HOOK
 * Provides the current device type (mobile or desktop).
 */
export const useDevice = (): DeviceType => {
  const [device, setDevice] = useState<DeviceType>('desktop');

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WPDesktop/i.test(
        navigator.userAgent
      );

    setDevice(isMobile ? 'mobile' : 'desktop');
  }, []);

  return device;
};
