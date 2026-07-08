import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { useAuthenticated } from "@/config/api";
interface UserData {
  name: string;
  email: string;
  branch: string;
  role: string;
}
const profile = () => {
  const authApi = useAuthenticated();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const response = await authApi.get(`/users/${user?.id}`);
      setUserData(response.data);
    } catch (error) {
      console.log("unable to fetch email");
    }
  };
  useEffect(() => {
    fetchProfile();
  }, [user?.id]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View className="items-center h-full justify-center p-6">
        {userData ? (
          <View className="items-center mb-10">
            <Text className="text-2xl font-bold text-slate-800 mb-2">
              {userData.name}
            </Text>
            <Text className="text-md text-slate-500 mb-1">
              📧 {userData.email}
            </Text>
            <Text className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold uppercase tracking-wider mt-2">
              {userData.branch} | {userData.role}
            </Text>
          </View>
        ) : (
          <Text className="mb-10 text-slate-400">
            Loading campus profile...
          </Text>
        )}
        <TouchableOpacity
          className="bg-amber-800 rounded-2xl px-6 py-4 active:bg-amber-900"
          onPress={() => signOut()}
        >
          <Text className="text-white font-bold text-lg text-center">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default profile;
