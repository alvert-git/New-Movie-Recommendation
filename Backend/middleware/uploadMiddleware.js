const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const postersDir = path.join(__dirname, '../uploads/posters');
const backdropsDir = path.join(__dirname, '../uploads/backdrops');

if (!fs.existsSync(postersDir)) {
    fs.mkdirSync(postersDir, { recursive: true });
}
if (!fs.existsSync(backdropsDir)) {
    fs.mkdirSync(backdropsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'poster') {
            cb(null, postersDir);
        } else if (file.fieldname === 'backdrop') {
            cb(null, backdropsDir);
        } else {
            cb(new Error("Invalid field name"), false);
        }
    },
    filename: function (req, file, cb) {
        // use a timestamp or a unique ID based on movie
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;
