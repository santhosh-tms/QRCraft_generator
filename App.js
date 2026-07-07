import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";

export default function App() {
  const [url, setUrl] = useState("");
  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef();

  // CHANGE THIS IF YOUR LAPTOP IP CHANGES
const BACKEND_URL = "https://qrcraftbackend.onrender.com/api/qr/save";
  const handleGenerate = async () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a URL");
      return;
    }

    setQrValue(url);

    try {
      console.log("Sending request to:", BACKEND_URL);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      });

      console.log("Status:", response.status);

      const data = await response.json();

      console.log("Response:", data);

     if (!response.ok) {
  Alert.alert("Server Error", JSON.stringify(data));
}
    } catch (error) {
      console.log("Fetch Error:", error);

      Alert.alert(
        "Network Error",
        error.message + "\n\nCheck the Expo terminal."
      );
    }
  };

  const handleAction = async (type) => {
    if (!qrValue) return;

    qrRef.current.toDataURL(async (data) => {
      try {
        const fileUri =
          FileSystem.cacheDirectory + "qrcode_" + Date.now() + ".png";

        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (type === "share") {
          await Sharing.shareAsync(fileUri);
        } else {
          const permission =
            await MediaLibrary.requestPermissionsAsync();

          if (permission.status === "granted") {
            await MediaLibrary.createAssetAsync(fileUri);
            Alert.alert("Success", "Saved to Gallery");
          } else {
            Alert.alert("Permission Denied");
          }
        }
      } catch (err) {
        Alert.alert("Error", err.message);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>URL to QR Code Generator</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter URL"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerate}
      >
        <Text style={styles.buttonText}>Generate QR Code</Text>
      </TouchableOpacity>

      {qrValue ? (
        <View style={styles.qrContainer}>
          <QRCode
            value={qrValue}
            size={200}
            getRef={(ref) => (qrRef.current = ref)}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction("save")}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#25D366" }]}
              onPress={() => handleAction("share")}
            >
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  backgroundColor: "#fff", // White background
},

title: {
  fontSize: 28,
  fontWeight: "bold",
  color: "#000",           // Black text
  marginBottom: 25,
},

input: {
  width: "100%",
  height: 55,
  borderWidth: 1,
  borderColor: "#000",
  borderRadius: 10,
  paddingHorizontal: 15,
  marginBottom: 20,
  backgroundColor: "#fff",
  color: "#000",          
},
  button: {
    backgroundColor: "#007AFF",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  qrContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
    minWidth: 120,
    alignItems: "center",
  },
});