// controllers/analyticsController.js
import prisma from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      totalBlogPosts,
      revenueThisMonth,
      ordersThisMonth,
      newUsersThisMonth,
      lowStockProducts
    ] = await Promise.all([

      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED' }
      }),
      
      prisma.order.count(),
      
      prisma.product.count(),
      
      prisma.user.count(),

      prisma.blogPost.count(),

      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'DELIVERED',
          createdAt: { gte: startOfMonth }
        }
      }),
      
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      
      // Low stock
      prisma.product.count({
        where: { 
          inStock: true,
          stockQuantity: { lt: 10 }
        }
      })
    ]);

    const pendingOrders = await prisma.order.count({
      where: { status: 'NEW' }
    });

    const inventoryValue = await prisma.product.aggregate({
      _sum: {
        stockQuantity: true
      }
    });

    return res.status(200).json({
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalProducts,
      totalUsers,
      totalBlogPosts,
      revenueThisMonth: revenueThisMonth._sum.total || 0,
      ordersThisMonth,
      newUsersThisMonth,
      lowStockProducts,
      pendingOrders,
      totalInventoryValue: inventoryValue._sum.stockQuantity || 0
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// // still in development
// export const getRevenueAnalytics = async (req, res) => {
//   try {
//     const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
//     // Implementation for revenue analytics by period
//     // This would involve complex date grouping and aggregation
//     const revenueData = await getRevenueByPeriod(period, parseInt(year));
    
//     return res.status(200).json(revenueData);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // Helper function for revenue analytics
// async function getRevenueByPeriod(period, year) {
//   return {
//     period,
//     year,
//     data: [],
//     totalRevenue: 0,
//     averageOrderValue: 0,
//     growthRate: 0
//   };
// }

// export const getSalesAnalytics = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     // Implementation for sales analytics
//     const salesData = await getSalesData(startDate, endDate);
    
//     return res.status(200).json(salesData);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// export const getCustomerAnalytics = async (req, res) => {
//   try {
//     // Implementation for customer analytics
//     const customerData = await getCustomerData();
    
//     return res.status(200).json(customerData);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

export const getInventoryAnalytics = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        inStock: true,
        price: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        stockQuantity: 'asc'
      }
    });

    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.inStock).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    
    const lowStockProducts = products.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0);
    const zeroStockProducts = products.filter(p => p.stockQuantity === 0);

    const inventoryValue = products.reduce((total, product) => {
      return total + (product.stockQuantity * product.price);
    }, 0);

    return res.status(200).json({
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts: lowStockProducts.length,
      zeroStockProducts: zeroStockProducts.length,
      inventoryValue,
      products: lowStockProducts.concat(zeroStockProducts).slice(0, 10) // Top 10 low/zero stock products
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};