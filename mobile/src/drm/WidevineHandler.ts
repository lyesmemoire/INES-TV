/**
 * 🔐 DRM WIDEVINE HANDLER (Phase 50)
 * Centralized configuration for content protection across Android devices.
 * Integrates with VideoPlayer to securely fetch decryption keys.
 */
export default {
  /**
   * Generates the DRM configuration object for VideoPlayer.
   * Note: License server URL and tokens are secured via env variables in production.
   */
  getConfig: async (url: string) => ({
    type: "widevine", // Native DRM for Android
    licenseServer: process.env.EXPO_PUBLIC_DRM_LICENSE_URL || "https://license.INES TV.pro/widevine",
    headers: {
      "Authorization": `Bearer ${process.env.EXPO_PUBLIC_DRM_TOKEN || "DEFAULT_TOKEN"}`
    },
  }),
};
