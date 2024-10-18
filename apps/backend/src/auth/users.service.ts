import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findOrCreate(userData: Partial<User>): Promise<User> {
    let user = await this.findOne(userData.email);
    if (!user) {
      user = await this.create(userData);
    }
    return user;
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }
}  