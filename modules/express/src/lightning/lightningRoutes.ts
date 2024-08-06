import * as express from 'express';
import {
  BaseCoin,
  decodeOrElse,
  Wallet,
  createMessageSignature,
  unwrapLightningCoinSpecific,
  getUtxolibNetwork,
  signerMacaroonPermissions,
  createWatchOnly,
  addIPCaveatToMacaroon,
  LightningAuthKeychain,
  LightningAuthKeychainCodec,
  LightningKeychain,
  LightningKeychainCodec,
} from '@bitgo/sdk-core';
import * as utxolib from '@bitgo/utxo-lib';
import * as https from 'https';
import { Buffer } from 'buffer';

import { CreateSignerMacaroonRequestCodec, GetWalletStateResponse, InitLightningWalletRequestCodec } from './codecs';
import { getLightningSignerConfig } from './lightningUtils';
import { bakeMacaroon, createHttpAgent, getWalletState, initWallet } from './signerClient';

type Decrypt = (params: { input: string; password: string }) => string;

async function getLightningWalletKeychains(
  coin: BaseCoin,
  wallet: Wallet,
  options: { fetchUserKey: boolean; fetchAuthKeys: boolean } = { fetchUserKey: true, fetchAuthKeys: true }
): Promise<{ userKey?: LightningKeychain; userAuthKey?: LightningAuthKeychain; nodeAuthKey?: LightningAuthKeychain }> {
  if (wallet.keyIds().length !== 1) {
    throw new Error('Invalid number of keys in wallet');
  }
  const [userKeyId] = wallet.keyIds();
  const authKeysIds = wallet.coinSpecific()?.keys;
  if (authKeysIds?.length !== 2) {
    throw new Error('Invalid number of keys in wallet coinSpecific');
  }
  const allKeyIds = [
    options.fetchUserKey ? userKeyId : [],
    options.fetchAuthKeys ? authKeysIds : [],
  ].flat() as string[];
  const keychains = await Promise.all(allKeyIds.map((id) => coin.keychains().get({ id })));

  let userKey: LightningKeychain | undefined;

  if (options.fetchUserKey) {
    const userKeychain = keychains.find((keychain) => keychain.id === userKeyId);
    userKey = decodeOrElse(LightningKeychainCodec.name, LightningKeychainCodec, userKeychain, (_) => {
      // DON'T throw errors from decodeOrElse. It could leak sensitive information.
      throw new Error(`Invalid user key`);
    });
  }

  let userAuthKey: LightningAuthKeychain | undefined;
  let nodeAuthKey: LightningAuthKeychain | undefined;

  if (options.fetchAuthKeys) {
    const authKeys = authKeysIds.map((keyId) => {
      const authKeychain = keychains.find((keychain) => keychain.id === keyId);
      return decodeOrElse(LightningAuthKeychainCodec.name, LightningAuthKeychainCodec, authKeychain, (_) => {
        // DON'T throw errors from decodeOrElse. It could leak sensitive information.
        throw new Error(`Invalid auth key`);
      });
    });
    [userAuthKey, nodeAuthKey] = (['userAuth', 'nodeAuth'] as const).map((purpose) => {
      const key = authKeys.find(
        (k) => unwrapLightningCoinSpecific(k.coinSpecific, coin.getChain()).purpose === purpose
      );
      if (!key) {
        throw new Error(`Missing ${purpose} key`);
      }
      return key;
    });
  }

  return { userKey, userAuthKey, nodeAuthKey };
}

async function createSignerMacaroon(
  config: { url: string; httpsAgent: https.Agent },
  header: { adminMacaroonHex: string },
  watchOnlyIP: string
) {
  const { macaroon } = await bakeMacaroon(config, header, { permissions: signerMacaroonPermissions });
  const macaroonBase64 = addIPCaveatToMacaroon(Buffer.from(macaroon, 'hex').toString('base64'), watchOnlyIP);
  return Buffer.from(macaroonBase64, 'base64').toString('hex');
}

function getUserRootKey(
  passphrase: string,
  userMainnetEncryptedPrv: string,
  network: utxolib.Network,
  decrypt: Decrypt
) {
  const userMainnetPrv = decrypt({ password: passphrase, input: userMainnetEncryptedPrv });
  return utxolib.bitgo.keyutil.changeExtendedKeyNetwork(userMainnetPrv, utxolib.networks.bitcoin, network);
}

function getMacaroonRootKey(passphrase: string, nodeAuthEncryptedPrv: string, decrypt: Decrypt) {
  const hdNode = utxolib.bip32.fromBase58(decrypt({ password: passphrase, input: nodeAuthEncryptedPrv }));
  if (!hdNode.privateKey) {
    throw new Error('nodeAuthEncryptedPrv is not a private key');
  }
  return hdNode.privateKey.toString('base64');
}

export async function handleInitLightningWallet(req: express.Request): Promise<unknown> {
  const { walletId, passphrase, signerTlsKey, signerTlsCert, signerIP } = decodeOrElse(
    InitLightningWalletRequestCodec.name,
    InitLightningWalletRequestCodec,
    req.body,
    (_) => {
      // DON'T throw errors from decodeOrElse. It could leak sensitive information.
      throw new Error('Invalid request body for initLightningWallet.');
    }
  );

  const { url, tlsCert } = getLightningSignerConfig(walletId, req.config);

  const bitgo = req.bitgo;
  const coin = bitgo.coin(req.params.coin);
  if (coin.getFamily() !== 'lnbtc') {
    throw new Error('Invalid coin for initLightningWallet');
  }

  const httpsAgent = createHttpAgent(tlsCert);

  const { state } = await getWalletState({ url, httpsAgent });
  if (state !== 'NON_EXISTING') {
    throw new Error(`Signer must be in NON_EXISTING state to initialize wallet, but it is in state: ${state}`);
  }

  const wallet = await coin.wallets().get({ id: walletId });

  // TODO: check if wallet is ready for initialization

  const { userKey, userAuthKey, nodeAuthKey } = await getLightningWalletKeychains(coin, wallet);
  if (!userKey || !userAuthKey || !nodeAuthKey) {
    throw new Error('Missing keychains');
  }

  const network = getUtxolibNetwork(coin.getChain());
  const extendedMasterPrvKey = getUserRootKey(passphrase, userKey.encryptedPrv, network, bitgo.decrypt);
  const macaroonRootKey = getMacaroonRootKey(passphrase, nodeAuthKey.encryptedPrv, bitgo.decrypt);

  const { admin_macaroon: adminMacaroon } = await initWallet(
    { url, httpsAgent },
    {
      wallet_password: passphrase,
      extended_master_key: extendedMasterPrvKey,
      macaroon_root_key: macaroonRootKey,
    }
  );

  const encryptedAdminMacaroon = bitgo.encrypt({ password: passphrase, input: adminMacaroon });
  const encryptedSignerTlsKey = bitgo.encrypt({ password: passphrase, input: signerTlsKey });
  const watchOnly = createWatchOnly(extendedMasterPrvKey, network);

  const coinSpecific = {
    [coin.getChain()]: {
      encryptedAdminMacaroon,
      signerIP,
      signerTlsCert,
      encryptedSignerTlsKey,
      watchOnly,
    },
  };

  const signature = createMessageSignature(
    coinSpecific,
    bitgo.decrypt({ password: passphrase, input: userAuthKey.encryptedPrv })
  );

  async function updateWallet(): Promise<unknown> {
    return await bitgo.put(wallet.url()).send({ coinSpecific, signature }).result();
  }
  return await updateWallet();
}

export async function handleCreateSignerMacaroon(req: express.Request): Promise<unknown> {
  const { walletId, passphrase, watchOnlyIP } = decodeOrElse(
    CreateSignerMacaroonRequestCodec.name,
    CreateSignerMacaroonRequestCodec,
    req.body,
    (_) => {
      // DON'T throw errors from decodeOrElse. It could leak sensitive information.
      throw new Error('Invalid request body for CreateSignerMacaroon.');
    }
  );

  const { url, tlsCert } = getLightningSignerConfig(walletId, req.config);

  const bitgo = req.bitgo;
  const coin = bitgo.coin(req.params.coin);
  if (coin.getFamily() !== 'lnbtc') {
    throw new Error('Invalid coin for CreateSignerMacaroon');
  }

  const httpsAgent = createHttpAgent(tlsCert);

  const { state } = await getWalletState({ url, httpsAgent });
  if (state !== 'SERVER_ACTIVE') {
    throw new Error(`Signer must be in SERVER_ACTIVE state to create a macaroon, but it is in state: ${state}`);
  }

  const wallet = await coin.wallets().get({ id: walletId });

  const encryptedAdminMacaroon = wallet.coinSpecific()?.encryptedAdminMacaroon;
  if (!encryptedAdminMacaroon) {
    throw new Error('Missing encryptedAdminMacaroon in wallet');
  }
  const adminMacaroon = bitgo.decrypt({ password: passphrase, input: encryptedAdminMacaroon });

  const { userAuthKey } = await getLightningWalletKeychains(coin, wallet, { fetchUserKey: false, fetchAuthKeys: true });
  if (!userAuthKey) {
    throw new Error('Missing userAuthKey');
  }

  const signerMacaroon = await createSignerMacaroon(
    { url, httpsAgent },
    { adminMacaroonHex: Buffer.from(adminMacaroon, 'base64').toString('hex') },
    watchOnlyIP
  );

  const coinSpecific = {
    [coin.getChain()]: {
      signerMacaroon,
    },
  };

  const signature = createMessageSignature(
    coinSpecific,
    bitgo.decrypt({ password: passphrase, input: userAuthKey.encryptedPrv })
  );

  async function updateWallet(): Promise<unknown> {
    return await bitgo.put(wallet.url()).send({ coinSpecific, signature }).result();
  }
  return await updateWallet();
}

export async function handleGetLightningWalletState(req: express.Request): Promise<GetWalletStateResponse> {
  const coin = req.bitgo.coin(req.params.coin);
  if (coin.getFamily() !== 'lnbtc') {
    throw new Error('Invalid coin for lightning wallet state');
  }

  const { url, tlsCert } = getLightningSignerConfig(req.params.id, req.config);
  const httpsAgent = createHttpAgent(tlsCert);
  return await getWalletState({ url, httpsAgent });
}
