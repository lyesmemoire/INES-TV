import { useEffect } from "react";

interface TVRemoteProps {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onSelect?: () => void;
}

export const useTVRemote = ({ onLeft, onRight, onUp, onDown, onSelect }: TVRemoteProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (onLeft) onLeft();
          break;
        case "ArrowRight":
          if (onRight) onRight();
          break;
        case "ArrowUp":
          if (onUp) onUp();
          break;
        case "ArrowDown":
          if (onDown) onDown();
          break;
        case "Enter":
          if (onSelect) onSelect();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLeft, onRight, onUp, onDown, onSelect]);
};
