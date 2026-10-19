/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FabricBlock,
  FabricTransaction,
  LandTitle,
  OffChainPiiRecord,
  WORMAuditLog,
  GDPRConsentRecord,
  RoleType,
  MspId,
  ChannelId,
  EndorsementSignature
} from '../types/fabric';
import {
  calculateMerkleRoot,
  computeFabricBlockHash,
  computeWormLogHash,
  sha256
} from './cryptoEngine';
import {
  INITIAL_LAND_TITLES,
  INITIAL_OFFCHAIN_PII,
  INITIAL_GDPR_CONSENTS,
  USER_PERSONAS
} from './mockData';

const STORAGE_KEYS = {
  BLOCKS: 'taka_fabric_blocks_v1',
  TITLES: 'taka_land_titles_v1',
  PII_VAULT: 'taka_pii_vault_v1',
  WORM_LOGS: 'taka_worm_audit_logs_v1',
  GDPR_CONSENTS: 'taka_gdpr_consents_v1',
  ACTIVE_USER_ID: 'taka_active_user_id_v1'
};

function generateInitialBlocks(): FabricBlock[] {
  // Block 0: Genesis Block
  const tx0: FabricTransaction = {
    txId: 'tx_genesis_orderer_bootstrap_00',
    channelId: 'property-transfer-channel',
    chaincode: 'taka_system_genesis_v1',
    functionName: 'InitializeChannelPolicies',
    args: {
      msps: ['Org1MSP', 'Org2MSP', 'Org3MSP', 'Org4MSP'],
      consensus: 'etcdraft',
      batchTimeout: '1.0s',
      maxMessageCount: 10
    },
    senderMsp: 'Org1MSP',
    senderName: 'Land Registry Root CA',
    timestamp: '2021-01-01T00:00:00Z',
    status: 'COMMITTED',
    endorsements: [
      {
        mspId: 'Org1MSP',
        endorserName: 'Chief Registrar CA',
        certificateThumbprint: 'SHA256:7B8F991209AB01',
        signature: 'SIG_ED25519_REG_GENESIS_ROOT',
        timestamp: '2021-01-01T00:00:00Z',
        status: 'VALID'
      }
    ],
    readSet: [],
    writeSet: {
      'channel/policies/Admins': 'Org1MSP.admin',
      'channel/policies/Writers': 'OR(Org1MSP.member, Org2MSP.member)'
    }
  };

  const leaves0 = [tx0.txId];
  const { root: root0 } = calculateMerkleRoot(leaves0);
  const hash0 = computeFabricBlockHash(0, '0000000000000000000000000000000000000000000000000000000000000000', root0);

  const block0: FabricBlock = {
    blockNumber: 0,
    channelId: 'property-transfer-channel',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: hash0,
    dataHash: root0,
    timestamp: '2021-01-01T00:00:00Z',
    ordererMsp: 'OrdererOrgMSP',
    transactions: [tx0],
    blockHeight: 1,
    merkleLeaves: leaves0
  };

  // Block 1: Cadastral Survey & Initial Title Registry
  const tx1a: FabricTransaction = {
    txId: 'tx_8801_grant_origin_c49',
    channelId: 'property-transfer-channel',
    chaincode: 'LandRegistryContract_v2.4',
    functionName: 'IssueTitleDeed',
    args: {
      titleId: 'TK-CAD-2026-8801',
      parcelId: 'CAD-PARCEL-DOWNTOWN-8801',
      ownerPseudonym: 'Marina Commercial Real Estate Holdings PLC',
      valuationUSD: 14200000,
      cadastralZone: 'COMMERCIAL_DOWNTOWN'
    },
    senderMsp: 'Org1MSP',
    senderName: 'Dr. Elena Vance',
    timestamp: '2021-03-15T10:00:00Z',
    status: 'COMMITTED',
    endorsements: [
      {
        mspId: 'Org1MSP',
        endorserName: 'Dr. Elena Vance (Registrar)',
        certificateThumbprint: 'SHA256:8801_REG_VANCE_CERT',
        signature: 'SIG_ECDSA_REGISTRAR_8801',
        timestamp: '2021-03-15T09:58:00Z',
        status: 'VALID'
      },
      {
        mspId: 'Org3MSP',
        endorserName: 'Amina Diallo (Surveyor)',
        certificateThumbprint: 'SHA256:771_SURVEY_DIALLO',
        signature: 'SIG_ECDSA_SURVEYOR_8801',
        timestamp: '2021-03-15T09:59:00Z',
        status: 'VALID'
      }
    ],
    readSet: ['cadastre/parcels/CAD-PARCEL-DOWNTOWN-8801'],
    writeSet: {
      'titles/TK-CAD-2026-8801': 'STATUS_ACTIVE'
    }
  };

  const tx1b: FabricTransaction = {
    txId: 'tx_4412_subdiv_9901',
    channelId: 'property-transfer-channel',
    chaincode: 'LandRegistryContract_v2.4',
    functionName: 'SubdivideAndIssueTitle',
    args: {
      titleId: 'TK-CAD-2026-4412',
      parcelId: 'CAD-PARCEL-HIGHLAND-4412',
      ownerPseudonym: 'David & Eleanor Chen',
      valuationUSD: 2100000
    },
    senderMsp: 'Org3MSP',
    senderName: 'Amina Diallo, MSc',
    timestamp: '2021-03-15T11:30:00Z',
    status: 'COMMITTED',
    endorsements: [
      {
        mspId: 'Org1MSP',
        endorserName: 'Dr. Elena Vance',
        certificateThumbprint: 'SHA256:8801_REG_VANCE_CERT',
        signature: 'SIG_ECDSA_REG_4412',
        timestamp: '2021-03-15T11:25:00Z',
        status: 'VALID'
      },
      {
        mspId: 'Org2MSP',
        endorserName: 'Marcus Sterling, Esq.',
        certificateThumbprint: 'SHA256:402_NOTARY_STERLING',
        signature: 'SIG_ECDSA_NOTARY_4412',
        timestamp: '2021-03-15T11:28:00Z',
        status: 'VALID'
      }
    ],
    readSet: [],
    writeSet: {
      'titles/TK-CAD-2026-4412': 'STATUS_ACTIVE'
    }
  };

  const leaves1 = [tx1a.txId, tx1b.txId];
  const { root: root1 } = calculateMerkleRoot(leaves1);
  const hash1 = computeFabricBlockHash(1, hash0, root1);

  const block1: FabricBlock = {
    blockNumber: 1,
    channelId: 'property-transfer-channel',
    previousHash: hash0,
    currentHash: hash1,
    dataHash: root1,
    timestamp: '2021-03-15T12:00:00Z',
    ordererMsp: 'OrdererOrgMSP',
    transactions: [tx1a, tx1b],
    blockHeight: 2,
    merkleLeaves: leaves1
  };

  // Block 2: Tech Innovation Allocation & Mortgage Discharge
  const tx2a: FabricTransaction = {
    txId: 'tx_7204_tech_alloc_33b',
    channelId: 'property-transfer-channel',
    chaincode: 'LandRegistryContract_v2.4',
    functionName: 'IssueTitleDeed',
    args: {
      titleId: 'TK-CAD-2026-7204',
      parcelId: 'CAD-PARCEL-TECH-7204',
      ownerPseudonym: 'Quantum Ventures & Real Estate SPV LLC',
      valuationUSD: 8400000
    },
    senderMsp: 'Org1MSP',
    senderName: 'Dr. Elena Vance',
    timestamp: '2022-04-10T15:00:00Z',
    status: 'COMMITTED',
    endorsements: [
      {
        mspId: 'Org1MSP',
        endorserName: 'Dr. Elena Vance',
        certificateThumbprint: 'SHA256:8801_REG_VANCE_CERT',
        signature: 'SIG_REG_7204',
        timestamp: '2022-04-10T14:50:00Z',
        status: 'VALID'
      },
      {
        mspId: 'Org2MSP',
        endorserName: 'Marcus Sterling, Esq.',
        certificateThumbprint: 'SHA256:402_NOTARY_STERLING',
        signature: 'SIG_NOTARY_7204',
        timestamp: '2022-04-10T14:55:00Z',
        status: 'VALID'
      }
    ],
    readSet: [],
    writeSet: {
      'titles/TK-CAD-2026-7204': 'STATUS_ACTIVE'
    }
  };

  const leaves2 = [tx2a.txId];
  const { root: root2 } = calculateMerkleRoot(leaves2);
  const hash2 = computeFabricBlockHash(2, hash1, root2);

  const block2: FabricBlock = {
    blockNumber: 2,
    channelId: 'property-transfer-channel',
    previousHash: hash1,
    currentHash: hash2,
    dataHash: root2,
    timestamp: '2022-04-10T16:00:00Z',
    ordererMsp: 'OrdererOrgMSP',
    transactions: [tx2a],
    blockHeight: 3,
    merkleLeaves: leaves2
  };

  // Block 3: Succession conveyance to Sophia Chen & Coastal Development Deed
  const tx3a: FabricTransaction = {
    txId: 'tx_4412_inherit_transfer_a14',
    channelId: 'property-transfer-channel',
    chaincode: 'LandRegistryContract_v2.4',
    functionName: 'ConveyTitleSuccession',
    args: {
      titleId: 'TK-CAD-2026-4412',
      fromOwner: 'Estate of David Chen',
      toOwner: 'Sophia Maria Chen',
      probateRef: 'PROBATE-DEED-2023-772'
    },
    senderMsp: 'Org2MSP',
    senderName: 'Marcus Sterling, Esq.',
    timestamp: '2023-08-14T11:45:00Z',
    status: 'COMMITTED',
    endorsements: [
      {
        mspId: 'Org1MSP',
        endorserName: 'Dr. Elena Vance',
        certificateThumbprint: 'SHA256:8801_REG_VANCE_CERT',
        signature: 'SIG_REG_INHERIT_4412',
        timestamp: '2023-08-14T11:40:00Z',
        status: 'VALID'
      },
      {
        mspId: 'Org2MSP',
        endorserName: 'Marcus Sterling, Esq.',
        certificateThumbprint: 'SHA256:402_NOTARY_STERLING',
        signature: 'SIG_NOTARY_INHERIT_4412',
        timestamp: '2023-08-14T11:42:00Z',
        status: 'VALID'
      },
      {
        mspId: 'Org4MSP',
        endorserName: 'Vikram Patel',
        certificateThumbprint: 'SHA256:309_TAX_PATEL',
        signature: 'SIG_TAX_CLEARANCE_INHERIT_4412',
        timestamp: '2023-08-14T11:43:00Z',
        status: 'VALID'
      }
    ],
    readSet: ['titles/TK-CAD-2026-4412', 'tax/clearances/TCC-2023-4412'],
    writeSet: {
      'titles/TK-CAD-2026-4412/owner': 'Sophia Maria Chen',
      'titles/TK-CAD-2026-4412/did': 'did:taka:citizen:sophia-chen-92'
    }
  };

  const tx3b: FabricTransaction = {
    txId: 'tx_3055_coastal_transfer_7c',
    channelId: 'property-transfer-channel',
    chaincode: 'LandRegistryContract_v2.4',
    functionName: 'ConveyTitle',
    args: {
      titleId: 'TK-CAD-2026-3055',
      toOwner: 'Marina Commercial Real Estate Holdings PLC',
      considerationUSD: 4900000
    },
    senderMsp: 'Org2MSP',
    senderName: 'Marcus Sterling, Esq.',
    timestamp: '2023-08-14T13:20:00Z',
    status: 'COMMITTED',
    endorsements: [
      {
        mspId: 'Org1MSP',
        endorserName: 'Dr. Elena Vance',
        certificateThumbprint: 'SHA256:8801_REG_VANCE_CERT',
        signature: 'SIG_REG_COASTAL_3055',
        timestamp: '2023-08-14T13:18:00Z',
        status: 'VALID'
      },
      {
        mspId: 'Org2MSP',
        endorserName: 'Marcus Sterling, Esq.',
        certificateThumbprint: 'SHA256:402_NOTARY_STERLING',
        signature: 'SIG_NOTARY_COASTAL_3055',
        timestamp: '2023-08-14T13:19:00Z',
        status: 'VALID'
      }
    ],
    readSet: ['titles/TK-CAD-2026-3055'],
    writeSet: {
      'titles/TK-CAD-2026-3055/owner': 'Marina Commercial Real Estate Holdings PLC'
    }
  };

  const leaves3 = [tx3a.txId, tx3b.txId];
  const { root: root3 } = calculateMerkleRoot(leaves3);
  const hash3 = computeFabricBlockHash(3, hash2, root3);

  const block3: FabricBlock = {
    blockNumber: 3,
    channelId: 'property-transfer-channel',
    previousHash: hash2,
    currentHash: hash3,
    dataHash: root3,
    timestamp: '2023-08-14T14:00:00Z',
    ordererMsp: 'OrdererOrgMSP',
    transactions: [tx3a, tx3b],
    blockHeight: 4,
    merkleLeaves: leaves3
  };

  return [block0, block1, block2, block3];
}

function generateInitialWormLogs(): WORMAuditLog[] {
  const initialLogEntries = [
    {
      index: 0,
      timestamp: '2026-10-18T08:00:00Z',
      actorId: 'user_registrar',
      actorRole: 'ROLE_REGISTRAR' as RoleType,
      actorMsp: 'Org1MSP' as MspId,
      action: 'MFA_AUTH_SUCCESS',
      resource: 'auth/session/token-88091',
      details: 'Dr. Elena Vance authenticated with TOTP hardware token. TLS 1.3 session established.',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) TakaRegistryClient/2.4',
      severity: 'SECURITY' as const,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000'
    },
    {
      index: 1,
      timestamp: '2026-10-18T09:15:22Z',
      actorId: 'user_surveyor',
      actorRole: 'ROLE_SURVEYOR' as RoleType,
      actorMsp: 'Org3MSP' as MspId,
      action: 'CADASTRE_BOUNDARY_VERIFY',
      resource: 'parcels/CAD-PARCEL-DOWNTOWN-8801',
      details: 'Amina Diallo verified geodetic boundary coordinates against Ordnance Survey satellite datum.',
      ipAddress: '192.168.2.45',
      userAgent: 'QGIS-Plugin-TakaConnector/1.8.2',
      severity: 'INFO' as const,
      previousHash: '' // filled dynamically
    },
    {
      index: 2,
      timestamp: '2026-10-18T11:42:01Z',
      actorId: 'user_tax',
      actorRole: 'ROLE_TAX_ASSESSOR' as RoleType,
      actorMsp: 'Org4MSP' as MspId,
      action: 'TAX_CLEARANCE_ISSUANCE',
      resource: 'tax/clearance/TCC-2026-9041-CLEARED',
      details: 'Municipal property tax assessed and confirmed zero outstanding arrears for parcel 8801.',
      ipAddress: '10.0.4.12',
      userAgent: 'GovTaxGateway/3.1',
      severity: 'INFO' as const,
      previousHash: ''
    },
    {
      index: 3,
      timestamp: '2026-10-19T01:10:04Z',
      actorId: 'user_citizen',
      actorRole: 'ROLE_CITIZEN' as RoleType,
      actorMsp: 'CitizenMSP' as MspId,
      action: 'GDPR_ACCESS_AUDIT',
      resource: 'privacy/vault/vault_sophia_chen',
      details: 'Sophia Chen viewed encrypted PII vault record and accessed data portability report (GDPR Art. 20).',
      ipAddress: '86.14.92.102',
      userAgent: 'MobileSafari/17.4 iOS',
      severity: 'GDPR' as const,
      previousHash: ''
    },
    {
      index: 4,
      timestamp: '2026-10-19T03:30:18Z',
      actorId: 'user_auditor',
      actorRole: 'ROLE_AUDITOR' as RoleType,
      actorMsp: 'ExternalAuditMSP' as MspId,
      action: 'FORENSIC_INTEGRITY_SCAN',
      resource: 'blockchain/ledger/full-chain',
      details: 'Arthur Pendelton completed scheduled automated SHA-256 Merkle root and block header validation. 0 discrepancies.',
      ipAddress: '172.16.8.99',
      userAgent: 'TakaForensicsCli/4.0',
      severity: 'SECURITY' as const,
      previousHash: ''
    }
  ];

  const builtLogs: WORMAuditLog[] = [];

  for (let i = 0; i < initialLogEntries.length; i++) {
    const entry = initialLogEntries[i];
    const prevHash = i === 0 
      ? entry.previousHash 
      : builtLogs[i - 1].hash;

    const hash = computeWormLogHash(
      entry.index,
      entry.timestamp,
      entry.actorId,
      entry.action,
      entry.resource,
      entry.details,
      prevHash
    );

    builtLogs.push({
      ...entry,
      id: `WORM-LOG-${1000 + i}`,
      previousHash: prevHash,
      hash,
      isTampered: false
    });
  }

  return builtLogs;
}

export class FabricLedgerService {
  private static load<T>(key: string, defaultFactory: () => T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Storage read failed, using defaults', e);
    }
    const defaults = defaultFactory();
    this.save(key, defaults);
    return defaults;
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  static getBlocks(): FabricBlock[] {
    return this.load<FabricBlock[]>(STORAGE_KEYS.BLOCKS, generateInitialBlocks);
  }

  static getTitles(): LandTitle[] {
    return this.load<LandTitle[]>(STORAGE_KEYS.TITLES, () => INITIAL_LAND_TITLES);
  }

  static getPiiVault(): Record<string, OffChainPiiRecord> {
    return this.load<Record<string, OffChainPiiRecord>>(STORAGE_KEYS.PII_VAULT, () => INITIAL_OFFCHAIN_PII);
  }

  static getWormLogs(): WORMAuditLog[] {
    return this.load<WORMAuditLog[]>(STORAGE_KEYS.WORM_LOGS, generateInitialWormLogs);
  }

  static getGdprConsents(): GDPRConsentRecord[] {
    return this.load<GDPRConsentRecord[]>(STORAGE_KEYS.GDPR_CONSENTS, () => INITIAL_GDPR_CONSENTS);
  }

  static getActiveUserId(): string {
    return this.load<string>(STORAGE_KEYS.ACTIVE_USER_ID, () => 'user_registrar');
  }

  static setActiveUserId(userId: string): void {
    this.save(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  }

  static appendWormLog(
    actorId: string,
    actorRole: RoleType,
    actorMsp: MspId,
    action: string,
    resource: string,
    details: string,
    severity: 'INFO' | 'SECURITY' | 'CRITICAL' | 'GDPR' = 'INFO'
  ): WORMAuditLog {
    const logs = this.getWormLogs();
    const lastLog = logs[logs.length - 1];
    const newIndex = logs.length;
    const timestamp = new Date().toISOString();
    const prevHash = lastLog ? lastLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';

    const hash = computeWormLogHash(
      newIndex,
      timestamp,
      actorId,
      action,
      resource,
      details,
      prevHash
    );

    const newLog: WORMAuditLog = {
      id: `WORM-LOG-${1000 + newIndex}`,
      index: newIndex,
      timestamp,
      actorId,
      actorRole,
      actorMsp,
      action,
      resource,
      details,
      ipAddress: '10.244.0.88',
      userAgent: 'TakaSecurePortal/2.4 (mTLS TLS_AES_256_GCM)',
      severity,
      hash,
      previousHash: prevHash,
      isTampered: false
    };

    logs.push(newLog);
    this.save(STORAGE_KEYS.WORM_LOGS, logs);
    return newLog;
  }

  static executeTransfer(params: {
    titleId: string;
    newOwnerName: string;
    newOwnerDid: string;
    considerationUSD: number;
    notaryMsp: MspId;
    notaryName: string;
    notes: string;
    userRole: RoleType;
    userMsp: MspId;
    userId: string;
  }): { success: boolean; block: FabricBlock; transaction: FabricTransaction; message: string } {
    const titles = this.getTitles();
    const title = titles.find(t => t.id === params.titleId);

    if (!title) {
      throw new Error(`Land Title with ID ${params.titleId} not found in World State.`);
    }

    if (title.status === 'FROZEN_JUDICIAL') {
      throw new Error('Transaction blocked: Title is currently under judicial freeze injunction.');
    }

    // Check for blocking active liens
    const activeLien = title.liens.find(l => l.status === 'ACTIVE' && l.lienType !== 'EASEMENT');
    if (activeLien) {
      throw new Error(`Transaction blocked: Unresolved lien ${activeLien.id} held by ${activeLien.holder}.`);
    }

    const previousOwner = title.currentOwnerPseudonym;
    const blocks = this.getBlocks();
    const lastBlock = blocks[blocks.length - 1];
    const newBlockNumber = blocks.length;

    const txId = `tx_${title.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}_xfer_${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const endorsements: EndorsementSignature[] = [
      {
        mspId: 'Org2MSP',
        endorserName: params.notaryName || 'Marcus Sterling, Esq. (Notary)',
        certificateThumbprint: `SHA256:${sha256(params.notaryName).substring(0, 16)}`,
        signature: `SIG_ECDSA_NOTARY_${sha256(txId).substring(0, 24)}`,
        timestamp: nowIso,
        status: 'VALID'
      },
      {
        mspId: 'Org1MSP',
        endorserName: 'Dr. Elena Vance (Registrar)',
        certificateThumbprint: 'SHA256:8801_REG_VANCE_CERT',
        signature: `SIG_ECDSA_REG_${sha256(txId).substring(0, 24)}`,
        timestamp: nowIso,
        status: 'VALID'
      },
      {
        mspId: 'Org4MSP',
        endorserName: 'Vikram Patel (Tax Assessor)',
        certificateThumbprint: 'SHA256:309_TAX_PATEL',
        signature: `SIG_TAX_CLEARANCE_${sha256(title.lastTaxClearanceId).substring(0, 20)}`,
        timestamp: nowIso,
        status: 'VALID'
      }
    ];

    const transaction: FabricTransaction = {
      txId,
      channelId: 'property-transfer-channel',
      chaincode: 'LandRegistryContract_v2.4',
      functionName: 'ConveyTitleDeed',
      args: {
        titleId: title.id,
        fromOwner: previousOwner,
        toOwner: params.newOwnerName,
        toOwnerDid: params.newOwnerDid,
        considerationUSD: params.considerationUSD,
        notes: params.notes
      },
      senderMsp: params.userMsp,
      senderName: params.notaryName || 'Authorized Endorser',
      timestamp: nowIso,
      status: 'COMMITTED',
      endorsements,
      readSet: [`titles/${title.id}`, `tax/clearances/${title.lastTaxClearanceId}`],
      writeSet: {
        [`titles/${title.id}/owner`]: params.newOwnerName,
        [`titles/${title.id}/ownerDid`]: params.newOwnerDid,
        [`titles/${title.id}/valuationUSD`]: params.considerationUSD
      }
    };

    const leaves = [transaction.txId];
    const { root: merkleRoot } = calculateMerkleRoot(leaves);
    const blockHash = computeFabricBlockHash(newBlockNumber, lastBlock.currentHash, merkleRoot);

    const newBlock: FabricBlock = {
      blockNumber: newBlockNumber,
      channelId: 'property-transfer-channel',
      previousHash: lastBlock.currentHash,
      currentHash: blockHash,
      dataHash: merkleRoot,
      timestamp: nowIso,
      ordererMsp: 'OrdererOrgMSP (Raft Cluster)',
      transactions: [transaction],
      blockHeight: newBlockNumber + 1,
      merkleLeaves: leaves
    };

    // Update Land Title in World State
    title.currentOwnerPseudonym = params.newOwnerName;
    title.ownerDid = params.newOwnerDid;
    title.status = 'ACTIVE';
    title.valuationUSD = params.considerationUSD || title.valuationUSD;

    title.provenanceHistory.push({
      id: `PROV-XFER-${Date.now().toString(36).toUpperCase()}`,
      timestamp: nowIso,
      event: 'CONVEYANCE_AND_LEGAL_TRANSFER',
      fromParty: previousOwner,
      toParty: params.newOwnerName,
      considerationUSD: params.considerationUSD,
      txId: transaction.txId,
      blockNumber: newBlockNumber,
      notaryMsp: 'Org2MSP',
      deedRef: `DEED-CONV-${newBlockNumber}-${Date.now().toString(36).toUpperCase()}`
    });

    // Save changes
    blocks.push(newBlock);
    this.save(STORAGE_KEYS.BLOCKS, blocks);
    this.save(STORAGE_KEYS.TITLES, titles);

    // Append to WORM Audit Log
    this.appendWormLog(
      params.userId,
      params.userRole,
      params.userMsp,
      'COMMITTED_TRANSFER_TRANSACTION',
      `titles/${title.id}`,
      `Transferred title from ${previousOwner} to ${params.newOwnerName} for $${params.considerationUSD.toLocaleString()}. Block #${newBlockNumber} mined with 3 endorsements.`,
      'SECURITY'
    );

    return {
      success: true,
      block: newBlock,
      transaction,
      message: `Property transfer committed successfully in Block #${newBlockNumber}!`
    };
  }

  static registerLien(params: {
    titleId: string;
    lienType: 'MORTGAGE' | 'MUNICIPAL_TAX' | 'JUDICIAL_INJUNCTION' | 'EASEMENT';
    holder: string;
    amountUSD: number;
    instrumentRef: string;
    userId: string;
    userRole: RoleType;
    userMsp: MspId;
  }): void {
    const titles = this.getTitles();
    const title = titles.find(t => t.id === params.titleId);
    if (!title) throw new Error(`Title ${params.titleId} not found.`);

    const newLien = {
      id: `LIEN-${Date.now().toString(36).toUpperCase()}`,
      lienType: params.lienType,
      holder: params.holder,
      amountUSD: params.amountUSD,
      dateRegistered: new Date().toISOString().split('T')[0],
      status: 'ACTIVE' as const,
      instrumentRef: params.instrumentRef
    };

    title.liens.push(newLien);
    if (params.lienType === 'JUDICIAL_INJUNCTION') {
      title.status = 'FROZEN_JUDICIAL';
    } else {
      title.status = 'ENCUMBERED_LIEN';
    }

    this.save(STORAGE_KEYS.TITLES, titles);

    this.appendWormLog(
      params.userId,
      params.userRole,
      params.userMsp,
      'REGISTER_LIEN_INSTRUMENT',
      `titles/${title.id}/liens/${newLien.id}`,
      `Registered ${params.lienType} lien of $${params.amountUSD.toLocaleString()} by ${params.holder}. Ref: ${params.instrumentRef}.`,
      'SECURITY'
    );
  }

  static releaseLien(params: {
    titleId: string;
    lienId: string;
    userId: string;
    userRole: RoleType;
    userMsp: MspId;
  }): void {
    const titles = this.getTitles();
    const title = titles.find(t => t.id === params.titleId);
    if (!title) throw new Error(`Title ${params.titleId} not found.`);

    const lien = title.liens.find(l => l.id === params.lienId);
    if (!lien) throw new Error(`Lien ${params.lienId} not found.`);

    lien.status = 'RELEASED';
    
    // Check if any active liens remain
    const hasOtherActive = title.liens.some(l => l.status === 'ACTIVE');
    if (!hasOtherActive) {
      title.status = 'ACTIVE';
    }

    this.save(STORAGE_KEYS.TITLES, titles);

    this.appendWormLog(
      params.userId,
      params.userRole,
      params.userMsp,
      'RELEASE_LIEN_DISCHARGE',
      `titles/${title.id}/liens/${lien.id}`,
      `Discharged and released ${lien.lienType} lien previously held by ${lien.holder}.`,
      'SECURITY'
    );
  }

  static executeGdprErasure(vaultId: string, citizenDid: string, userId: string): {
    certificateId: string;
    shreddedAt: string;
  } {
    const piiVault = this.getPiiVault();
    const record = piiVault[vaultId];

    if (!record) {
      throw new Error(`PII Vault record ${vaultId} not found.`);
    }

    const certificateId = `GDPR-SHRED-${Date.now().toString(36).toUpperCase()}`;
    const shreddedAt = new Date().toISOString();

    // Perform Cryptographic Shredding (Destroying encryption keys & replacing plaintext)
    record.isShredded = true;
    record.erasureDate = shreddedAt;
    record.erasureCertificateId = certificateId;
    record.fullName = `[REDACTED PER GDPR ART. 17 - CERT #${certificateId}]`;
    record.nationalIdNumber = `[SHREDDED: SHA-256 ZEROIZED]`;
    record.taxPayerNumber = `[SHREDDED: ZEROIZED]`;
    record.email = `redacted-gdpr-${certificateId.toLowerCase()}@taka.erased`;
    record.phoneNumber = `[REDACTED]`;
    record.registeredAddress = `[CONFIDENTIAL - RESIDENCE PII DESTROYED]`;

    this.save(STORAGE_KEYS.PII_VAULT, piiVault);

    // Add immutable record to WORM audit log
    this.appendWormLog(
      userId,
      'ROLE_CITIZEN',
      'CitizenMSP',
      'GDPR_ARTICLE_17_CRYPTOGRAPHIC_SHREDDING',
      `pii_vault/${vaultId}`,
      `Subject Access Request: Executed cryptographic key destruction for DID ${citizenDid}. Off-chain plaintext erased. On-chain mathematical integrity preserved. Cert: ${certificateId}`,
      'GDPR'
    );

    return {
      certificateId,
      shreddedAt
    };
  }

  static tamperWormLogForDemo(logIndex: number): void {
    const logs = this.getWormLogs();
    if (logIndex >= 0 && logIndex < logs.length) {
      logs[logIndex].details = logs[logIndex].details + ' [TAMPERED_UNAUTHORIZED_MUTATION]';
      logs[logIndex].isTampered = true;
      this.save(STORAGE_KEYS.WORM_LOGS, logs);
    }
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.BLOCKS);
    localStorage.removeItem(STORAGE_KEYS.TITLES);
    localStorage.removeItem(STORAGE_KEYS.PII_VAULT);
    localStorage.removeItem(STORAGE_KEYS.WORM_LOGS);
    localStorage.removeItem(STORAGE_KEYS.GDPR_CONSENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  }
}
