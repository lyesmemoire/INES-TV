import React, { useState } from "react";
import { TouchableOpacity } from "react-native";

export default function Focusable({ children, onPress, style }) {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        style,
        {
          transform: [{ scale: focused ? 1.1 : 1 }],
          borderWidth: focused ? 2 : 0,
          borderColor: "#fff",
        },
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}
