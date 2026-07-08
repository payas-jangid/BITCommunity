import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hides the top navigation header bar
        contentStyle: { backgroundColor: "#ffffff" }, // Sets a clean default white background
      }}
    >
      {/* Explicitly register your sign-in screen inside the auth stack */}
      <Stack.Screen name="get-started"/>
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
