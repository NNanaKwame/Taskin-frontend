import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "TaskIn",
          headerTitleStyle: {
            fontSize: 28,     // Set your desired font size
            color: "#ff5733", // Set your desired color (e.g., hex color or color name)
            fontWeight: "bold" // Optional: add bold or other styles if needed
          },
        }}
      />
    </Stack>
  );
}
