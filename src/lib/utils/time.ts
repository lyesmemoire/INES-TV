export function formatTimeSafe(date?: string | number) {
  if (!date) return "--:--";

  try {
    return new Date(date).toLocaleTimeString("fr-FR");
  } catch {
    return "--:--";
  }
}

export const formatTime = (value?: string) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("fr-FR");
  } catch {
    return "--:--";
  }
};
