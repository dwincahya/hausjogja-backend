const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { validateProduct } = require('../middlewares/validationMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as admin
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category slug to filter products
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 */
router
  .route('/')
  .post(protect, admin, upload.product.single('image'), validateProduct, createProduct)
  .get(getProducts);

/**
 * @swagger
 * /api/products/category/{slug}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get('/category/:slug', getProductsByCategory);

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Product slug
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:slug', getProductBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Product not found
 */
router
  .route('/:id')
  .put(protect, admin, upload.product.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;