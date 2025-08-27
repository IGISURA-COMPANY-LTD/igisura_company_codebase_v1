// controllers/blogController.js
import prisma from '../config/database.js';

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
      where: isNumeric ? { id: parseInt(idOrSlug) } : { slug: idOrSlug }
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
    const { title, slug, content, author, image, tags = [] } = req.body;

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
        image,
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
    const { title, slug, content, author, image, tags } = req.body;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const generatedSlug = slug || (title ? title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim('-') : undefined);

    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(slug !== undefined && { slug: generatedSlug }),
        ...(content && { content }),
        ...(author && { author }),
        ...(image !== undefined && { image }),
        ...(tags !== undefined && { tags })
      }
    });

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
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    await prisma.blogPost.delete({
      where: { id: parseInt(id) }
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