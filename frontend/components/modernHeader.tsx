import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { useAuthenticated } from "@/config/api";
import { useState,useEffect } from "react";

// We accept props from the Drawer to access the navigation object
const ModernHeader = ({ navigation }: DrawerHeaderProps) => {
  const { user } = useUser();
  const authApi = useAuthenticated();
  
  const firstName = user?.firstName || "Student";
  const [userName,setUserName] = useState("");
  // Ensures the header doesn't get covered by the phone's notch/status bar
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchProfileForHeader = async () => {
      if (!user?.id) return;
      try {
        const response = await authApi.get(`/users/${user.id}`);
        if (response.data && response.data.name) {
          // If they haven't set a name yet, fallback to "Student"
          const dbName = response.data.name.trim();
          setUserName(dbName !== "" ? dbName : "Student");
        }
      } catch (error) {
        console.log("Unable to fetch profile for header");
      }
    };

    fetchProfileForHeader();
  }, [user?.id]);

  const initial = userName.charAt(0).toUpperCase();

  return (
    <View
      style={{ paddingTop: insets.top + 10 }}
      className="flex-row justify-between items-center px-4 pb-4 bg-white shadow-sm border-b border-gray-100"
    >
      {/* Left Side: Hamburger Menu & Greeting */}
      <View className="flex-row items-center gap-3">
        {/* Drawer Toggle Button */}
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          className="p-1 active:opacity-50"
        >
          <Ionicons name="menu" size={28} color="#374151" />
        </TouchableOpacity>

        {/* User Avatar */}
        <View className="h-10 w-10 rounded-full bg-blue-100 justify-center items-center border border-blue-200">
          <Text className="text-blue-700 font-bold text-lg">{initial}</Text>
        </View>

        {/* Greeting Text */}
        <View>
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Good Morning
          </Text>
          <Text className="text-gray-900 font-bold text-lg">{userName}</Text>
        </View>
      </View>

      {/* Right Side: Action Icons */}
      <TouchableOpacity className="h-10 w-10 bg-gray-50 rounded-full justify-center items-center border border-gray-100 active:bg-gray-200">
        <Ionicons name="notifications-outline" size={20} color="#374151" />
        {/* Unread notification dot */}
        <View className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white" />
      </TouchableOpacity>
    </View>
  );
};

export default ModernHeader;
