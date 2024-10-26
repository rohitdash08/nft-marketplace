import { Injectable } from '@nestjs/common';
import { NFTsRepository } from './nfts.repository';
import { NFTListingDto } from '@nft-marketplace/nestjs-libs/dtos/nfts/nft.details.dto';

@Injectable()
export class NFTsService {
  constructor(private readonly _nftRepository: NFTsRepository) {}

  async createNFT(data: any) {
    return this._nftRepository.createNFT(data);
  }

  async getNFTById(id: string) {
    return this._nftRepository.getNFTById(id);
  }

  async listNFTs(params: NFTListingDto) {
    return this._nftRepository.listNFTs(params);
  }

  async updateNFT(id: string, data: any) {
    return this._nftRepository.updateNFT(id, data);
  }
}
