import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "@clerk/expo";
import { useAuthenticated } from "@/config/api"; // Update this path to match your structure

// 1. Define a TypeScript interface for your Prisma Announcement model
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
}

export default function AnnouncementsScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const authApi = useAuthenticated();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Separate data fetching function so we can reuse it for pull-to-refresh
  const fetchAnnouncements = async () => {
    try {
      const response = await authApi.get("/announcements");
      setAnnouncements(response.data);
    } catch (error) {
      console.error("❌ Failed to load campus announcements:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchAnnouncements();
  }, [isLoaded,isSignedIn]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900 mb-4">
        Campus Announcements
      </Text>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0284c7"]}
          />
        }
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-slate-500">
              No recent announcements from the ACM Club Admin.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
                {item.author?.name || "Admin"}
              </Text>
              <Text className="text-xs text-slate-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text className="text-lg font-bold text-slate-800 mb-1">
              {item.title}
            </Text>
            <Text className="text-slate-600 leading-relaxed">
              {item.content}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
