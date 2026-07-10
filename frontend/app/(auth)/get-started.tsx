import { View, Text,Pressable } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const index = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl mb-10">Get Started!</Text>
      <Pressable
        className='mb-5'
       onPress={() => router.replace("/(auth)/sign-in")}>
        <Text className="bg-amber-600 rounded-xl p-5">Go to Login Page</Text>
      </Pressable>
      <Pressable onPress={() => router.replace("/(auth)/sign-up")}>
        <Text className="bg-amber-600 rounded-xl p-5">Go to Sign Up Page</Text>
      </Pressable>
    </View>
  );
}

export default index