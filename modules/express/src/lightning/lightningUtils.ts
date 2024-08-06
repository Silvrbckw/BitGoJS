import { promises as fs } from 'fs';
import { decodeOrElse } from '@bitgo/sdk-core';
import { NonEmptyString } from 'io-ts-types';
import { LightningSignerConfigs, LightningSignerConfigsCodec, LightningSignerConfig } from './codecs';
import { _forceSecureUrl } from '../config';

export async function getLightningSignerConfigs(path: string): Promise<LightningSignerConfigs> {
  const configFile = await fs.readFile(path, { encoding: 'utf8' });
  const configs: unknown = JSON.parse(configFile);
  const decoded = decodeOrElse(LightningSignerConfigsCodec.name, LightningSignerConfigsCodec, configs, (errors) => {
    throw new Error(`Invalid lightning signer config file: ${errors}`);
  });
  const secureUrls: LightningSignerConfigs = {};
  for (const [walletId, { url, tlsCert }] of Object.entries(decoded)) {
    const secureUrl = _forceSecureUrl(url);
    if (!NonEmptyString.is(secureUrl)) {
      throw new Error(`Invalid secure URL: ${secureUrl}`);
    }
    secureUrls[walletId] = { url: secureUrl, tlsCert };
  }
  return secureUrls;
}

export function getLightningSignerConfig(
  walletId: string,
  config: { lightningSignerConfigs?: LightningSignerConfigs }
): LightningSignerConfig {
  if (!config.lightningSignerConfigs) {
    throw new Error('Missing required configuration: lightningSignerConfigs');
  }

  const lightningSignerConfig = config.lightningSignerConfigs[walletId];
  if (!lightningSignerConfig) {
    throw new Error(`Missing required configuration for walletId: ${walletId}`);
  }
  return lightningSignerConfig;
}
