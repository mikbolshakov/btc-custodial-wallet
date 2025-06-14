import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { decryptPrivateKey } from 'src/common/utils/crypto.utils';
import axios from 'axios';

const ECPair = ECPairFactory(ecc);

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getBalance(address: string): Promise<{ address: string; balance: number }> {
    const network = process.env.NETWORK === 'mainnet' ? 'main' : 'test3';
    const url = `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}/balance`;

    try {
      const { data } = await axios.get(url);
      const balanceBtc = data.final_balance / 1e8;
      return { address, balance: balanceBtc };
    } catch (err) {
      throw new Error(`Failed to fetch balance: ${(err as Error).message}`);
    }
  }

  async sendBtc(userId: number, toAddress: string, amountBtc: number): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const decryptedKey = decryptPrivateKey(user.privateKey);

    const isMain = process.env.NETWORK === 'mainnet';
    const network = isMain ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    const keyPair = ECPair.fromWIF(decryptedKey, network);
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network,
    });

    if (!address) {
      throw new Error('Failed to generate address from key pair');
    }

    const utxoUrl = `https://api.blockcypher.com/v1/btc/${isMain ? 'main' : 'test3'}/addrs/${address}?unspentOnly=true`;
    const { data } = await axios.get(utxoUrl);

    const utxos = [...(data.txrefs || []), ...(data.unconfirmed_txrefs || [])];

    if (utxos.length === 0) throw new Error('No UTXOs found');

    const psbt = new bitcoin.Psbt({ network });

    const payment = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network,
    });

    if (!payment.output) {
      throw new Error('Failed to create payment output script');
    }

    let totalInput = 0;
    for (const utxo of utxos) {
      psbt.addInput({
        hash: utxo.tx_hash,
        index: utxo.tx_output_n,
        witnessUtxo: {
          script: payment.output,
          value: utxo.value,
        },
      });
      totalInput += utxo.value;
    }

    const amountSatoshi = Math.floor(amountBtc * 1e8);
    const fee = 10000;
    if (totalInput < amountSatoshi + fee) throw new Error('Insufficient balance');

    psbt.addOutput({ address: toAddress, value: amountSatoshi });
    if (totalInput > amountSatoshi + fee) {
      psbt.addOutput({ address, value: totalInput - amountSatoshi - fee });
    }

    psbt.signAllInputs(keyPair as any);
    psbt.finalizeAllInputs();

    const rawTx = psbt.extractTransaction().toHex();

    const broadcastUrl = `https://api.blockcypher.com/v1/btc/${isMain ? 'main' : 'test3'}/txs/push`;
    const response = await axios.post(broadcastUrl, { tx: rawTx });

    return response.data.tx.hash;
  }
}
