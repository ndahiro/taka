/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Pure JavaScript fallback for SHA-256 in case Web Crypto is restricted
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClearance = 0;
  for (let idx = 0; idx < ascii.length; idx++) {
    const code = ascii.charCodeAt(idx);
    words[idx >> 2] |= (code & 0xff) << (24 - (idx % 4) * 8);
  }

  words[ascii.length >> 2] |= 0x80 << (24 - (ascii.length % 4) * 8);
  words[(((ascii.length + 8) >> 6) << 4) + 15] = asciiBitLength;

  for (let chunkIdx = 0; chunkIdx < words.length; chunkIdx += 16) {
    const w: number[] = [];
    for (i = 0; i < 64; i++) {
      if (i < 16) {
        w[i] = words[chunkIdx + i] || 0;
      } else {
        const gamma0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const gamma1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + gamma0 + w[i - 7] + gamma1) | 0;
      }
    }

    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (i = 0; i < 64; i++) {
      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const t1 = h + sigma1 + ch + k[i] + w[i];
      const t2 = sigma0 + maj;

      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export function sha256(data: string): string {
  try {
    return sha256Sync(data);
  } catch (err) {
    return sha256Sync(data);
  }
}

/**
 * Calculates a binary Merkle Root for an array of transaction hashes.
 * If odd number of leaves, the last leaf is duplicated per Bitcoin/Fabric standard.
 */
export function calculateMerkleRoot(leaves: string[]): {
  root: string;
  levels: string[][];
} {
  if (leaves.length === 0) {
    return { root: sha256('EMPTY_MERKLE_ROOT'), levels: [[]] };
  }

  let currentLevel = leaves.map(l => (l.length === 64 ? l : sha256(l)));
  const levels: string[][] = [currentLevel];

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // duplicate if odd
      const combined = sha256(left + right);
      nextLevel.push(combined);
    }
    levels.push(nextLevel);
    currentLevel = nextLevel;
  }

  return {
    root: currentLevel[0],
    levels
  };
}

export interface MerkleProofStep {
  siblingHash: string;
  isRightSibling: boolean;
}

/**
 * Generates an inclusion proof for a leaf at given index
 */
export function generateMerkleProof(
  leaves: string[],
  leafIndex: number
): {
  leafHash: string;
  root: string;
  proof: MerkleProofStep[];
} {
  const { root, levels } = calculateMerkleRoot(leaves);
  const proof: MerkleProofStep[] = [];
  let idx = leafIndex;

  for (let levelIdx = 0; levelIdx < levels.length - 1; levelIdx++) {
    const currentLevel = levels[levelIdx];
    const isRight = idx % 2 === 1;
    const siblingIdx = isRight ? idx - 1 : idx + 1;

    let siblingHash: string;
    if (siblingIdx < currentLevel.length) {
      siblingHash = currentLevel[siblingIdx];
    } else {
      siblingHash = currentLevel[idx]; // duplicate if odd
    }

    proof.push({
      siblingHash,
      isRightSibling: !isRight
    });

    idx = Math.floor(idx / 2);
  }

  return {
    leafHash: levels[0][leafIndex] || sha256('EMPTY'),
    root,
    proof
  };
}

/**
 * Verifies a Merkle proof against a root
 */
export function verifyMerkleProof(
  leafHash: string,
  proof: MerkleProofStep[],
  expectedRoot: string
): boolean {
  let currentHash = leafHash;

  for (const step of proof) {
    if (step.isRightSibling) {
      currentHash = sha256(currentHash + step.siblingHash);
    } else {
      currentHash = sha256(step.siblingHash + currentHash);
    }
  }

  return currentHash === expectedRoot;
}

/**
 * Computes block hash per Hyperledger Fabric Header structure
 * H_block = SHA256(BlockNumber || PrevHash || MerkleDataHash)
 */
export function computeFabricBlockHash(
  blockNumber: number,
  prevHash: string,
  dataHash: string
): string {
  const payload = `${blockNumber}:${prevHash}:${dataHash}`;
  return sha256(payload);
}

/**
 * Computes WORM audit log hash with previous hash chaining
 */
export function computeWormLogHash(
  index: number,
  timestamp: string,
  actorId: string,
  action: string,
  resource: string,
  details: string,
  previousHash: string
): string {
  const serialized = `${index}|${timestamp}|${actorId}|${action}|${resource}|${details}|${previousHash}`;
  return sha256(serialized);
}

/**
 * Verifies complete cryptographic integrity of the WORM audit log chain
 */
export function verifyWormChain(logs: Array<{
  index: number;
  timestamp: string;
  actorId: string;
  action: string;
  resource: string;
  details: string;
  hash: string;
  previousHash: string;
}>): {
  isValid: boolean;
  brokenIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  verifiedCount: number;
} {
  if (logs.length === 0) return { isValid: true, verifiedCount: 0 };

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    
    // Check previous hash pointer
    if (i > 0 && log.previousHash !== logs[i - 1].hash) {
      return {
        isValid: false,
        brokenIndex: i,
        expectedHash: logs[i - 1].hash,
        actualHash: log.previousHash,
        verifiedCount: i
      };
    }

    // Check self hash computation
    const computed = computeWormLogHash(
      log.index,
      log.timestamp,
      log.actorId,
      log.action,
      log.resource,
      log.details,
      log.previousHash
    );

    if (computed !== log.hash) {
      return {
        isValid: false,
        brokenIndex: i,
        expectedHash: computed,
        actualHash: log.hash,
        verifiedCount: i
      };
    }
  }

  return { isValid: true, verifiedCount: logs.length };
}

/**
 * Envelope encryption simulation (AES-256-GCM + KMS Key Wrapping)
 */
export function simulateEnvelopeEncryption(plaintext: string, kmsKeyId: string) {
  const dataEncryptionKey = sha256(`DEK_${Date.now()}_${kmsKeyId}`).substring(0, 32);
  const iv = sha256(`IV_${Math.random()}`).substring(0, 16);
  const cipherHex = sha256(plaintext + dataEncryptionKey + iv);
  const authTag = sha256(cipherHex + dataEncryptionKey).substring(0, 16);

  return {
    algorithm: 'AES-256-GCM' as const,
    iv,
    ciphertext: `enc:v1:${cipherHex}:${authTag}`,
    wrappedDek: `kms:wrap:${kmsKeyId}:${sha256(dataEncryptionKey)}`,
    kmsKeyId,
    timestamp: new Date().toISOString()
  };
}
