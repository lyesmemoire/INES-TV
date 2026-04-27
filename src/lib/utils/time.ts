export const formatTime = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("fr-FR");
};
