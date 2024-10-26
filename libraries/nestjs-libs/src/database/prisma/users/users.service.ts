import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { UsersRepository } from '@nft-marketplace/nestjs-libs/database/prisma/users/users.repository';
import {
  UserDetailsDto,
  UserDetailsResponseDto,
} from '@nft-marketplace/nestjs-libs/dtos/users/user.details.dto';
import { NFTListingDto } from '@nft-marketplace/nestjs-libs/dtos/nfts/nft.details.dto';

@Injectable()
export class UsersService {
  constructor(private readonly _userRepository: UsersRepository) {}

  getUserByEmail(email: string) {
    return this._userRepository.getUserByEmail(email);
  }

  getUserById(id: string) {
    return this._userRepository.getUserById(id);
  }

  getUserByProvider(providerId: string, provider: Provider) {
    return this._userRepository.getUserByProvider(providerId, provider);
  }

  activateUser(id: string) {
    return this._userRepository.activateUser(id);
  }

  updatePassword(id: string, password: string) {
    return this._userRepository.updatePassword(id, password);
  }

  getUserByWalletAddress(walletAddress: string) {
    return this._userRepository.getUserByWalletAddress(walletAddress);
  }

  connectWallet(userId: string, walletAddress: string) {
    return this._userRepository.connectWallet(userId, walletAddress);
  }

  async getPersonal(userId: string): Promise<UserDetailsResponseDto> {
    return this._userRepository.getPersonal(userId);
  }

  async changePersonal(userId: string, body: UserDetailsDto) {
    return this._userRepository.changePersonal(userId, body);
  }

  async getNFTCreators(params: NFTListingDto) {
    return this._userRepository.getNFTCreators(params);
  }

  async getUserStats(userId: string) {
    const user = await this._userRepository.getUserById(userId);

    if (!user) {
      return null;
    }

    return {
      totalOwnedNFTs: user.ownedNFTs?.length || 0,
      totalCreatedNFTs: user.createdNFTs?.length || 0,
      totalCollections: user.collections?.length || 0,
      isWalletConnected: !!user.walletAddress,
      lastOnline: user.lastOnline,
    };
  }

  async getUserNFTActivity(userId: string) {
    const activity = await this._userRepository.getUserTradingActivity(userId);
    if (!activity) return null;

    return {
      listings: activity.listings,
      bids: activity.bids,
      transactionsMade: activity.transactionsMade,
      transactionsReceived: activity.transactionsReceived,
    };
  }

  async getUserCollections(userId: string) {
    const user = await this._userRepository.getUserById(userId);
    if (!user) return null;

    return {
      collections: user.collections?.map((collection) => ({
        ...collection,
        nftCount: collection.nfts?.length || 0,
        totalVolume:
          collection.nfts?.reduce((sum, nft) => sum + (nft.price || 0), 0) || 0,
      })),
    };
  }

  async isUserVerified(userId: string) {
    const user = await this._userRepository.getUserById(userId);
    if (!user) return null;

    return {
      isActivated: user.activated || false,
      hasWallet: !!user.walletAddress,
      // Remove walletConnectedAt as it's not in the schema
      lastOnline: user.lastOnline,
    };
  }

  async getUserTradingStats(userId: string) {
    const activity = await this._userRepository.getUserTradingActivity(userId);
    if (!activity) return null;

    const totalSold = activity.transactionsReceived?.length || 0;
    const totalBought = activity.transactionsMade?.length || 0;
    const totalVolume = [
      ...(activity.transactionsMade || []),
      ...(activity.transactionsReceived || []),
    ].reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalSold,
      totalBought,
      totalVolume,
      activeBids: activity.bids?.length || 0,
      activeListings: activity.listings?.length || 0,
    };
  }
}
