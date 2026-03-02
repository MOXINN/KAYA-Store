const express = require('express');
const router = express.Router();
const { getAllProducts, getSingleProduct, createProduct } = require('../controllers/productsController');
// Import the middleware from ownersController or a shared file
const { authMiddleware: ownerAuth } = require('../controllers/ownersController'); 

// Public Routes (Anyone can see products)
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

// Protected Route (Only logged-in Owners can create)
// Note: You need to make sure you send the Owner Token from frontend when creating
router.post("/create", ownerAuth, createProduct);

module.exports = router;