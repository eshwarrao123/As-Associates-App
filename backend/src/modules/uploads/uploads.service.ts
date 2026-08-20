import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { FileType } from '@prisma/client';

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    @Inject('CLOUDINARY') private cloudinaryConfig: any,
  ) { }

  // ─── Helper: determine FileType enum from mimetype ─────────────────────────
  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    return 'DOCUMENT';
  }

  // ─── Employee: Upload file ──────────────────────────────────────────────────
  async uploadFile(
    file: Express.Multer.File,
    projectId: string,
    progressLogId: string | undefined,
    userId: string,
  ) {
    // Validate file type
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, WebP, PDF',
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Validate employee has active assignment on this project
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        userId,
        projectId,
        isActive: true,
      },
    });

    if (!assignment || !assignment.isActive) {
      throw new BadRequestException('Not assigned to this project');
    }

    // Validate progressLogId if provided
    if (progressLogId) {
      const progressLog = await this.prisma.progressLog.findUnique({
        where: { id: progressLogId },
      });
      if (!progressLog) {
        throw new NotFoundException('Progress log not found');
      }
    }

    // Upload to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `as-associates/${projectId}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(file.buffer);
    });

    // Save to DB using exact schema field names
    const upload = await this.prisma.upload.create({
      data: {
        userId,
        projectId,
        progressLogId: progressLogId || null,
        storageKey: result.public_id,
        fileUrl: result.secure_url,
        fileType: this.getFileType(file.mimetype),
        mimeType: file.mimetype,
        fileName: file.originalname,
        fileSizeBytes: file.size,
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        progressLogId: true,
        storageKey: true,
        fileUrl: true,
        fileType: true,
        mimeType: true,
        fileName: true,
        fileSizeBytes: true,
        createdAt: true,
      },
    });

    return upload;
  }

  // ─── Admin: List all uploads ────────────────────────────────────────────────
  async listUploads(query: {
    projectId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const { projectId, userId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;

    const [uploads, total] = await this.prisma.$transaction([
      this.prisma.upload.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          storageKey: true,
          fileUrl: true,
          fileType: true,
          mimeType: true,
          fileName: true,
          fileSizeBytes: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.upload.count({ where }),
    ]);

    return {
      data: uploads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Employee: Get own uploads ──────────────────────────────────────────────
  async getMyUploads(
    userId: string,
    query: { projectId?: string; page?: number; limit?: number },
  ) {
    const { projectId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (projectId) where.projectId = projectId;

    const [uploads, total] = await this.prisma.$transaction([
      this.prisma.upload.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          storageKey: true,
          fileUrl: true,
          fileType: true,
          mimeType: true,
          fileName: true,
          fileSizeBytes: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.upload.count({ where }),
    ]);

    return {
      data: uploads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Admin: Delete upload ───────────────────────────────────────────────────
  async deleteUpload(id: string) {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) throw new NotFoundException('Upload not found');

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(upload.storageKey);
    } catch {
      // Log but don't fail — DB record should still be removed
    }

    // Delete from DB
    await this.prisma.upload.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }
}
