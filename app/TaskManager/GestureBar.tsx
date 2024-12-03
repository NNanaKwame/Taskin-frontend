import React from "react";
import { View, StyleSheet } from "react-native";

const GestureBar: React.FC = () => {
  return (
    <View style={styles.gestureBar}>
      <View style={styles.handle} />
    </View>
  );
};

const styles = StyleSheet.create({
  gestureBar: {
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    paddingHorizontal: 40, // This is equivalent to `px-20`
    paddingVertical: 10,   // This is equivalent to `py-2.5`
    width: "100%",
    display: "none", // Set to "none" for mobile styles; handle visibility in your component logic
  },
  handle: {
    height: 4, // This is equivalent to `h-1`
    borderRadius: 12, // This is equivalent to `rounded-xl`
    backgroundColor: "#ffff", // Zinc-900 color
    width: 108,
  },
});

// Make sure to add logic to conditionally render `gestureBar` based on screen size if necessary.

export default GestureBar;
