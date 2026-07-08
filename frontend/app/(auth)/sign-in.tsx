import { useSignIn } from "@clerk/expo";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

export default function SignInScreen() {
  const { signIn, fetchStatus, errors } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const onSignInPress = async () => {
    console.log("🔑 KEY:", process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);
    if (!emailAddress || !password) return;
    try {
      const result = await signIn.password({ emailAddress, password });
      if (result.error) {
        console.error(
          "❌ Clerk Authentication Field Error:",
          JSON.stringify(result.error, null, 2),
        );
        return;
      }

      // 2. AWAIT the finalization step so the token completely locks into SecureStore
      if (signIn.status === "complete") {
        console.log("🔄 Finalizing Clerk session active state...");

        await signIn.finalize();
        router.replace("/");

        console.log("✅ Session fully finalized in storage!");
      } else {
        console.warn("⚠️ Sign-in did not complete immediately:", signIn.status);
      }
    } catch (err) {
      console.error("❌ Sign-in execution loop crashed:", err);
    }
  };

  const isLoading = fetchStatus === "fetching";

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-3xl font-bold mb-8 text-center text-slate-900 tracking-wide">
        BIT Community
      </Text>

      {/* Email Field Wrapper */}
      <View className="mb-4">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholder="Campus Email"
          placeholderTextColor="#64748b"
          onChangeText={setEmailAddress}
          editable={!isLoading}
          className="h-13 border border-slate-200 rounded-xl px-4 text-black bg-slate-50 text-base focus:border-sky-500"
        />
        {errors?.fields?.identifier ? (
          <Text className="text-red-600 text-sm mt-1 pl-1">
            {errors.fields.identifier.message}
          </Text>
        ) : null}
      </View>

      {/* Password Field Wrapper */}
      <View className="mb-5">
        <TextInput
          value={password}
          placeholder="Password"
          placeholderTextColor="#64748b"
          secureTextEntry
          onChangeText={setPassword}
          editable={!isLoading}
          className="h-13 border border-slate-200 rounded-xl px-4 text-black bg-slate-50 text-base focus:border-sky-500"
        />
        {errors?.fields?.password ? (
          <Text className="text-red-600 text-sm mt-1 pl-1">
            {errors.fields.password.message}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onSignInPress}
        disabled={isLoading}
        className={`h-13 rounded-xl justify-center items-center mt-3 shadow-md active:opacity-90 ${
          isLoading ? "bg-sky-200 shadow-none" : "bg-sky-600"
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white text-base font-bold">Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
