const express = require('express');
const router = express.Router();


// 🌍 Health Check Route
router.get('/', (req, res) => {
  res.send('🕌 Assalamu Alaikum! Server is running...');
});