import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { useAuthenticated } from "@/config/api";
import { TextInput } from "react-native-gesture-handler";
interface UserData {
  name: string;
  email: string;
  branch: string;
  role: string;
  ClerkId: string;
}
const profile = () => {
  const authApi = useAuthenticated();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [changedName, setChangedName] = useState("");
  const [branch,setBranch] = useState("");
  const [role,setRole] = useState("");
  const [saveChanges,setSaveChanges] = useState(false);
  const cancelChanges = () => {
    setBranch("");
    setRole("");
    setChangedName("");
    setEditMode(false);
  }
  const makeChanges = async () => {
    try {
      const update = await authApi.post(`/users/${user?.id}/update`, {
        IncomingName: changedName,
        branchName: branch,
        roleName: role,
      });
      const updatedUser = await authApi.get(`/users/${user?.id}`)
      setUserData(updatedUser.data);
      setBranch("");
      setRole("");
      setChangedName("");
    } catch (error) {
      console.log(error);
    }finally{
      setEditMode(false);
    }
  }
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
    <SafeAreaView style={{ flex: 1 }}>
      <View className="items-center h-full justify-between p-6">
        <View className="w-full p-2">
          <View className="border flex-row rounded-4xl justify-between mb-3 bg-gray-300  p-4 items-center">
            <Text>Your UserName : </Text>
            {editMode ? (
              <TextInput
                placeholder="set name.."
                value={changedName}
                onChangeText={setChangedName}
              />
            ) : (
              <Text>{userData?.name}</Text>
            )}
          </View>
          <View className="bg-gray-300 flex-row border p-4 rounded-4xl justify-between mb-3 items-center">
            <Text>Your Branch : </Text>
            {editMode ? (
              <TextInput
                placeholder="set Branch.."
                value={branch}
                onChangeText={setBranch}
              />
            ) : (
              <Text>{userData?.branch}</Text>
            )}
          </View>
          <View className="bg-gray-300 flex-row border p-4 rounded-4xl justify-between mb-3 items-center">
            <Text>Your Role : </Text>
            {editMode ? (
              <TextInput
                placeholder="set role.."
                value={role}
                onChangeText={setRole}
              />
            ) : (
              <Text>{userData?.role}</Text>
            )}
          </View>
        </View>
        <View>
          {!editMode ? (
            <Pressable
              onPress={() => {
                setChangedName(userData?.name || "");
                setBranch(userData?.branch || "");
                setRole(userData?.role || "");
                setEditMode(true);
              }}
              className="border p-3 rounded-3xl bg-amber-200 mb-2"
            >
              <Text className="font-bold">Edit Mode</Text>
            </Pressable>
          ) : (
            <></>
          )}
          {editMode ? (
            <View className="flex-row">
              <Pressable
                onPress={makeChanges}
                className="border p-3 rounded-3xl bg-red-500 mr-3"
              >
                <Text>Save Changes</Text>
              </Pressable>
              <Pressable
                onPress={cancelChanges}
                className="border p-3 rounded-3xl bg-red-500"
              >
                <Text>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <></>
          )}
        </View>
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
