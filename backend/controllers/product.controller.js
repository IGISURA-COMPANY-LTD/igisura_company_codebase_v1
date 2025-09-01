import prisma from '../config/database.js';

const deleteCloudinaryImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(async (imageUrl) => {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      const fullPublicId = `igisura/products/${publicId}`;
      
      await cloudinary.uploader.destroy(fullPublicId);
    });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting Cloudinary images:', error);
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (imageUrl) => {
  const urlParts = imageUrl.split('/');
  const filename = urlParts.pop();
  const publicId = filename.split('.')[0];
  return `igisura/products/${publicId}`;
};



export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      inStock,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where = {};

    if (category) {
      where.OR = [
        { category: { slug: category } },
        { categoryId: category }
      ];
    }

    const hasMin = minPrice !== undefined && minPrice !== '';
    const hasMax = maxPrice !== undefined && maxPrice !== '';
    if (hasMin || hasMax) {
      where.price = {};
      if (hasMin) where.price.gte = parseFloat(minPrice);
      if (hasMax) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock !== undefined && inStock !== '') {
      where.inStock = inStock === 'true' || inStock === true;
    }

    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { benefits: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    const orderBy = {};
    if (sortBy === 'rating') {
      orderBy.reviews = {
        _count: sortOrder
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined // Remove reviews array from response
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      products: productsWithRating,
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

export const getProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    const productWithRating = {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length
    };

    return res.status(200).json(productWithRating);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, categoryId, categorySlug, images, benefits, instructions, inStock, featured,
       stockQuantity } = req.body;
    
    let category;
    if (categoryId) {
      category = await prisma.category.findUnique({ where: { id: categoryId } });
    } else if (categorySlug) {
      category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    }

    if (!category) {
      if (req.files && req.files.length > 0) {
        await deleteCloudinaryImages(req.files.map(file => file.path));
      }
      return res.status(400).json({ error: 'Category not found' });
    }

    const generatedSlug = slug || name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim('-');

    const productImages = req.files && req.files.length > 0 
      ? req.files.map(file => file.path) 
      : (Array.isArray(images) ? images : images ? [images] : []);  

    const quantity = stockQuantity !== undefined ? parseInt(stockQuantity) : 0;
    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        description,
        price: parseFloat(price),
        categoryId: category.id,
        images:productImages,
        stockQuantity: quantity,
        benefits,
        instructions,
        inStock: inStock !== undefined ? inStock : true,
        featured: featured !== undefined ? featured : false
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Product with this slug already exists' });
    }
    return res.status(500).json({ error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, categoryId, categorySlug, images, benefits, instructions, inStock, featured, quantityChange } = req.body;


    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      if (req.files && req.files.length > 0) {
        await deleteCloudinaryImages(req.files.map(file => file.path));
      }
      return res.status(404).json({ error: 'Product not found' });
    }

    const newStockQuantity = quantityChange !== undefined
      ? (parseInt(existingProduct.stockQuantity ?? 0) + parseInt(quantityChange))
      : undefined;


    let category;
    if (categoryId || categorySlug) {
      if (categoryId) {
        category = await prisma.category.findUnique({ where: { id: categoryId } });
      } else if (categorySlug) {
        category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      }

      if (!category) {
        if (req.files && req.files.length > 0) {
          await deleteCloudinaryImages(req.files.map(file => file.path));
        }
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    const generatedSlug = slug || (name ? name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim('-') : undefined);

    let productImages = existingProduct.images;
    let imagesToDelete = [];

    if (req.files && req.files.length > 0) {
      imagesToDelete = [...existingProduct.images];
      productImages = req.files.map(file => file.path);
    } else if (images !== undefined) {
      imagesToDelete = [...existingProduct.images];
      productImages = Array.isArray(images) ? images : [images];
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug !== undefined && { slug: generatedSlug }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(category && { categoryId: category.id }),
        ...(images !== undefined && { images: productImages }),
        ...(benefits && { benefits }),
        ...(instructions !== undefined && { instructions }),
        ...(inStock !== undefined && { inStock }),
        ...(featured !== undefined && { featured }),
        ...(newStockQuantity !== undefined && { stockQuantity: newStockQuantity })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (imagesToDelete.length > 0) {
      await deleteCloudinaryImages(imagesToDelete);
    }


    return res.status(200).json(product);
  } catch (error) {
    if (req.files && req.files.length > 0) {
      await deleteCloudinaryImages(req.files.map(file => file.path));
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Product with this slug already exists' });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.images && product.images.length > 0) {
      await deleteCloudinaryImages(product.images);
    }

    await prisma.product.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryIdOrSlug } = req.params;
    const {
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      inStock,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const isNumeric = /^\d+$/.test(categoryIdOrSlug);
    const category = await prisma.category.findFirst({
      where: isNumeric ? { id: parseInt(categoryIdOrSlug) } : { slug: categoryIdOrSlug }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Build filter conditions
    const where = {
      categoryId: category.id
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock !== undefined) {
      where.inStock = inStock === 'true';
    }

    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    const orderBy = {};
    if (sortBy === 'rating') {
      orderBy.reviews = {
        _count: sortOrder
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      category,
      products: productsWithRating,
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

export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const limitNum = Math.min(parseInt(limit), 20);

    const products = await prisma.product.findMany({
      where: {
        featured: true,
        inStock: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: limitNum,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average rating
    const productsWithRating = products.map(product => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined
      };
    });

    return res.status(200).json(productsWithRating);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const imageUrls = req.files.map(file => file.path);
    res.json({ images: imageUrls });
  } catch (error) {
    // Clean up uploaded images on error
    if (req.files && req.files.length > 0) {
      await deleteCloudinaryImages(req.files.map(file => file.path));
    }
    res.status(500).json({ error: error.message });
  }
};