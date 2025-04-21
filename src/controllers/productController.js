const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to create slug
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, description, isAvailable, categoryId } = req.body;
    const slug = createSlug(name);

    // Check if product with same name exists
    const productExists = await prisma.product.findFirst({
      where: { name },
    });

    if (productExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Product already exists',
      });
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!categoryExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    // Get image path if uploaded
    let imagePath = null;
    if (req.file) {
      // Save relative path from uploads directory
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price: parseFloat(price),
        description,
        image: imagePath,
        isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
        categoryId: parseInt(categoryId),
      },
    });

    res.status(201).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construct where clause
    const where = {};
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.name = { contains: search };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.product.count({ where });

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, isAvailable, categoryId } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Check if category exists if categoryId is provided
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!categoryExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Category not found',
        });
      }
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = createSlug(name);
    }
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (categoryId) updateData.categoryId = parseInt(categoryId);

    // Update image if new file is uploaded
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: 'success',
      message: 'Product deleted',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:slug
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    // Get all subcategory IDs
    const categoryIds = [category.id, ...category.children.map(child => child.id)];

    // Find products by category IDs
    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
      },
      include: {
        category: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.product.count({
      where: {
        categoryId: { in: categoryIds },
      },
    });

    res.status(200).json({
      status: 'success',
      data: products,
      category,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};