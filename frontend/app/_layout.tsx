import { Slot, useRouter, useSegments } from "expo-router";
import { ClerkProvider, useAuth } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`🔑 TokenCache: Successfully retrieved token for [${key}]`);
      } else {
        console.log(
          `🔑 TokenCache: No token found in secure storage for [${key}]`,
        );
      }
      return item;
    } catch (error) {
      console.error("❌ TokenCache retrieval failure:", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`📝 TokenCache: Securely saved token for [${key}]`);
    } catch (err) {
      console.error("❌ TokenCache save failure:", err);
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`🧹 TokenCache: Cleared token for [${key}]`);
    } catch (err) {
      console.error("❌ TokenCache clear failure:", err);
    }
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Check if the user is currently inside the auth group segment
    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn) {
      if (inAuthGroup) {
        console.log("🚀 Forcing navigation transition to Dashboard root...");
        router.replace("/");
      }
    } else {
      if (!inAuthGroup) {
        console.log("🔒 Forcing navigation fallback to Sign-In screen...");
        router.replace("/(auth)/sign-up");
      }
    }
  }, [isSignedIn, isLoaded, segments.join("/")]);

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  // Renders either the (auth) stack or the (drawer) layout depending on where the user was routed
  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  );
}
