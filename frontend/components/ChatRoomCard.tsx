import { View, Text, Pressable } from "react-native";
import React from "react";

interface ChatRoomCardProps {
  room: {
    id: number;
    name: string;
    description: string;
  };
  onPress: () => void;
}
export default function ChatRoomCard({ room, onPress }: ChatRoomCardProps) {
  return (
    <Pressable
      className="bg-white p-4 mb-3 rounded-xl border border-slate-200 active:bg-slate-50 flex-row justify-between items-center shadow-sm"
      onPress={onPress}
    >
      <View className="flex-1 pr-4">
        <Text className="text-base font-bold text-slate-800">#{room.name}</Text>
        <Text className="text-xs text-slate-400 mt-1" numberOfLines={1}>
          {room.description}
        </Text>
      </View>
    </Pressable>
  );
}
