import { Channel, StreamSource } from "../../types";
import { resolveSources } from "./resolveSources";

export const getPrimaryStream = (channel: Channel): StreamSource | null => {
  const sources = resolveSources(channel);
  return sources.length > 0 ? sources[0] : null;
};
