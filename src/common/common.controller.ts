import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './pipe/file-validation.pipe';

@Controller('common')
export class CommonController {
  @Post('video')
  @UseInterceptors(FileInterceptor('video'))
  createVideo(
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 20,
        mimetype: 'video/mp4',
      }),
    )
    video: Express.Multer.File,
  ) {
    return {
      fileName: video.filename,
    };
  }
}
