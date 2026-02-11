import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PublishMatchDto {
  @IsString()
  @IsNotEmpty()
  winner!: string;

  @IsString()
  @IsNotEmpty()
  loser!: string;

  @IsBoolean()
  draw!: boolean;
}
