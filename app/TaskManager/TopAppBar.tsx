import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const TopAppBar: React.FC = () => {
  return (
    <View style={styles.topAppBar}>
      <View style={styles.headlineContainer}>
        <Text style={styles.headline}>Task Highlights</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topAppBar: {
    flexDirection: "column",
    paddingBottom: 5,
    width: "100%",
    backgroundColor: "#f5f5f5",
  },
  headlineContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    width: "100%",
    alignItems: "center", // Centers the text horizontally
  },
  headline: {
    fontSize: 24, // Increased font size
    fontWeight: "600", // Bold font weight
    color: "#3A3A3A",
    textAlign: "center", // Centers the text within the container
  },
});

export default TopAppBar;
