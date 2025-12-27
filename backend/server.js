const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const path = require('path'); // 👈 Import Path
dotenv.config();
connectDB(); // DB Connect

const app = express();

// Middleware
app.use(cors()); // Frontend Permission
app.use(express.json()); // JSON Data parhna
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));