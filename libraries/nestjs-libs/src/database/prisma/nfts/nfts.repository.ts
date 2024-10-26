import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@nft-marketplace/nestjs-libs/database/prisma/prisma.service';
import { NFTListingDto } from '@nft-marketplace/nestjs-libs/dtos/nfts/nft.details.dto';

@Injectable()
export class NFTsRepository {
  constructor(private _nft: PrismaRepository<'nft'>) {}

  async createNFT(data: any) {
    return this._nft.model.nft.create({
      data,
    });
  }

  async getNFTById(id: string) {
    return this._nft.model.nft.findUnique({
      where: { id },
      include: {
        owner: true,
        creator: true,
        collection: true,
        listings: true,
      },
    });
  }

  async listNFTs(params: NFTListingDto) {
    const {page = 1, limit = 20} = params;
    const skip = (page - 1) * limit;
    
    const [nfts, total] = await Promise.all([
        this._nft.model.nft.findMany({
            skip,
            take: limit,
            include: {
                owner: true,
                creator: true,
                collections: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        this._nft.model.nft.count()
    ]);

    return {
        nfts,
        total,
        page,
        limit,
    }
  }

  async updateNFT(id: string, data: any) {
    return this._nft.model.nft.update({
        where: { id },
        data,
    });
  }
}
