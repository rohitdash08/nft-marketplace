import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NFTListingDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}

export class NFTCreatorResponseDto {
  id: string;
  username?: string;
  bio?: string;
  walletAddress?: string;
  avatarUrl?: string;
  bannerUrl?: string;

  collections?: Array<{
    id: string;
    name: string;
    floorPrice?: number;
    totalVolume: number;
    verified: boolean;
  }>;

  createdNFTs?: Array<{
    id: string;
    tokenId: string;
    name: string;
    price?: number;
    status: string;
  }>;

  _count?: {
    createdNFTs: number;
    collections: number;
  };
}

export class NFTCreatorsResponseDto {
  creators: NFTCreatorResponseDto[];
  total: number;
}
