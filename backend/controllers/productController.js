const Product = require('../models/Product');

// 1. GET ALL
const getProducts = async (req, res) => {
    try {
        // Query param nikalo: /api/products?search=iphone
        const { search } = req.query;

        let query = {};

        // Agar search text aaya hai, to filter banao
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },       // Name mein dhoondo (case-insensitive)
                    { category: { $regex: search, $options: 'i' } },   // Category mein dhoondo
                    { description: { $regex: search, $options: 'i' } } // Description mein dhoondo
                ]
            };
        }

        // Database mein dhoondo
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. CREATE (With Files)
const createProduct = async (req, res) => {
    try {
        const { name, price, category, description } = req.body;
        
        // Files check karo
        let imagePath = "";
        let pdfPath = "";
        
        if (req.files && req.files['image']) {
            imagePath = req.files['image'][0].path; // Path save karo
        }
        if (req.files && req.files['pdf']) {
            pdfPath = req.files['pdf'][0].path;
        }

        const product = await Product.create({ 
            name, price, category, description, 
            image: imagePath, 
            pdf: pdfPath 
        });
        
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. UPDATE (With Files)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, description } = req.body;

        let updateData = { name, price, category, description };

        // Agar nayi files aayi hain to update karo, warna purani rehne do
        if (req.files && req.files['image']) {
            updateData.image = req.files['image'][0].path;
        }
        if (req.files && req.files['pdf']) {
            updateData.pdf = req.files['pdf'][0].path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Update Failed" });
    }
};

// 4. DELETE
const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete Failed" });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };