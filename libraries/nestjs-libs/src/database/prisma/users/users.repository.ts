import { Injectable } from '@nestjs/common';
import { AuthService } from '@nft-marketplace/helpers/auth/auth.service';
import { PrismaRepository } from '@nft-marketplace/nestjs-libs/database/prisma/prisma.service';
import { NFTListingDto } from '@nft-marketplace/nestjs-libs/dtos/nfts/nft.details.dto';
import {
  UserDetailsDto,
  UserDetailsResponseDto,
} from '@nft-marketplace/nestjs-libs/dtos/users/user.details.dto';
import {
  Prisma,
  Provider,
  NFTStatus,
  ListingStatus,
  BidStatus,
  User,
} from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private _user: PrismaRepository<'user'>) {}

  getUserById(id: string) {
    return this._user.model.user.findUnique({
      where: { id },
      include: {
        ownedNFTs: {
          include: {
            collection: true,
            listings: {
              where: { status: ListingStatus.ACTIVE },
            },
          },
        },
        createdNFTs: {
          include: {
            collection: true,
          },
        },
        collections: {
          include: {
            nfts: true,
          },
        },
        listings: {
          where: { status: ListingStatus.ACTIVE },
          include: {
            nft: true,
            bids: true,
          },
        },
        bids: {
          where: { status: BidStatus.PENDING },
          include: {
            listing: {
              include: {
                nft: true,
              },
            },
          },
        },
        transactionsMade: {
          orderBy: { createdAt: 'desc' },
        },
        transactionsReceived: {
          orderBy: { createdAt: 'desc' },
        },
        picture: true,
      },
    });
  }

  getUserByEmail(email: string) {
    return this._user.model.user.findFirst({
      where: {
        email,
        providerName: Provider.LOCAL,
      },
      include: {
        picture: true,
      },
    });
  }

  getUserByWalletAddress(walletAddress: string) {
    return this._user.model.user.findUnique({
      where: { walletAddress },
      include: {
        ownedNFTs: {
          where: { status: NFTStatus.MINTED },
        },
        createdNFTs: {
          where: { status: NFTStatus.MINTED },
        },
        collections: {
          include: {
            nfts: true,
          },
        },
        listings: {
          where: { status: ListingStatus.ACTIVE },
        },
        bids: {
          where: { status: BidStatus.PENDING },
        },
      },
    });
  }

  activateUser(id: string) {
    return this._user.model.user.update({
      where: { id },
      data: {
        activated: true,
        updatedAt: new Date(),
      },
    });
  }

  getUserByProvider(providerId: string, provider: Provider) {
    return this._user.model.user.findFirst({
      where: {
        providerId,
        providerName: provider,
      },
      include: {
        picture: true,
      },
    });
  }

  updatePassword(id: string, password: string) {
    return this._user.model.user.update({
      where: {
        id,
        providerName: Provider.LOCAL,
      },
      data: {
        password: AuthService.hashPassword(password),
        updatedAt: new Date(),
      },
    });
  }

  connectWallet(userId: string, walletAddress: string) {
    return this._user.model.user.update({
      where: { id: userId },
      data: {
        walletAddress,
        updatedAt: new Date(),
      },
    });
  }

  async getPersonal(userId: string): Promise<UserDetailsResponseDto> {
    const user = await this._user.model.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        walletAddress: true,
        picture: {
          select: {
            path: true,
          },
        },
        timezone: true,
        lastOnline: true,
        activated: true,
        collections: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            floorPrice: true,
            verified: true,
            nfts: {
              select: {
                price: true,
              },
            },
          },
        },
        ownedNFTs: {
          select: {
            id: true,
            tokenId: true,
            name: true,
            imageUrl: true,
            mintAddress: true,
            price: true,
            status: true,
            collection: {
              select: {
                id: true,
                name: true,
                verified: true,
              },
            },
          },
        },
        createdNFTs: {
          select: {
            id: true,
            tokenId: true,
            name: true,
            imageUrl: true,
            mintAddress: true,
            price: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Transform collections to match DTO type
    const transformedCollections = user.collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description || undefined,
      imageUrl: collection.imageUrl || undefined,
      floorPrice: collection.floorPrice || undefined,
      verified: collection.verified,
      totalVolume: collection.nfts.reduce(
        (sum: number, nft: { price: number | null }) => sum + (nft.price || 0),
        0
      ),
    }));

    // Transform owned NFTs to match DTO type
    const transformedOwnedNFTs = user.ownedNFTs.map((nft) => ({
      id: nft.id,
      tokenId: nft.tokenId,
      name: nft.name,
      imageUrl: nft.imageUrl,
      mintAddress: nft.mintAddress,
      price: nft.price || undefined,
      status: nft.status.toString(),
    }));

    // Transform created NFTs to match DTO type
    const transformedCreatedNFTs = user.createdNFTs.map((nft) => ({
      id: nft.id,
      tokenId: nft.tokenId,
      name: nft.name,
      imageUrl: nft.imageUrl,
      mintAddress: nft.mintAddress,
      price: nft.price || undefined,
      status: nft.status.toString(),
    }));

    const response: UserDetailsResponseDto = {
      id: user.id,
      email: user.email,
      username: user.username || undefined,
      bio: user.bio || undefined,
      avatarUrl: user.picture?.path,
      timezone: user.timezone,
      lastOnline: user.lastOnline,
      activated: user.activated,
      walletAddress: user.walletAddress || undefined,
      collections: transformedCollections,
      ownedNFTs: transformedOwnedNFTs,
      createdNFTs: transformedCreatedNFTs,
    };

    return response;
  }

  async changePersonal(userId: string, body: UserDetailsDto) {
    const updateData: Prisma.UserUpdateInput = {
      username: body.username,
      bio: body.bio,
      timezone: body.timezone || 0,
      updatedAt: new Date(),
    };

    if (body.avatarUrl) {
      updateData.picture = {
        create: {
          name: 'avatar',
          path: body.avatarUrl,
        },
      };
    }

    if (body.walletAddress) {
      updateData.walletAddress = body.walletAddress;
    }

    return this._user.model.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        picture: true,
      },
    });
  }

  async getNFTCreators(params: NFTListingDto) {
    const page = params.page || 1;
    const limit = params.limit || 20;

    const filter: Prisma.UserWhereInput = {
      createdNFTs: {
        some: {},
      },
    };

    const creators = await this._user.model.user.findMany({
      where: filter,
      select: {
        id: true,
        username: true,
        bio: true,
        walletAddress: true,
        picture: {
          select: {
            path: true,
          },
        },
        collections: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            floorPrice: true,
            verified: true,
            nfts: {
              select: {
                price: true,
              },
            },
          },
        },
        createdNFTs: {
          select: {
            id: true,
            tokenId: true,
            name: true,
            imageUrl: true,
            mintAddress: true,
            price: true,
            status: true,
          },
        },
        _count: {
          select: {
            createdNFTs: true,
            collections: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdNFTs: {
          _count: 'desc',
        },
      },
    });

    const total = await this._user.model.user.count({
      where: filter,
    });

    return {
      creators: creators.map((creator) => ({
        ...creator,
        avatarUrl: creator.picture?.path,
        collections: creator.collections.map((collection) => ({
          ...collection,
          totalVolume: collection.nfts.reduce(
            (sum: number, nft: { price: number | null }) =>
              sum + (nft.price || 0),
            0
          ),
        })),
      })),
      total,
    };
  }

  async getUserTradingActivity(userId: string) {
    return this._user.model.user.findUnique({
      where: { id: userId },
      select: {
        listings: {
          where: {
            status: ListingStatus.ACTIVE,
          },
          include: {
            nft: true,
            bids: {
              where: {
                status: BidStatus.PENDING,
              },
            },
          },
        },
        bids: {
          where: {
            status: BidStatus.PENDING,
          },
          include: {
            listing: {
              include: {
                nft: true,
              },
            },
          },
        },
        transactionsMade: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            nft: true,
          },
        },
        transactionsReceived: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            nft: true,
          },
        },
      },
    });
  }
}
