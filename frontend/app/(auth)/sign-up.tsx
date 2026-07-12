import { View, Text, TextInput, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import { useSignUp } from "@clerk/expo";
import { router } from "expo-router";
const signUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const { signUp, fetchStatus } = useSignUp();

  const createUser = async () => {
    if (!email || !password) return;

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.verifications.sendEmailCode();

      setPendingVerification(true);
    } catch (error) {
      console.error("❌ Sign up error:", error);
      Alert.alert("Sign Up Failed");
    }
  };

  const verifyUser = async () => {
    const { error } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (error) {
      console.error("Verification error:", error);
      Alert.alert(
        "Verification Failed",
        error.longMessage || error.message || "Invalid code.",
      );
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: () => router.replace("/"),
      });
    } else {
      console.error("Verification incomplete. Current status:", signUp.status);
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-xl mb-10 text-blue-600 font-bold">
          Check your email for the code!
        </Text>
        <TextInput
          placeholder="ENTER 6-DIGIT CODE"
          placeholderTextColor="#9ca3af"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          textAlign="center"
          className="border text-white rounded-3xl p-3 mb-10 border-blue-200 w-80 tracking-widest"
        />
        <Pressable
          onPress={verifyUser}
          disabled={fetchStatus === "fetching"}
          className="border border-blue-200 rounded-3xl p-3 w-40 items-center bg-blue-900"
        >
          <Text className="text-white font-bold">
            {fetchStatus === "fetching" ? "Verifying..." : "Verify & Join"}
          </Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View className="flex-1 justify-center items-center bg-black">
      <Text className="text-xl mb-10 text-blue-600">
        Create Your BIT Community Account!
      </Text>
      <TextInput
        placeholder="EMAIL"
        value={email}
        onChangeText={setEmail}
        textAlign="center"
        className="border text-white rounded-3xl p-3 mb-3 border-blue-200 w-80"
      />
      <TextInput
        placeholder="PASSWORD"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        textAlign="center"
        className="border rounded-3xl p-3 text-white border-blue-200 w-80 mb-10"
      />

      <Pressable
        onPress={createUser}
        disabled={fetchStatus === "fetching"}
        className="border border-blue-200 rounded-3xl p-3"
      >
        <Text className="text-white font-bold">
          {fetchStatus === "fetching" ? "Creating..." : "Sign Up"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace("/(auth)/sign-in")}
        className="border border-blue-200 rounded-3xl p-3"
      >
        <Text className="text-white font-bold">
          Sign In
        </Text>
      </Pressable>
    </View>
  );
};

export default signUp;
