import Joi from 'joi';



export const productSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  categoryId: Joi.number().optional(),
  stockQuantity: Joi.number().min(0).default(0).optional(),
  categorySlug: Joi.string().optional(),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string().uri()),
    Joi.any().strip() // This allows the field to be present but not validated when files are uploaded
  ).optional(),
  benefits: Joi.string().required(),
  instructions: Joi.string().optional(),
  inStock: Joi.boolean().default(true),
  quantityChange: Joi.number().optional(),
  featured: Joi.boolean().default(false)
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
// Add image upload validation schema
export const imageUploadSchema = Joi.object({
  images: Joi.array().items(
    Joi.object({
      fieldname: Joi.string(),
      originalname: Joi.string(),
      encoding: Joi.string(),
      mimetype: Joi.string().pattern(/^image\//),
      size: Joi.number().max(5 * 1024 * 1024), // 5MB
      destination: Joi.string(),
      filename: Joi.string(),
      path: Joi.string(),
      buffer: Joi.binary()
    })
  ).optional()
});


export const categorySchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  description: Joi.string().optional()
});

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().optional()
});

export const userUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().optional(),
  role: Joi.string().valid('CUSTOMER', 'ADMIN').optional()
});

export const orderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.number().required(),
    quantity: Joi.number().min(1).required(),
    price: Joi.number().min(0).required()
  })).required(),
  phoneNumber: Joi.string().required(),
  address: Joi.string().required(),
  notes: Joi.string().optional()
});

export const orderQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  status: Joi.string().valid('NEW', 'CONTACTED', 'PAYMENT_CONFIRMED', 'DELIVERED', 'CANCELLED').optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'total', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional()
});

export const orderStatusSchema = Joi.object({
  status: Joi.string().valid('NEW', 'CONTACTED', 'PAYMENT_CONFIRMED', 'DELIVERED', 'CANCELLED').required()
});

export const blogSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().optional(),
  content: Joi.string().required(),
  author: Joi.string().required(),
  image: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

export const blogQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  author: Joi.string().optional(),
  tag: Joi.string().optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const userQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  role: Joi.string().valid('CUSTOMER', 'ADMIN').optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('createdAt', 'email', 'name').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const productQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  category: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  inStock: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'price', 'createdAt', 'rating').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional()
});