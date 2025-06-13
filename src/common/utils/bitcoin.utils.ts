import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';

export function generateSegWitAddress(network: bitcoin.Network) {
  const ECPair = ECPairFactory(ecc);
  const keyPair = ECPair.makeRandom({ network });

  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(keyPair.publicKey),
    network,
  });

  if (!address) throw new Error('Failed to generate address');

  return {
    address,
    privateKey: keyPair.toWIF(),
  };
}
