import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import type { Request } from 'express';
import sharp from 'sharp';

// Use process.cwd() to get the project root accurately
const UPLOADS_DIR = join(process.cwd(), 'uploads');

// Ensure the directory exists
mkdirSync(UPLOADS_DIR, { recursive: true });

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit for raw uploads
            },
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}.webp`;
        const filePath = join(UPLOADS_DIR, filename);

        try {
            await sharp(file.buffer)
                .resize(500, 500, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
                })
                .webp({ quality: 80, lossless: false })
                .toFile(filePath);

            const url = `/uploads/${filename}`;
            return { url, filename };
        } catch (error) {
            throw new BadRequestException('Failed to process image');
        }
    }

    @Post('multiple')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: memoryStorage(),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Files are required');
        }

        const processedFiles = await Promise.all(
            files.map(async (file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const filename = `${uniqueSuffix}.webp`;
                const filePath = join(UPLOADS_DIR, filename);

                await sharp(file.buffer)
                    .resize(500, 500, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
                    })
                    .webp({ quality: 80, lossless: false })
                    .toFile(filePath);

                return { url: `/uploads/${filename}`, filename };
            })
        );

        return processedFiles;
    }
}
