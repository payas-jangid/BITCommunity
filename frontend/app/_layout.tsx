import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          drawerActiveTintColor: "#3b82f6",
          drawerInactiveTintColor: "#64748b",
          drawerStyle: {
            backgroundColor: "#ffffff",
            width: 260,
          },
          headerStyle: {
            backgroundColor: "gray",
            borderBottomWidth: 1,
            borderBottomColor: "#e2e8f0",
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Announcements",
            title: "BIT Community",
          }}
        />

        <Drawer.Screen
          name="chatrooms/index"
          options={{
            drawerLabel: "Campus Chats",
            title: "Chat Rooms",
          }}
        />
        <Drawer.Screen
          name="chatrooms/[roomId]"
          options={{
            drawerItemStyle: { display: "none" }, // 🔥 This completely removes it from the sidebar list!
            title: "Chat Channel", // Header text title when you are inside a room
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
