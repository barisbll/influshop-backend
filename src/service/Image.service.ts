import { ConfigOptions, v2 as cloudinarySetup } from 'cloudinary';
import { Service } from 'typedi';
import { config } from '../config/config';

type ImagePresets = 'influshop_items' | 'influshop_comments' | 'influshop_profile_images';

@Service()
export class ImageUploader {
  cloudinary: ConfigOptions;

  constructor() {
    this.cloudinary = cloudinarySetup.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private validateImage(image: string): boolean {
    return image.startsWith('data:image');
  }

  async deleteImage(publicId: string): Promise<void> {
    await this.cloudinary.v2.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }

  async updateImage(image: string, preset: ImagePresets, publicId: string): Promise<string> {
    if (!this.validateImage(image)) {
      throw new Error('Invalid Image');
    }

    const { public_id: newPublicId } = await cloudinarySetup.uploader.upload(image, {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
      upload_preset: preset,
    });

    return newPublicId;
  }

  async uploadImage(image: string, preset: ImagePresets): Promise<string> {
    if (!this.validateImage(image)) {
      throw new Error('Invalid file type, only images are allowed');
    }

    const { public_id: publicId } = await cloudinarySetup.uploader.upload(image, {
      upload_preset: preset,
    });
    return publicId;
  }

  async uploadMultipleImages(images: string[], preset: ImagePresets): Promise<string[]> {
    const publicIds: string[] = [];
    images.forEach(async (image) => {
      if (!this.validateImage(image)) {
        throw new Error('Invalid file type, only images are allowed');
      }

      const { public_id: publicId } = await cloudinarySetup.uploader.upload(image, {
        upload_preset: preset,
      });
      publicIds.push(publicId);
    });

    return publicIds;
  }
}
