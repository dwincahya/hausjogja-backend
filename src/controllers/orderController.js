const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!items || !items.length || !address) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide items and address',
      });
    }

    // Extract product IDs from items
    const productIds = items.map(item => parseInt(item.productId));

    // Get products from database
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true,
      },
    });

    // Validate all products exist and are available
    if (products.length !== productIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more products are unavailable or do not exist',
      });
    }

    // Create a map of products for easy lookup
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    // Calculate order total and prepare order items
    let total = 0;
    const orderItems = items.map(item => {
      const product = productMap[parseInt(item.productId)];
      const quantity = parseInt(item.quantity);
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      const itemTotal = product.price * quantity;
      total += itemTotal;
      
      return {
        productId: product.id,
        quantity: quantity,
        price: product.price,
      };
    });

    // Create order with associated items in a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          userId,
          total,
          address,
          status: 'PENDING',
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });
      
      return newOrder;
    });

    res.status(201).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all orders with pagination
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        include: {
          user: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
    ]);

    res.status(200).json({
      status: 'success',
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.order.count({ where: { userId } });

    res.status(200).json({
      status: 'success',
      data: orders,
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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the user or user is admin
    if (order.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = parseInt(id);

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }

    const orderExists = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!orderExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: updatedOrder,
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
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};