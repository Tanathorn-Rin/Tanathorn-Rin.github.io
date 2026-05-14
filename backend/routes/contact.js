const express = require('express');
const router = express.Router();

// Handle contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // TODO: Send email or save to database
    console.log(`Contact from ${name}: ${email} - ${message}`);

    res.json({ message: 'Message received successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
