const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
