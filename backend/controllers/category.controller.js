// controllers/categoryController.js
import prisma from '../config/database.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
   return res.status(200).json(categories);
  } catch (error) {
   return  res.status(500).json({ error: error.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);
    
    const category = await prisma.category.findFirst({
      where: isNumeric ? { id: parseInt(idOrSlug) } : { slug: idOrSlug },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            inStock: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json(category);
  } catch (error) {
   return res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-'),
        description
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, slug, description }
    });

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    return res.status(201).json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};