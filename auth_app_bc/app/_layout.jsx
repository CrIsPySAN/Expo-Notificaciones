// app/_layout.jsx
import { Stack } from "expo-router";
import { SessionProvider, useSession } from "../utils/ctx";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack initialRouteName="sign-in">
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SessionProvider>
  );
}
