import multer from "multer";

// Temporary storage on disk before Cloudinary upload
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 5,            // enforce max 5 files
        fileSize: 5 * 1024 * 1024 // optional: 5 MB per file limit
    }
});

