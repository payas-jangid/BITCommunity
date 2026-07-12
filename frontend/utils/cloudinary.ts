import * as ImagePicker from "expo-image-picker";

const CLOUD_NAME = "n9s6ojma";
const UPLOAD_PRESET = "bit_community_app";

export const pickAndUploadImage = async () => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes : ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if(result.canceled){
            return null;
        }

        const imageUri = result.assets[0].uri

        const data = new FormData();
        data.append('file',{
            uri:imageUri,
            type:'image/jpeg',
            name:'upload.jpg'
        } as any);

        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: data,
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
            },
          },
        );

        const cloudData = await response.json();

        return cloudData.secure_url;
    } catch (error) {
        console.error("❌ Error uploading to Cloudinary:", error);
        return null;
    }
}