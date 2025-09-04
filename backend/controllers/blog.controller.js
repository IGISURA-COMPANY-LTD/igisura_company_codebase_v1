// controllers/blogController.js
import prisma from '../config/database.js';
import { cloudinary } from '../config/cloudinary.js';

export const getAllBlogPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      author,
      tag,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.blogPost.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      posts,
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

export const getBlogPost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const post = await prisma.blogPost.findFirst({
      where: isNumeric ? { id: idOrSlug} : { slug: idOrSlug }
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createBlogPost = async (req, res) => {
  try {
    const { title, slug, content, author, images, tags = [] } = req.body;

    const generatedSlug = slug || title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim('-');

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: generatedSlug,
        content,
        author,
        images: Array.isArray(images) ? images : (images ? [images] : []),
        tags
      }
    });

    return res.status(201).json(post);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Blog post with this slug already exists' });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, author, images, tags } = req.body;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id: id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const generatedSlug = slug || (title ? title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim('-') : undefined);

    // If new images are provided, delete all previous images
    let imagesToDelete = [];
    let nextImages = existingPost.images || [];
    if (images !== undefined) {
      imagesToDelete = [...(existingPost.images || [])];
      nextImages = Array.isArray(images) ? images : [images];
    }

    const post = await prisma.blogPost.update({
      where: { id: id },
      data: {
        ...(title && { title }),
        ...(slug !== undefined && { slug: generatedSlug }),
        ...(content && { content }),
        ...(author && { author }),
        ...(images !== undefined && { images: nextImages }),
        ...(tags !== undefined && { tags })
      }
    });

    if (imagesToDelete.length > 0) {
      try {
        const deleteIds = imagesToDelete.map((url) => {
          const publicId = url.split('/').pop().split('.')[0];
          return `igisura/blog/${publicId}`;
        });
        await Promise.all(deleteIds.map((pid) => cloudinary.uploader.destroy(pid)));
      } catch (e) {}
    }

    return res.status(200).json(post);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Blog post with this slug already exists' });
    }
   return res.status(500).json({ error: error.message });
  }
};

export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { id: id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // delete images if present
    try {
      if (Array.isArray(post.images) && post.images.length > 0) {
        const deleteIds = post.images.map((url) => {
          const publicId = url.split('/').pop().split('.')[0];
          return `igisura/blog/${publicId}`;
        });
        await Promise.all(deleteIds.map((pid) => cloudinary.uploader.destroy(pid)));
      }
    } catch (e) {}

    await prisma.blogPost.delete({
      where: { id: id }
    });

    return res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    return res.json({ image: req.file.path });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadBlogImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    const urls = req.files.map((f) => f.path);
    return res.json({ images: urls });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};