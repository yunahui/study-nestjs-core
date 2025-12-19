import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly options: {
      maxSize: number; // MB 단위
      mimetype: string;
    },
  ) {}

  async transform(value: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    const byteSize = this.options.maxSize * 1_000_000;

    if (value.size > byteSize) {
      throw new BadRequestException(
        `${this.options.maxSize}MB 이하의 파일만 업로드 가능합니다.`,
      );
    }

    if (value.mimetype !== this.options.mimetype) {
      throw new BadRequestException(
        `${this.options.mimetype} 파일만 업로드 가능합니다.`,
      );
    }

    return value;
  }
}
