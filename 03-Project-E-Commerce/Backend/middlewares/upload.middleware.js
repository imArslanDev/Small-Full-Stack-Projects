import multer from 'multer';
import path from 'path';

// Configure Storage Engine
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // Unique filename: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File Validation (Only Images Allowed)
const checkFileTypes = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (JPEG, JPG, PNG, WEBP)'));
    }
};

export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileTypes(file, cb);
    }
});