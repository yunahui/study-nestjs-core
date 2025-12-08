import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class GetMoviesDto {
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsNotEmpty()
  @IsOptional()
  @IsArray()
  genre: string[];
}
