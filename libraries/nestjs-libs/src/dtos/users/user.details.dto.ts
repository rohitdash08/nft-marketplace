import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UserDetailsDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsUrl()
  @IsOptional()
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'Invalid Solana wallet address format',
  })
  walletAddress?: string;

  @IsNumber()
  @IsOptional()
  @Min(-12)
  @Max(12)
  timezone?: number = 0;
}

export class UserDetailsResponseDto {
  id: string;
  email: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  walletAddress?: string;
  timezone: number;
  lastOnline: Date;
  activated: boolean;
  walletConnectedAt?: Date;

  ownedNFTs?: Array<{
    id: string;
    tokenId: string;
    name: string;
    imageUrl: string;
    mintAddress: string;
    price?: number;
    status: string;
  }>;

  collections?: Array<{
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    floorPrice?: number;
    totalVolume?: number;
    verified: boolean;
  }>;

  createdNFTs?: Array<{
    id: string;
    tokenId: string;
    name: string;
    imageUrl: string;
    mintAddress: string;
    price?: number;
    status: string;
  }>;
}
