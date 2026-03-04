const { Op } = require('sequelize');
const { Product } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const mapProduct = (product) => ({
  id: product.id,
  name: product.name,
  title: product.name,
  description: product.description,
  price: Number(product.price),
  image_url: product.image_url,
  image: product.image_url,
  category: product.category,
  rating: Number(product.rating),
  reviews: product.reviews
});

const getProducts = asyncHandler(async (req, res) => {
  const where = {};

  if (req.query.category) {
    where.category = req.query.category;
  }

  if (req.query.q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.query.q}%` } },
      { category: { [Op.like]: `%${req.query.q}%` } }
    ];
  }

  const products = await Product.findAll({ where, order: [['id', 'ASC']] });

  return res.status(200).json({
    success: true,
    data: products.map(mapProduct)
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: mapProduct(product)
  });
});

module.exports = {
  getProducts,
  getProductById,
  mapProduct
};