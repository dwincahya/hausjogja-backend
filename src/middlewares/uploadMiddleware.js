const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage directories
const uploadsDir = path.join(__dirname, '../../public/uploads');
const profileImagesDir = path.join(uploadsDir, 'profile');
const productImagesDir = path.join(uploadsDir, 'products');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}
const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Upload middleware for profiles
const uploadProfile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, profileImagesDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter
});

// Upload middleware for products
const uploadProduct = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, productImagesDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

module.exports = {
  profile: uploadProfile,
  product: uploadProduct
};