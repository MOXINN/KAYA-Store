const express = require('express');
const router = express.Router();

// Import your controller functions
const { getAllProducts, getSingleProduct, createProduct, deleteProduct } = require('../controllers/productsController');

// Import your security middleware
const { authMiddleware: ownerAuth } = require('../controllers/ownersController'); 

// Public Routes (Anyone can see products)
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

// Protected Routes (Only logged-in Owners can create or delete)
router.post("/create", ownerAuth, createProduct);
router.delete("/:id", ownerAuth, deleteProduct); // <-- Clean and consistent!

module.exports = router;