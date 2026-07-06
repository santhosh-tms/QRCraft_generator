// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // App-la irundhu request vara idhu mukkiyam

// 1. MongoDB Connection
// Ungaloda MongoDB Connection String-ah inge tharavendum
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://qrcraft:qrcraft654@cluster0.wfz8y.mongodb.net/?appName=Cluster0'; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 2. MongoDB Schema & Model (QR History-kaaga)
const QRHistorySchema = new mongoose.Schema({
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const QRHistory = mongoose.model('QRHistory', QRHistorySchema);

// 3. API Routes

// Route A: User generate panra URL-ah database-la save panna
app.post('/api/qr/save', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const newHistory = new QRHistory({ url });
    await newHistory.save();
    
    res.status(201).json({ message: 'Saved to history successfully!', data: newHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route B: Pazhaya history ellam app-ku yeduthu poga
app.get('/api/qr/history', async (req, res) => {
  try {
    const history = await QRHistory.find().sort({ createdAt: -1 }); // Latest first
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});