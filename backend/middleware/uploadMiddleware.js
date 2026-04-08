import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Created directory: `);
    let uploadPath = '';
    const id = req.params.id;
    if (file.fieldname === 'profileImage') {
      uploadPath = `content/uploads/${id}/profile-images/`;
    } else if (file.fieldname === 'StudentprofileImage') {
      uploadPath = `content/uploads/student/${id}/profile-images/`;
    }else if (file.fieldname === 'pf_doc') {
      uploadPath = `content/uploads/${id}/documents/pf/`;
    } else if (file.fieldname === 'exp_doc') {
      uploadPath = `content/uploads/${id}/documents/experience/`;
    } else if (file.fieldname === 'todoFileUpload') {
      uploadPath = `content/uploads/homework/`;
    }else if (file.fieldname === 'achievementFileUpload') {
      uploadPath = `content/uploads/achievement/`;
    }      
      else {
      uploadPath = `content/uploads/${id}/certificates/`;
    }

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  console.log(`Created directory:1 `);
  if (file.fieldname === 'profileImage' || file.fieldname === 'StudentprofileImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) are allowed for profile pictures!'), false);
    }
  } else if (['certificate', 'pf_doc', 'exp_doc','others','todoFileUpload','achievementFileUpload','document_path'].includes(file.fieldname)) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word documents, and image files (JPEG, PNG, GIF, etc.) are allowed!'), false);
    }
  } else {
    cb(new Error('Invalid file upload!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default upload;
