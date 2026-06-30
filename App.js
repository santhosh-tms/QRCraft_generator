import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

export default function App() {
  const [url, setUrl] = useState('');
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef();

  // 🔴 UNGA ORIGINAL IP-AH MATTUM INGE UPDATE PANNUNGA:
  const LAPTOP_IP = '10.223.76.189'; 
  const BACKEND_URL = `http://10.223.76.189:5000/api/qr/save`;

  const handleGenerate = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a URL first!');
      return;
    }
    
    setQrValue(url);

    // 🌐 MongoDB Database Save Function
    try {
      console.log("Sending payload to:", BACKEND_URL);
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });

      const resData = await response.json();
      if (response.ok) {
        console.log('✅ Connected! Saved to MongoDB:', resData);
      } else {
        console.log('❌ Server Error Response:', resData.error);
      }
    } catch (error) {
      console.log('⚠️ Network Failed. Reason:', error.message);
      Alert.alert(
        'Network Notice', 
        'Backend contact failed, but QR generated locally. Ensure server is running globally.'
      );
    }
  };

  const handleAction = async (type) => {
    if (!qrValue) return;

    if (!qrRef.current || !qrRef.current.toDataURL) {
      Alert.alert('Error', 'QR Code is not ready yet.');
      return;
    }

    qrRef.current.toDataURL(async (dataURL) => {
      try {
        const filename = `${FileSystem.cacheDirectory}qrcode_${Date.now()}.png`;
        
        await FileSystem.writeAsStringAsync(filename, dataURL, {
          encoding: 'base64',
        });

        if (type === 'share') {
          await Sharing.shareAsync(filename);
        } else if (type === 'save') {
          const { status } = await MediaLibrary.requestPermissionsAsync(true);
          if (status === 'granted') {
            await MediaLibrary.createAssetAsync(filename);
            Alert.alert('Success', 'QR Code saved directly to Phone Gallery!');
          } else {
            Alert.alert('Permission Denied', 'Need gallery permission to save images.');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to process image: ' + error.message);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>URL to QR Code Generator</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter URL here (e.g., https://google.com)"
        placeholderTextColor="#888888"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerate}>
        <Text style={styles.buttonText}>Generate QR Code</Text>
      </TouchableOpacity>

      {qrValue ? (
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode 
              value={qrValue} 
              size={200} 
              getRef={(c) => (qrRef.current = c)} 
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('save')}>
              <Text style={styles.buttonText}>Save to Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#25D366' }]} onPress={() => handleAction('share')}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#ffffff', marginBottom: 15, fontSize: 16, color: '#000000' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  qrContainer: { marginTop: 35, alignItems: 'center' },
  qrWrapper: { padding: 15, backgroundColor: 'white', borderRadius: 12, elevation: 3 },
  actionRow: { flexDirection: 'row', marginTop: 25, gap: 15 },
  actionButton: { backgroundColor: '#333', paddingVertical: 14, borderRadius: 8, width: 140, alignItems: 'center' }
});