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

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const slug = createSlug(name);

    // Check if category with same name exists
    const categoryExists = await prisma.category.findUnique({
      where: { name },
    });

    if (categoryExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Category already exists',
      });
    }

    // Check if parent category exists if parentId is provided
    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parseInt(parentId) },
      });

      if (!parentExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Parent category not found',
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId ? parseInt(parentId) : null,
      },
    });

    res.status(201).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
      },
      where: {
        parentId: null,
      },
    });

    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!categoryExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    // Check if parent category exists if parentId is provided
    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parseInt(parentId) },
      });

      if (!parentExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Parent category not found',
        });
      }
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = createSlug(name);
    }
    if (parentId !== undefined) {
      updateData.parentId = parentId ? parseInt(parentId) : null;
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: true,
        children: true,
      },
    });

    if (!categoryExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    // Check if category has products or children
    if (categoryExists.products.length > 0 || categoryExists.children.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category with products or subcategories',
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: 'success',
      message: 'Category deleted',
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
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};