require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

let db;
const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(() => {
    db = client.db('fashionAIsian'); // Database name
    console.log('Connected to MongoDB');
}).catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware to parse JSON
app.use(express.json());

// Retrieve all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
});

// Retrieve a product by title
app.get('/api/products/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const product = await db.collection('products').findOne({ title: title });
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product by title', error });
    }
});

// Retrieve products by category
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const products = await db.collection('products').find({ category_name: category }).toArray();
        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            res.status(404).json({ message: 'No products found in this category' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products by category', error });
    }
});

// Retrieve products within a price range
app.get('/api/products/price', async (req, res) => {
    try {
        const minPrice = parseFloat(req.query.min) || 0;
        const maxPrice = parseFloat(req.query.max) || Number.MAX_VALUE;

        const products = await db.collection('products').find({
            'sale_price.usd_amount': { $gte: minPrice, $lte: maxPrice }
        }).toArray();

        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            res.status(404).json({ message: 'No products found within the specified price range' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products by price range', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
