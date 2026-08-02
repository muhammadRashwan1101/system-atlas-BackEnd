const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/avatars");
    },
    filename: function (req, file, cb) {
       
        const tempName = `tmp-${crypto.randomBytes(16).toString("hex")}`;
        cb(null, tempName);
    },
});

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error("Invalid file extension"), false);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error("Invalid file MIME type"), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
