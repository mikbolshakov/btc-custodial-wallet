import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/index';
import * as bitcoin from 'bitcoinjs-lib';
import { NotFoundException } from '@nestjs/common';
import { generateSegWitAddress } from 'src/common/utils/bitcoin.utils';
import { encryptPrivateKey, decryptPrivateKey } from 'src/common/utils/crypto.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(username: string): Promise<User> {
    const isMain = process.env.NETWORK === 'mainnet';
    const network = isMain ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    const { address, privateKey } = generateSegWitAddress(network);

    const encryptedKey = encryptPrivateKey(privateKey);

    const user = this.userRepository.create({
      username,
      address,
      privateKey: encryptedKey,
    });

    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.privateKey = decryptPrivateKey(user.privateKey);

    return user;
  }
}
