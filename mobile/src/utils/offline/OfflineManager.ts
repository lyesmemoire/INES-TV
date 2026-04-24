import RNFS from "react-native-fs";
import logger from "../../services/logger";

/**
 * 📦 OFFLINE CONTENT MANAGER (Phase 50)
 * Handles encrypted stream caching for Premium users.
 * Utilizes the device's native file system for long-term storage of OTT segments.
 */
export default class OfflineManager {
  static maxStorageMB = 500; // Limit for cached content

  /**
   * Downloads a stream manifest/segment to the local storage.
   */
  static async cacheStream(url: string, fileName: string) {
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}.ts`;
    
    try {
      const exists = await RNFS.exists(path);
      if (!exists) {
        logger.info(`[Offline] ⬇️ Starting download: ${fileName}`);
        const download = RNFS.downloadFile({ 
          fromUrl: url, 
          toFile: path,
          background: true,
          discretionary: true
        });
        await download.promise;
        logger.info(`[Offline] ✅ Download complete: ${path}`);
      }
      return path;
    } catch (err: any) {
      logger.error(`[Offline] Download failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Checks if a specific content is available for offline playback.
   */
  static async isCached(fileName: string) {
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}.ts`;
    return RNFS.exists(path);
  }

  /**
   * Deletes a cached stream to free up space.
   */
  static async removeCache(fileName: string) {
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}.ts`;
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  }
}
