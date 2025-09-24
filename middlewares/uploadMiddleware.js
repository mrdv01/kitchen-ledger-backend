import multer from "multer";

// store file in memory (so we can directly pass to OCR/AI)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
