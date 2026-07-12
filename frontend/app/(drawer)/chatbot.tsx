import { View, Text, Platform } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { GiftedChat, IMessage, Bubble } from "react-native-gifted-chat";
import { useUser } from "@clerk/expo";
import { useAuthenticated } from "@/config/api";
import { SafeAreaView } from "react-native-safe-area-context";
const Chatbot = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const authApi = useAuthenticated();
  const { user } = useUser();
  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello! I'm your AI assistant. Ask me anything about coding, your community, or the universe!",
        createdAt: new Date(),
        user: {
          _id: "ai-system",
          name: "Gemini AI",
          // Official Gemini icon
          avatar:
            "https://www.gstatic.com/images/branding/product/2x/gemini_48dp.png",
        },
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    const userText = newMessages[0].text;
    setIsTyping(true);
    try {
      const response = await authApi.post("/chat/assistant", {
        prompt: userText,
      });

      const aiMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000).toString(), // Unique ID
        text: response.data.reply,
        createdAt: new Date(),
        user: {
          _id: "ai-system",
          name: "Gemini AI",
          avatar:
            "https://www.gstatic.com/images/branding/product/2x/gemini_48dp.png",
        },
      };

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [aiMessage]),
      );
    } catch (error) {
      console.error("AI Request Failed:", error);

      const errorMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000).toString(),
        text: "Sorry, I'm having trouble connecting to my servers right now.",
        createdAt: new Date(),
        user: {
          _id: "ai-system",
          name: "Gemini AI",
          avatar:
            "https://www.gstatic.com/images/branding/product/2x/gemini_48dp.png",
        },
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [errorMessage]),
      );
    } finally {
      setIsTyping(false); // Hide the typing indicator
    }
  },[authApi]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        // Map the current logged-in user to the chat
        user={{
          _id: user?.id || "unknown",
          name: user?.fullName || "Me",
          avatar: user?.imageUrl,
        }}
        isTyping={isTyping}
        // Give it a custom look to match your app colors
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: "#3b82f6" }, // Blue bubbles for you
              left: { backgroundColor: "#e2e8f0" }, // Gray bubbles for AI
            }}
            textStyle={{
              left: { color: "#0f172a" }, // Dark text for the gray bubble
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Chatbot;
