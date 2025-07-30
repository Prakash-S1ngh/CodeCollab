import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  size: number
}

export interface DeleteResult {
  success: boolean
  message: string
}

export class CloudinaryService {
  /**
   * Upload an image to Cloudinary
   */
  static async uploadImage(
    file: Buffer | string,
    options: {
      folder?: string
      transformation?: any
      publicId?: string
    } = {}
  ): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'codearena',
        transformation: options.transformation || [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        public_id: options.publicId,
        resource_type: 'image' as const,
      }

      let result: any
      if (typeof file === 'string') {
        // Upload from URL
        result = await cloudinary.uploader.upload(file, uploadOptions)
      } else {
        // Upload from buffer
        result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: any, result: any) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          uploadStream.end(file)
        })
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error('Failed to upload image')
    }
  }

  /**
   * Upload profile image with specific transformations
   */
  static async uploadProfileImage(
    file: Buffer | string,
    userId: string
  ): Promise<UploadResult> {
    const options = {
      folder: 'codearena/profiles',
      publicId: `profile_${userId}`,
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    }

    return this.uploadImage(file, options)
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<DeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image'
      })

      if (result.result === 'ok') {
        return {
          success: true,
          message: 'Image deleted successfully'
        }
      } else {
        return {
          success: false,
          message: 'Failed to delete image'
        }
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      return {
        success: false,
        message: 'Failed to delete image'
      }
    }
  }

  /**
   * Delete profile image
   */
  static async deleteProfileImage(userId: string): Promise<DeleteResult> {
    const publicId = `codearena/profiles/profile_${userId}`
    return this.deleteImage(publicId)
  }

  /**
   * Get image info from Cloudinary
   */
  static async getImageInfo(publicId: string) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'image'
      })
      return result
    } catch (error) {
      console.error('Cloudinary get info error:', error)
      throw new Error('Failed to get image info')
    }
  }

  /**
   * Generate a signed upload URL for client-side uploads
   */
  static generateUploadSignature(params: any = {}) {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        ...params
      },
      process.env.CLOUDINARY_API_SECRET!
    )

    return {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    }
  }
} 