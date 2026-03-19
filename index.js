const express = require('express');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// In-memory data store
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High performance laptop',
    price: 999.99,
    availability: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model smartphone',
    price: 699.99,
    availability: true
  }
];

// Validation Helper
const validateProduct = (data) => {
  const errors = [];
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required and must be a string.');
  }
  if (data.price === undefined || typeof data.price !== 'number' || data.price < 0) {
    errors.push('Price is required and must be a positive number.');
  }
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string.');
  }
  if (data.availability !== undefined && typeof data.availability !== 'boolean') {
    errors.push('Availability must be a boolean.');
  }
  return errors;
};

// GET /products - Retrieve a list of products
app.get('/products', (req, res) => {
  res.status(200).json(products);
});

// POST /products - Add a new product
app.post('/products', (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newProduct = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description || '',
    price: req.body.price,
    availability: req.body.availability !== undefined ? req.body.availability : true
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /products/:id - Update an existing product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const errors = validateProduct(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const updatedProduct = {
    ...products[productIndex],
    name: req.body.name,
    description: req.body.description !== undefined ? req.body.description : products[productIndex].description,
    price: req.body.price,
    availability: req.body.availability !== undefined ? req.body.availability : products[productIndex].availability
  };

  products[productIndex] = updatedProduct;
  res.status(200).json(updatedProduct);
});

// DELETE /products/:id - Remove a product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(productIndex, 1);
  res.status(204).send();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
