import { Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { UploadFileCommand, UploadFileHandler, DownloadFileCommand, DownloadFileHandler } from "@novaris/files";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface FileRecordResponse {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

/**
 * FilesController — API de `files` (`ADR-0039`, `ENG-0140`). `POST /files`
 * (multipart, `FileInterceptor` do `@nestjs/platform-express`, já
 * dependência existente desta API) e `GET /files/:id` (stream de bytes real).
 */
@Controller("files")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.files.manage")
export class FilesController {
  constructor(
    private readonly uploadHandler: UploadFileHandler,
    private readonly downloadHandler: DownloadFileHandler,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: AuthenticatedRequest): Promise<FileRecordResponse> {
    if (!file) {
      throw new HttpException({ code: "VALIDATION_ERROR", message: 'Campo "file" (multipart) é obrigatório' }, HttpStatus.BAD_REQUEST);
    }
    const result = await this.uploadHandler.execute(
      new UploadFileCommand({
        organizationId: req.user.organizationId,
        filename: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get(":id")
  async download(@Param("id") id: string, @Req() req: AuthenticatedRequest, @Res() res: Response): Promise<void> {
    const result = await this.downloadHandler.execute(new DownloadFileCommand({ organizationId: req.user.organizationId, fileId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    const { record, content } = result.getValue()!;
    res.setHeader("Content-Type", record.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${record.filename}"`);
    res.send(content);
  }
}

function toResponse(record: { id: { toString(): string }; filename: string; mimeType: string; sizeBytes: number; createdAt: Date }): FileRecordResponse {
  return {
    id: record.id.toString(),
    filename: record.filename,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    createdAt: record.createdAt.toISOString(),
  };
}
