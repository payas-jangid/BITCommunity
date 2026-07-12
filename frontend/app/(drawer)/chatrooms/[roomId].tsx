import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import "@/global.css";
import ChatMessageBubble from "@/components/ChatMessageBubble";
import {io,Socket} from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import { pickAndUploadImage } from "@/utils/cloudinary";
import {
  useLocalSearchParams,
  Stack,
  useNavigation,
  router,
  useRouter,
} from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth,useUser } from "@clerk/expo";

import { useAuthenticated } from "@/config/api";
import { KeyboardAvoidingView, Platform } from "react-native";

interface Message {
  id: number;

  content: string;

  createdAt: string;

  sender: {
    name: string;

    branch: string;

    role: string;

    ClerkId: string;
    
  };
  imageUrl:string
}

interface RoomDetails {
  id: number;

  name: string;

  description: string | null;
}

export default function ChatRoomDetails() {
  const [socket,setSocket] = useState<Socket | null>(null);

  const navigation = useNavigation();

  const flatListRef = useRef<FlatList>(null);

  const router = useRouter();

  const { isLoaded, isSignedIn } = useAuth();
  const authApi = useAuthenticated();
  const {user} = useUser();

  const { roomId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [inputText, setInputText] = useState("");

  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchMessages = async () => {
    console.log(`📡 Sending request to: /chatrooms/${roomId}`);

    try {
      setLoading(true);

      setError(false);

      const response = await authApi.get(`chatrooms/${roomId}`);

      setMessages(response.data.messages || []);

      setRoomDetails(response.data.room);
    } catch (error) {
      console.error("Failed to load channel logs:", error);

      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const respone = await authApi.post(
        `chatrooms/${roomId}/messages`,{
          content:inputText,
          imageUrl : null
        }
      );



      setInputText("");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 60);
    } catch (error) {
      console.error("Failed to send text message:", error);
    }
  };

  const sendImageMessage = async () => {
    setIsUploadingImage(true);
    const uploadedUrl = await pickAndUploadImage();

    if(uploadedUrl){
      try {
        const response = await authApi.post(`chatrooms/${roomId}/messages`,{
          content : "",
          imageUrl : uploadedUrl
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 60);
      } catch (error) {
        console.error("Failed to send image message:", error);
      }finally{
        setIsUploadingImage(false);
      }
    }
  };

  useEffect(() => {
    if (!roomId || roomId === "undefined") return;
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
   const newSocket = io("http://192.168.1.8:5000");
   setSocket(newSocket);

   newSocket.emit("join_room", roomId);

   newSocket.on("receive_message", (newMessage) => {
     console.log(newMessage);
     setMessages((prevMessages) => {

      return [...prevMessages,newMessage];
     });

     setTimeout(() => {
       flatListRef.current?.scrollToEnd({ animated: true });
     }, 60);
   }); 

   return () => {
    newSocket.disconnect();
   };
  },[roomId]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: roomDetails ? roomDetails.name : "Loading channel...",
      headerShown: true,
      headerLeft: () => (
        <Pressable
          onPress={() => router.replace("/chatrooms")}
          style={{ paddingRight: 16, paddingLeft: 4 }}
        >
          <Text style={{ color: "black", fontSize: 16, fontWeight: "600" }}>
            ◀ Channels
          </Text>
        </Pressable>
      ),
    });
  }, [roomDetails, navigation]);

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMe =
      item.sender?.ClerkId === user?.id;

    return <ChatMessageBubble message={item} isMe={isMe} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 90}
      >
        <View style={{ flex: 1 }}>
          {loading ? (
            <View
              style={{
                flex: 1,

                justifyContent: "center",

                alignItems: "center",
              }}
            >
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : error ? (
            <View
              style={{
                flex: 1,

                justifyContent: "center",

                alignItems: "center",

                padding: 16,
              }}
            >
              <Text style={{ color: "#ef4444", fontWeight: "500" }}>
                Failed to sync chat thread
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef} // Connects your scrolling hook reference
              data={Array.isArray(messages) ? messages : []} // Extra safety check anchor
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
              renderItem={renderMessageItem}
              extraData={messages} // Tells FlatList to instantly repaint on new updates
              contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
              className="flex-1"
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#64748b" }}>
                    No messages in this room yet.
                  </Text>
                </View>
              }
            />
          )}
        </View>

        <View className="p-3 bg-white border-t border-slate-200 flex-row items-center pb-5">
          <View className="flex-1 bg-slate-100 rounded-full px-4 py-2">
            <TextInput
              className="text-slate-800 text-sm p-0 m-0"
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
            />
          </View>

          <View className="flex-row">
            <TouchableOpacity
              className="ml-3 bg-blue-500 w-10 h-10 rounded-full items-center justify-center active:bg-blue-600"
              onPress={sendImageMessage}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  +
                </Text>
              )}
            </TouchableOpacity>
            <Pressable
              className="ml-3 bg-blue-500 w-10 h-10 rounded-full items-center justify-center active:bg-blue-600"
              onPress={sendMessage}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                ➔
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
