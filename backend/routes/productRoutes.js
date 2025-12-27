const express = require('express');
const router = express.Router();
const multer = require('multer'); // 👈 Import Multer
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

// --- MULTER CONFIGURATION (Files kahan save hongi) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Uploads folder mein dalo
    },
    filename: (req, file, cb) => {
        // Unique naam banao (Date + Original Name)
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// --- ROUTES ---
// upload.fields ka matlab: Hum 2 tarah ki files bhejenge (image aur pdf)
router.get('/', getProducts);

router.post('/', upload.fields([{ name: 'image' }, { name: 'pdf' }]), createProduct);

router.put('/:id', upload.fields([{ name: 'image' }, { name: 'pdf' }]), updateProduct);

router.delete('/:id', deleteProduct);

module.exports = router;