import { EcdsaTypes } from '@bitgo/sdk-lib-mpc';

/**
 * @deprecated use DeserializedNtildeProof from sdk-lib-mpc instead
 */
export type DeserializedNtildeProof = EcdsaTypes.DeserializedNtildeProof;
/**
 * @deprecated use DeserializedNtildeProofs from sdk-lib-mpc instead
 */
export type DeserializedNtildeProofs = EcdsaTypes.DeserializedNtildeProofs;
/**
 * @deprecated use DeserializedNtildeProofs from sdk-lib-mpc instead
 */
export type DeserializedNtilde = EcdsaTypes.DeserializedNtilde;
/**
 * @deprecated use DeserializedNtildeWithProofs from sdk-lib-mpc instead
 */
export type DeserializedNtildeWithProofs = EcdsaTypes.DeserializedNtildeWithProofs;
/**
 * @deprecated use SerializedNtildeProof from sdk-lib-mpc instead
 */
export type SerializedNtildeProof = EcdsaTypes.SerializedNtildeProof;
/**
 * @deprecated use SerializedNtildeProofs from sdk-lib-mpc instead
 */
export type SerializedNtildeProofs = EcdsaTypes.SerializedNtildeProofs;
/**
 * @deprecated use SerializedNtilde from sdk-lib-mpc instead
 */
export type SerializedNtilde = EcdsaTypes.SerializedNtilde;
/**
 * @deprecated use SerializedNtildeWithProofs from sdk-lib-mpc instead
 */
export type SerializedNtildeWithProofs = EcdsaTypes.SerializedNtildeWithProofs;

// Private share of the user generated during key generation
export interface PShare {
  i: number; // participant index
  t?: number; // threshold
  c?: number; // number of shares
  l: string; // lambda value for paillier secret key
  m: string; // mu value for paillier secret key
  u: string; // shamir share of secret
  uu: string; // unsplit shamir share of secret
  n: string; // n => (p . q) where p and q are the two random prime numbers chosen for paillier encryption
  y: string;
  chaincode: string;
}

// NShares which is shared to the other participants during key generation
export interface NShare {
  i: number; // participant index
  j: number; // target participant index
  n: string;
  u: string; // shamir share of secret at j'th index
  y: string;
  v?: string;
  chaincode: string;
}

export type KeyShare = {
  pShare: PShare;
  nShares: Record<number, NShare>;
};

// Private XShare of the current participant
export interface XShare {
  i: number;
  l: string;
  m: string;
  n: string;
  y: string; // combined public key
  x: string; // combined secret
  chaincode: string;
}

export type XShareWithNtilde = XShare & SerializedNtilde;

// YShares used during signature generation
export interface YShare {
  i: number;
  j: number;
  n: string;
}

export type YShareWithNtilde = YShare & SerializedNtilde;

export interface KeyCombined {
  xShare: XShare;
  yShares: Record<number, YShare>;
}

export interface KeyCombinedWithNtilde {
  xShare: XShareWithNtilde;
  yShares: Record<number, YShareWithNtilde>;
}

export interface SubkeyShare {
  xShare: XShare;
  nShares: Record<number, NShare>;
}

export interface WShare {
  i: number;
  l: string;
  m: string;
  n: string;
  y: string; // combined public key
  ntilde: string;
  h1: string;
  h2: string;
  ck: string;
  k: string;
  w: string;
  gamma: string;
}

export interface RangeProofShare {
  z: string;
  u: string;
  w: string;
  s: string;
  s1: string;
  s2: string;
}

export interface KShare {
  i: number;
  j: number;
  n: string;
  ntilde: string;
  h1: string;
  h2: string;
  k: string;
  proof: RangeProofShare;
}
export interface SignShareRT {
  wShare: WShare;
  kShare: KShare;
}

export interface RangeProofWithCheckShare {
  z: string;
  zprm: string;
  t: string;
  v: string;
  w: string;
  s: string;
  s1: string;
  s2: string;
  t1: string;
  t2: string;
  u: string;
  x: string;
}

// Alpha Share
export interface AShare {
  i: number;
  j: number;
  n: string;
  ntilde: string;
  h1: string;
  h2: string;
  k: string;
  alpha: string;
  mu: string;
  proof: RangeProofShare;
  gammaProof: RangeProofWithCheckShare;
  wProof: RangeProofWithCheckShare;
}

// Beta Share
export interface BShare extends WShare {
  gamma: string;
  beta: string;
  nu: string;
}

// Mu Share
export interface MUShare {
  i: number;
  j: number;
  alpha: string;
  mu: string;
  gammaProof: RangeProofWithCheckShare;
  wProof: RangeProofWithCheckShare;
}

// Gamma Share
export interface GShare {
  i: number;
  l?: string;
  m?: string;
  n: string;
  y: string; // combined public key
  k: string;
  w: string;
  gamma: string;
  alpha: string;
  mu: string;
  beta: string;
  nu: string;
}
export interface SignConvert {
  xShare?: XShare; // XShare of the current participant
  yShare?: YShare; // YShare corresponding to the other participant
  kShare?: KShare; // KShare received from the other participant
  bShare?: BShare; // Private Beta share of the participant
  muShare?: MUShare; // muShare received from the other participant
  aShare?: AShare;
  wShare?: WShare;
}

export interface SignConvertRT {
  aShare?: AShare;
  bShare?: BShare;
  muShare?: MUShare;
  gShare?: GShare;
}

export interface OShare {
  i: number;
  y: string;
  k: string;
  omicron: string;
  delta: string;
  Gamma: string;
}

export interface DShare {
  i: number;
  j: number;
  delta: string;
  Gamma: string;
}

export interface SShare {
  i: number;
  R: string;
  s: string;
  y: string;
}

export interface SignCombine {
  gShare: GShare;
  signIndex: {
    i: number;
    j: number;
  };
}

export interface SignCombineRT {
  oShare: OShare;
  dShare: DShare;
}

export interface Signature {
  y: string;
  recid: number;
  r: string;
  s: string;
}
