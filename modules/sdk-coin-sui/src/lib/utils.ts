import {
  BaseUtils,
  BuildTransactionError,
  ParseTransactionError,
  isValidEd25519PublicKey,
  TransactionType,
  Recipient,
  InvalidTransactionError,
} from '@bitgo/sdk-core';
import BigNumber from 'bignumber.js';
import { SUI_ADDRESS_LENGTH } from './constants';
import { isPureArg, CallArg } from './mystenlab/types/sui-bcs';
import { BCS, fromB64 } from '@mysten/bcs';
import { MethodNames, SuiTransactionType } from './iface';
import { Buffer } from 'buffer';
import {
  isValidSuiAddress,
  normalizeSuiAddress,
  normalizeSuiObjectId,
  SuiCallArg,
  SuiJsonValue,
  SuiObjectRef,
} from './mystenlab/types';
import { builder, TransactionBlockInput, TransactionType as TransactionCommandType } from './mystenlab/builder';
import { SIGNATURE_SCHEME_TO_FLAG } from './keyPair';
import blake2b from '@bitgo/blake2b';

export class Utils implements BaseUtils {
  /** @inheritdoc */
  isValidBlockId(hash: string): boolean {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  isValidPrivateKey(key: string): boolean {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  isValidPublicKey(key: string): boolean {
    return isValidEd25519PublicKey(key);
  }

  /** @inheritdoc */
  isValidSignature(signature: string): boolean {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  isValidTransactionId(txId: string): boolean {
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if raw transaction can be deserialized
   *
   * @param {string} rawTransaction - transaction in base64 string format
   * @returns {boolean} - the validation result
   */
  isValidRawTransaction(rawTransaction: string): boolean {
    try {
      const data = fromB64(rawTransaction);
      const deserialized = builder.de('TransactionData', data);
      builder.ser('TransactionData', deserialized);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check the raw transaction has a valid format in the blockchain context, throw otherwise.
   *
   * @param {string} rawTransaction - Transaction in base64 string  format
   */
  validateRawTransaction(rawTransaction: string): void {
    if (!rawTransaction) {
      throw new ParseTransactionError('Invalid raw transaction: Undefined');
    }
    if (!this.isValidRawTransaction(rawTransaction)) {
      throw new ParseTransactionError('Invalid raw transaction');
    }
  }

  /**
   * Validates addresses to check if all exist and are valid Sui public keys
   *
   * @param {string} addresses The address to be validated
   * @param {string} fieldName Name of the field to validate, its needed to return which field is failing on case of error.
   */
  validateAddresses(addresses: string[], fieldName: string): void {
    for (const address of addresses) {
      this.validateAddress(address, fieldName);
    }
  }

  /**
   * Validates address to check if it exists and is a valid Sui public key
   *
   * @param {string} address The address to be validated
   * @param {string} fieldName Name of the field to validate, its needed to return which field is failing on case of error.
   */
  validateAddress(address: string, fieldName: string): void {
    if (!address || !isValidSuiAddress(normalizeSuiAddress(address))) {
      throw new BuildTransactionError(`Invalid or missing ${fieldName}, got: ${address}`);
    }
  }

  /** @inheritdoc */
  isValidAddress(address: string): boolean {
    return this.isHex(address) && this.getHexByteLength(address) === SUI_ADDRESS_LENGTH;
  }

  isHex(value: string): boolean {
    return /^(0x|0X)?[a-fA-F0-9]+$/.test(value) && value.length % 2 === 0;
  }

  getHexByteLength(value: string): number {
    // return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2;
    return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2;
  }

  /**
   * Returns whether or not the string is a valid amount
   *
   * @param {number[]} amounts - the amounts to validate
   * @returns {boolean} - the validation result
   */
  isValidAmounts(amounts: number[]): boolean {
    for (const amount of amounts) {
      if (!this.isValidAmount(amount)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns whether or not the string is a valid amount
   *
   * @param {number} amounts - the amount to validate
   * @returns {boolean} - the validation result
   */
  isValidAmount(amount: string | number): boolean {
    const bigNumberAmount = new BigNumber(Number(amount));
    if (!bigNumberAmount.isInteger() || bigNumberAmount.isLessThanOrEqualTo(0)) {
      return false;
    }
    return true;
  }

  /**
   * Normalizes hex ids (addresses, object ids) to always contain the '0x' prefix.
   *
   * @param {string} id
   * @return {string}
   **/
  normalizeHexId(id: string): string {
    return id.startsWith('0x') ? id : '0x'.concat(id);
  }

  /**
   * Get transaction type by function name
   *
   * @param {MethodNames} fctName
   * @return {TransactionType}
   */
  getTransactionType(suiTransactionType: SuiTransactionType): TransactionType {
    switch (suiTransactionType) {
      case SuiTransactionType.Transfer:
        return TransactionType.Send;
      case SuiTransactionType.AddStake:
        return TransactionType.StakingAdd;
      case SuiTransactionType.WithdrawStake:
        return TransactionType.StakingWithdraw;
    }
  }

  /**
   * Get SUI transaction type
   *
   * @param {MethodNames} fctName
   * @return {TransactionType}
   */
  getSuiTransactionType(command: TransactionCommandType): SuiTransactionType {
    switch (command.kind) {
      case 'TransferObjects':
        return SuiTransactionType.Transfer;
      case 'MoveCall':
        if (command.target.endsWith(MethodNames.RequestAddStake)) {
          return SuiTransactionType.AddStake;
        } else if (command.target.endsWith(MethodNames.RequestWithdrawStake)) {
          return SuiTransactionType.WithdrawStake;
        } else {
          throw new InvalidTransactionError(`unsupported target method`);
        }
      default:
        throw new InvalidTransactionError(`unsupported transaction kind`);
    }
  }

  getRecipients(inputs: CallArg[] | SuiCallArg[] | TransactionBlockInput[]): Recipient[] {
    const amounts: number[] = [];
    const addresses: string[] = [];
    inputs.forEach((input, index) => {
      if (index % 2 === 0) {
        amounts.push(this.getAmount(input));
      } else {
        addresses.push(this.getAddress(input));
      }
    });
    return addresses.map((address, index) => {
      return {
        address: address,
        amount: Number(amounts[index]).toString(),
      } as Recipient;
    });
  }

  getAmount(input: SuiJsonValue | TransactionBlockInput): number {
    return isPureArg(input)
      ? builder.de(BCS.U64, Buffer.from(input.Pure as unknown as string).toString('base64'), 'base64')
      : (input as TransactionBlockInput).value;
  }

  getAddress(input: TransactionBlockInput): string {
    if (input.hasOwnProperty('value')) {
      return isPureArg(input.value)
        ? normalizeSuiAddress(
            builder.de(BCS.ADDRESS, Buffer.from(input?.value.Pure as unknown as string).toString('base64'), 'base64')
          )
        : (input as TransactionBlockInput).value;
    } else {
      return isPureArg(input)
        ? normalizeSuiAddress(
            builder.de(BCS.ADDRESS, Buffer.from(input.Pure as unknown as string).toString('base64'), 'base64')
          )
        : (input as TransactionBlockInput).value;
    }
  }

  normalizeCoins(coins: any[]): SuiObjectRef[] {
    return coins.map((coin) => {
      return utils.normalizeSuiObjectRef(coin);
    });
  }

  normalizeSuiObjectRef(obj: SuiObjectRef): SuiObjectRef {
    return {
      objectId: normalizeSuiObjectId(obj.objectId),
      version: Number(obj.version),
      digest: obj.digest,
    };
  }

  transactionInput(type: 'object' | 'pure', index = 0, value?: unknown): TransactionBlockInput {
    return {
      kind: 'Input',
      value: typeof value === 'bigint' ? String(value) : value,
      index,
      type,
    };
  }

  getAddressFromPublicKey(publicKey: string): string {
    const PUBLIC_KEY_SIZE = 32;
    const tmp = new Uint8Array(PUBLIC_KEY_SIZE + 1);
    const pubBuf = Buffer.from(publicKey, 'hex');
    tmp.set([SIGNATURE_SCHEME_TO_FLAG['ED25519']]); // ED25519: 0x00,
    tmp.set(pubBuf, 1);
    return normalizeSuiAddress(
      blake2b(PUBLIC_KEY_SIZE)
        .update(tmp)
        .digest('hex')
        .slice(0, SUI_ADDRESS_LENGTH * 2)
    );
  }
}

const utils = new Utils();
export default utils;

export enum AppId {
  Sui = 0,
}

export enum IntentVersion {
  V0 = 0,
}

export enum IntentScope {
  TransactionData = 0,
  TransactionEffects = 1,
  CheckpointSummary = 2,
  PersonalMessage = 3,
}

export type Intent = [IntentScope, IntentVersion, AppId];
