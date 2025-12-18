import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  // id_ASC id_DESC
  order: string[] = [];

  @IsInt()
  @IsOptional()
  take: number = 5;
}
