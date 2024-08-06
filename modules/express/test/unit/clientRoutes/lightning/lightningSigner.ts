import { TestBitGo, TestBitGoAPI } from '@bitgo/sdk-test';
import { BitGo } from 'bitgo';
import { common } from '@bitgo/sdk-core';
import * as nock from 'nock';
import * as express from 'express';

import { lightningSignerConfigs, apiData } from './fixture';
import {
  handleCreateSignerMacaroon,
  handleGetLightningWalletState,
  handleInitLightningWallet,
} from '../../../../src/lightning/lightningRoutes';

describe('Lightning signer', () => {
  let bitgo: TestBitGoAPI;
  let bgUrl;

  before(async function () {
    if (!nock.isActive()) {
      nock.activate();
    }

    bitgo = TestBitGo.decorate(BitGo, { env: 'test' });
    bitgo.initializeTestVars();

    bgUrl = common.Environments[bitgo.getEnv()].uri;

    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  after(() => {
    if (nock.isActive()) {
      nock.restore();
    }
  });

  it('should initialize lightning signer wallet', async () => {
    const wpWalletnock = nock(bgUrl).get(`/api/v2/tlnbtc/wallet/${apiData.wallet.id}`).reply(200, apiData.wallet);

    const wpKeychainNocks = [
      nock(bgUrl).get(`/api/v2/tlnbtc/key/${apiData.userKey.id}`).reply(200, apiData.userKey),
      nock(bgUrl).get(`/api/v2/tlnbtc/key/${apiData.userAuthKey.id}`).reply(200, apiData.userAuthKey),
      nock(bgUrl).get(`/api/v2/tlnbtc/key/${apiData.nodeAuthKey.id}`).reply(200, apiData.nodeAuthKey),
    ];

    const wpWalletUpdateNock = nock(bgUrl).put(`/api/v2/tlnbtc/wallet/${apiData.wallet.id}`).reply(200);

    const req = {
      bitgo: bitgo,
      body: apiData.initWalletRequestBody,
      params: {
        coin: 'tlnbtc',
      },
      config: {
        lightningSignerConfigs,
      },
    } as unknown as express.Request;

    await handleInitLightningWallet(req);

    wpWalletUpdateNock.done();
    wpKeychainNocks.forEach((s) => s.done());
    wpWalletnock.done();
  });

  it('should get signer wallet state', async () => {
    const req = {
      bitgo: bitgo,
      body: apiData.signerMacaroonRequestBody,
      params: {
        coin: 'tlnbtc',
        id: apiData.wallet.id,
      },
      config: {
        lightningSignerConfigs,
      },
    } as unknown as express.Request;

    await handleGetLightningWalletState(req);
  });

  it('should create signer macaroon', async () => {
    const wpWalletnock = nock(bgUrl).get(`/api/v2/tlnbtc/wallet/${apiData.wallet.id}`).reply(200, apiData.wallet);

    const wpKeychainNocks = [
      nock(bgUrl).get(`/api/v2/tlnbtc/key/${apiData.userAuthKey.id}`).reply(200, apiData.userAuthKey),
      nock(bgUrl).get(`/api/v2/tlnbtc/key/${apiData.nodeAuthKey.id}`).reply(200, apiData.nodeAuthKey),
    ];

    const wpWalletUpdateNock = nock(bgUrl).put(`/api/v2/tlnbtc/wallet/${apiData.wallet.id}`).reply(200);

    const req = {
      bitgo: bitgo,
      body: apiData.signerMacaroonRequestBody,
      params: {
        coin: 'tlnbtc',
      },
      config: {
        lightningSignerConfigs,
      },
    } as unknown as express.Request;

    await handleCreateSignerMacaroon(req);

    wpWalletUpdateNock.done();
    wpKeychainNocks.forEach((s) => s.done());
    wpWalletnock.done();
  });
});
