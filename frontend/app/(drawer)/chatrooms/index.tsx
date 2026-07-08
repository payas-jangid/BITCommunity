import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/config/api";
import ChatRoomCard from "@/components/ChatRoomCard";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useAuthenticated } from "@/config/api";
interface ChatRoom {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export default function ChatRooms() {
  const { isLoaded, isSignedIn } = useAuth();
  const authApi = useAuthenticated();
  const router = useRouter();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  //searchQuery
  const [searchQuery,setSearchQuery] = useState("");
  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true; // show everything when search is empty
    return (
      room.name?.toLowerCase().includes(query) ||
      room.description?.toLowerCase().includes(query)
    );
  });

  //modal
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await authApi.get("/chatrooms");
      setRooms(response.data);
      console.log("🟢 SERVER RESPONDED WITH DATA:", response.data);
    } catch (error) {
      console.log("failed to fetch chatrooms : ", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      setCreating(true);
      const response = await authApi.post("/chatrooms", {
        roomName: newRoomName,
        roomType: newRoomDesc,
      });

      setRooms((prevRooms) => [response.data, ...prevRooms]);

      setModalVisible(false);
      setNewRoomDesc("");
      setNewRoomName("");
    } catch (error) {
      console.log("failed to create room", error);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    fetchChatRooms();
  }, [isLoaded, isSignedIn]);

  const renderRootItem = ({ item }: { item: ChatRoom }) => (
    <ChatRoomCard
      room={item}
      onPress={() => router.push(`/chatrooms/${item.id}`)}
    />
  );
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
          Available Channels
        </Text>
      </View>

      <TextInput
        placeholder="eg. K25"
        className="rounded-2xl bg-slate-300 m-5 p-5"
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text className="text-slate-400 text-xs mt-2">
            Loading campus rooms...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-sm font-bold text-red-500">
            Server Unreachable
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRootItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 75,
          }}
        />
      )}

      <Pressable
        className="absolute top-150 right-9 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg active:bg-blue-600"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white text-2xl font-bold">+</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 min-h-[350px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">
                Create New Channel
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text className="text-slate-400 text-sm font-semibold">
                  Cancel
                </Text>
              </Pressable>
            </View>

            <Text className="text-xs font-semibold text-slate-500 mb-1">
              ROOM NAME
            </Text>
            <TextInput
              className="bg-slate-100 p-3 rounded-xl mb-4 text-slate-800 text-sm"
              placeholder="e.g., Coding Club Talk"
              value={newRoomName}
              onChangeText={setNewRoomName}
            />

            <Text className="text-xs font-semibold text-slate-500 mb-1">
              DESCRIPTION
            </Text>
            <TextInput
              className="bg-slate-100 p-3 rounded-xl mb-6 text-slate-800 text-sm"
              placeholder="What are students discussing here?"
              value={newRoomDesc}
              onChangeText={setNewRoomDesc}
              multiline
              numberOfLines={2}
            />

            <Pressable
              className={`w-full py-3.5 rounded-xl items-center justify-center ${
                newRoomName.trim()
                  ? "bg-blue-500 active:bg-blue-600"
                  : "bg-slate-300"
              }`}
              onPress={handleCreateRoom}
              disabled={!newRoomName.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  Create Channel
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
