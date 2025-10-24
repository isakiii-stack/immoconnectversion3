import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { filename, path: filePath } = req.file;
    const { width, height, quality = 80 } = req.body;

    // Process image with Sharp
    let processedImage = sharp(filePath);

    // Resize if dimensions provided
    if (width || height) {
      processedImage = processedImage.resize(
        width ? parseInt(width) : null,
        height ? parseInt(height) : null,
        {
          fit: 'inside',
          withoutEnlargement: true
        }
      );
    }

    // Optimize image
    processedImage = processedImage
      .jpeg({ quality: parseInt(quality) })
      .png({ quality: parseInt(quality) })
      .webp({ quality: parseInt(quality) });

    // Save processed image
    const processedPath = path.join(path.dirname(filePath), `processed_${filename}`);
    await processedImage.toFile(processedPath);

    // Delete original file
    fs.unlinkSync(filePath);

    // Move processed file to original location
    fs.renameSync(processedPath, filePath);

    const imageUrl = `/uploads/${filename}`;

    logger.info(`Image uploaded: ${filename} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename,
        url: imageUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Upload image error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to clean up uploaded file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

export const deleteImage = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    logger.info(`Image deleted: ${filename} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    logger.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

export const getImageUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const imageUrl = `/uploads/${filename}`;

    res.json({
      success: true,
      data: {
        filename,
        url: imageUrl
      }
    });
  } catch (error) {
    logger.error('Get image URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image URL'
    });
  }
};
