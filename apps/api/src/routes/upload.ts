import express from 'express'
import multer from 'multer'
import { prisma } from '../index'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { CloudinaryService } from '../services/cloudinary'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// @route   POST /api/upload/profile-image
// @desc    Upload profile image
// @access  Private
router.post('/profile-image', authenticateToken, upload.single('image'), async (req: AuthRequest, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      })
    }

    const userId = req.user.id

    // Upload to Cloudinary
    const uploadResult = await CloudinaryService.uploadProfileImage(
      req.file.buffer,
      userId
    )

    // Update user's avatar in database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.url }
    })

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height
      }
    })
  } catch (error) {
    console.error('Profile image upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    })
  }
})

// @route   DELETE /api/upload/profile-image
// @desc    Delete profile image
// @access  Private
router.delete('/profile-image', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id

    // Delete from Cloudinary
    const deleteResult = await CloudinaryService.deleteProfileImage(userId)

    if (deleteResult.success) {
      // Update user's avatar in database
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: null }
      })

      res.json({
        success: true,
        message: 'Profile image deleted successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: deleteResult.message
      })
    }
  } catch (error) {
    console.error('Profile image delete error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile image'
    })
  }
})

// @route   POST /api/upload/image
// @desc    Upload general image
// @access  Private
router.post('/image', authenticateToken, upload.single('image'), async (req: AuthRequest, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      })
    }

    const { folder } = req.body

    // Upload to Cloudinary
    const uploadResult = await CloudinaryService.uploadImage(req.file.buffer, {
      folder: folder || 'codearena/general'
    })

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height
      }
    })
  } catch (error) {
    console.error('Image upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    })
  }
})

// @route   DELETE /api/upload/image/:publicId
// @desc    Delete image by public ID
// @access  Private
router.delete('/image/:publicId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { publicId } = req.params

    // Delete from Cloudinary
    const deleteResult = await CloudinaryService.deleteImage(publicId)

    if (deleteResult.success) {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: deleteResult.message
      })
    }
  } catch (error) {
    console.error('Image delete error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    })
  }
})

// @route   GET /api/upload/signature
// @desc    Get upload signature for client-side uploads
// @access  Private
router.get('/signature', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { folder } = req.query

    const signature = CloudinaryService.generateUploadSignature({
      folder: folder as string || 'codearena/general'
    })

    res.json({
      success: true,
      data: signature
    })
  } catch (error) {
    console.error('Signature generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature'
    })
  }
})

export default router 