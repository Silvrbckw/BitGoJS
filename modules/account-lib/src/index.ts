import { coins, BaseCoin as CoinConfig } from '@bitgo/statics';
import { BuildTransactionError } from './coin/baseCoin/errors';

import * as crypto from './utils/crypto';
// coins
import * as BaseCoin from './coin/baseCoin';
import * as Trx from './coin/trx';
import * as Xtz from './coin/xtz';
import * as Eth from './coin/eth';
import * as Etc from './coin/etc';
import * as Rbtc from './coin/rbtc';
import * as Celo from './coin/celo';

export { crypto };
export { BaseCoin };

export { Trx };

export { Xtz };

export { Eth };

export { Etc };

export { Rbtc };

export { Celo };

import * as Hbar from './coin/hbar';
export { Hbar };

const coinBuilderMap = {
  trx: Trx.TransactionBuilder,
  ttrx: Trx.TransactionBuilder,
  xtz: Xtz.TransactionBuilder,
  txtz: Xtz.TransactionBuilder,
  etc: Etc.TransactionBuilder,
  tetc: Etc.TransactionBuilder,
  eth: Eth.TransactionBuilder,
  teth: Eth.TransactionBuilder,
  rbtc: Rbtc.TransactionBuilder,
  trbtc: Rbtc.TransactionBuilder,
  celo: Celo.TransactionBuilder,
  tcelo: Celo.TransactionBuilder,
};

/**
 * Get the list of coin tickers supported by this library.
 */
export const supportedCoins = Object.keys(coinBuilderMap);

/**
 * Get a transaction builder for the given coin.
 *
 * @param coinName One of the {@code supportedCoins}
 * @returns An instance of a {@code TransactionBuilder}
 */
export function getBuilder(coinName: string): BaseCoin.Interface.BaseBuilder {
  const builderClass = coinBuilderMap[coinName];
  if (!builderClass) {
    throw new BuildTransactionError(`Coin ${coinName} not supported`);
  }

  return new builderClass(coins.get(coinName));
}

/**
 * Register a new coin instance with its builder factory
 *
 * @param {string} coinName coin name as it was registered in @bitgo/statics
 * @param {any} builderFactory the builder factory class for that coin
 * @returns {any} the factory instance for the registered coin
 */
export function register(
  coinName: string,
  builderFactory: { new (_coinConfig: Readonly<CoinConfig>): BaseCoin.BaseTransactionBuilderFactory },
) {
  const coinConfig = coins.get(coinName);
  const factory = new builderFactory(coinConfig);
  // coinBuilderMap[coinName] = factory;
  coinBuilderMap[coinName] = builderFactory; // For now register the constructor function until reimplement getBuilder method
  return factory;
}
