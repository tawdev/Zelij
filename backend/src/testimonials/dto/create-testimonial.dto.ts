import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  role: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2)
  initial: string;

  @IsString()
  @MinLength(1)
  tag: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateTestimonialDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  role?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2)
  @IsOptional()
  initial?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
