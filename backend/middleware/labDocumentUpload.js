import multer from 'multer'
import path from 'path'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname)
    const fileName = file.originalname.replace(ext, '').replace(/\s+/g, '-')
    return {
      folder: 'lab-documents',
      resource_type: 'raw',
      type: 'upload',
      public_id: `${Date.now()}-${fileName}`,
      format: ext.replace('.', ''),
      flags: 'attachment',
    }
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF, JPG, PNG, and WebP files are allowed'), false)
  }
}

const labDocumentUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

export default labDocumentUpload
