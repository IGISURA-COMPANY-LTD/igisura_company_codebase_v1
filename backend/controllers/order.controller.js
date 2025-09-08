// controllers/orderController.js
import prisma from '../config/database.js';
import { sendTemplatedEmail } from '../utils/email.js';

export const getAllOrders = async (req, res) => {
  try {
     if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    // If user is not admin, only show their orders
    if (req.user && req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


const reserveStock = async (productId, quantity) => {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  if (product.stockQuantity < quantity) {
    throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${quantity}`);
  }

  return await prisma.product.update({
    where: { id: productId },
    data: {
      stockQuantity: product.stockQuantity - quantity,
      inStock: (product.stockQuantity - quantity) > 0
    }
  });
};

const restoreStock = async (productId, quantity) => {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const newStockQuantity = product.stockQuantity + quantity;
  
  return await prisma.product.update({
    where: { id: productId },
    data: {
      stockQuantity: newStockQuantity,
      inStock: newStockQuantity > 0
    }
  });
};


export const createOrder = async (req, res) => {
  try {
    const { items, phoneNumber, address, notes } = req.body;

    // Validate that all products exist and are in stock
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        inStock: true
      }
    });

    if (products.length !== productIds.length) {
      const missingProducts = productIds.filter(id => 
        !products.find(p => p.id === id)
      );
      return res.status(400).json({ 
        error: 'Some products are not available or out of stock',
        missingProducts 
      });
    }


    // Check stock availability
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        });
      }
    }


    // Calculate total and validate prices
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }

      if (product.price !== item.price) {
        return res.status(400).json({ 
          error: `Price mismatch for product ${product.name}` 
        });
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order with user association if logged in
    let userId = null;
    let email = null; 
    let customerName= null;
    if (req.user) {
      userId = req.user.id;
      email = req.user.email
      customerName = req.user.name
    }

    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: orderItems
        },
        total,
        customerName,
        phoneNumber,
        email,
        address,
        notes,
        status: 'NEW'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            }
          }
        }
      }
    });

    for (const item of items) {
      await reserveStock(item.productId, item.quantity);
    }

    return res.status(201).json({
      order,
      message: 'Order created successfully! Our team will contact you within 24 hours to confirm your order and arrange payment and delivery.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      // Restore stock
      for (const item of order.items) {
        await restoreStock(item.productId, item.quantity);
      }
    } else if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
      // Reserve stock
      for (const item of order.items) {
        await reserveStock(item.productId, item.quantity);
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            }
          }
        },
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Fire-and-forget email (non-blocking). If send fails, don't block response.
    try {
      const to = updatedOrder?.email || updatedOrder?.customer?.email;
      if (to) {
        await sendTemplatedEmail('orderStatusChanged', {
          customerName: updatedOrder?.customerName || updatedOrder?.customer?.name,
          orderId: updatedOrder.id,
          prevStatus: order.status,
          newStatus: status
        }, { to });
      }
    } catch (e) {
      // log and continue
      console.error('Email send failed:', e?.message || e);
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include:{
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow deletion of orders in certain statuses
    if (order.status === 'DELIVERED' || order.status === 'PAYMENT_CONFIRMED') {
      return res.status(400).json({ 
        error: 'Cannot delete orders that are already delivered or payment confirmed' 
      });
    }

    if (order.status !== 'CANCELLED') {
      for (const item of order.items) {
        await restoreStock(item.productId, item.quantity);
      }
    }

    await prisma.order.delete({
      where: { id }
    });

    return res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Verify user exists and check permissions
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if admin or user accessing their own orders
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where = { userId: id };

    if (status) {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'DELIVERED' }
    });
    
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      ordersByStatus,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};