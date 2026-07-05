import { View, Text } from "react-native";
import React from "react";

interface ChatMessageBubbleProps {
  message: {
    content: string;
    createdAt: string;
    sender: {
      name: string;
      branch: string;
    };
  };
  isMe: boolean;
}

export default function ChatMessageBubble({
  message,
  isMe,
}: ChatMessageBubbleProps) {
  const senderName = message.sender?.name || "Unknown User";
  const senderBranch = message.sender?.branch || "GEN";

  return (
    <View
      className={`flex-row w-full mb-3
        ${isMe ? "justify-end" : "justify-start"}
      `}
    >
      <View
        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
          isMe
            ? "bg-blue-600 rounded-br-sm"
            : "bg-slate-200 rounded-bl-sm"
        }`}
      >
        <View className="flex-row items-center mb-1">
          <Text
            className={`text-[10px] font-bold ${isMe ? "text-blue-200" : "text-emerald-600"}`}
          >
            {senderName}
          </Text>
          <Text
            className={`text-[9px] font-semibold ml-1.5 px-1.5 py-[2px] rounded overflow-hidden ${
              isMe ? "bg-blue-800 text-blue-100" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {senderBranch}
          </Text>
        </View>

        <Text
          className={`text-xl leading-5 ${
            isMe ? "text-white" : "text-slate-900"
          }`}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}
