/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleType = 
  | 'ROLE_REGISTRAR' 
  | 'ROLE_NOTARY' 
  | 'ROLE_SURVEYOR' 
  | 'ROLE_TAX_ASSESSOR' 
  | 'ROLE_CITIZEN' 
  | 'ROLE_AUDITOR';

export type MspId = 
  | 'Org1MSP'        // Land Registry Authority
  | 'Org2MSP'        // Licensed Notary & Legal Conveyancer
  | 'Org3MSP'        // Cadastral Survey & GIS Bureau
  | 'Org4MSP'        // Municipal Revenue & Tax Authority
  | 'CitizenMSP'     // Citizen / Landowner Identity
  | 'ExternalAuditMSP'; // Independent Judicial & Forensic Auditor

export interface UserPersona {
  id: string;
  name: string;
  title: string;
  role: RoleType;
  mspId: MspId;
  clearanceLevel: number;
  did: string;
  avatarColor: string;
  mfaEnabled: boolean;
  mfaSecret: string;
  allowedActions: string[];
}

export type ChannelId = 
  | 'property-transfer-channel'
  | 'cadastre-channel'
  | 'tax-compliance-channel';

export interface EndorsementSignature {
  mspId: MspId;
  endorserName: string;
  certificateThumbprint: string;
  signature: string;
  timestamp: string;
  status: 'VALID' | 'INVALID';
}

export interface FabricTransaction {
  txId: string;
  channelId: ChannelId;
  chaincode: string;
  functionName: string;
  args: Record<string, any>;
  senderMsp: MspId;
  senderName: string;
  timestamp: string;
  endorsements: EndorsementSignature[];
  status: 'COMMITTED' | 'PENDING' | 'REJECTED';
  readSet: string[];
  writeSet: Record<string, any>;
}

export interface FabricBlock {
  blockNumber: number;
  channelId: ChannelId;
  previousHash: string;
  currentHash: string;
  dataHash: string; // Merkle root
  timestamp: string;
  ordererMsp: string;
  transactions: FabricTransaction[];
  blockHeight: number;
  merkleLeaves: string[];
}

export interface ParcelCoordinates {
  centerLat: number;
  centerLng: number;
  polygonPoints: [number, number][]; // Relative SVG grid coordinates [x, y]
  boundaryWGS84: string;
  elevationMeters: number;
}

export interface ProvenanceRecord {
  id: string;
  timestamp: string;
  event: string;
  fromParty: string;
  toParty: string;
  considerationUSD: number;
  txId: string;
  blockNumber: number;
  notaryMsp: string;
  deedRef: string;
}

export interface Lien {
  id: string;
  lienType: 'MORTGAGE' | 'MUNICIPAL_TAX' | 'JUDICIAL_INJUNCTION' | 'EASEMENT';
  holder: string;
  amountUSD: number;
  dateRegistered: string;
  status: 'ACTIVE' | 'RELEASED';
  instrumentRef: string;
}

export interface LandTitle {
  id: string; // e.g. TK-CAD-2026-8801
  parcelId: string;
  titleDeedNumber: string;
  legalDescription: string;
  cadastralZone: 'COMMERCIAL_DOWNTOWN' | 'RESIDENTIAL_PRIME' | 'AGRI_HIGHLAND' | 'TECH_INNOVATION' | 'COASTAL_MARINA';
  areaSqm: number;
  coordinates: ParcelCoordinates;
  status: 'ACTIVE' | 'TRANSFER_PENDING' | 'ENCUMBERED_LIEN' | 'FROZEN_JUDICIAL';
  currentOwnerPseudonym: string;
  ownerDid: string;
  ownerEncryptedVaultId: string; // References off-chain PII vault
  valuationUSD: number;
  annualTaxRatePercent: number;
  lastTaxClearanceId: string;
  liens: Lien[];
  provenanceHistory: ProvenanceRecord[];
  createdDate: string;
  registeredBlock: number;
}

export interface OffChainPiiRecord {
  vaultId: string;
  ownerDid: string;
  fullName: string;
  nationalIdNumber: string;
  taxPayerNumber: string;
  email: string;
  phoneNumber: string;
  registeredAddress: string;
  encryptionAlgorithm: 'AES-256-GCM';
  kmsKeyId: string;
  isShredded: boolean; // GDPR Right to Erasure flag
  erasureDate?: string;
  erasureCertificateId?: string;
}

export interface WORMAuditLog {
  id: string;
  index: number;
  timestamp: string;
  actorId: string;
  actorRole: RoleType;
  actorMsp: MspId;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'INFO' | 'SECURITY' | 'CRITICAL' | 'GDPR';
  hash: string;
  previousHash: string;
  isTampered?: boolean;
}

export interface GovernmentIntegrationStatus {
  serviceId: string;
  name: string;
  agency: string;
  endpoint: string;
  protocol: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'DEGRADED';
  latencyMs: number;
  lastSync: string;
  schemaVersion: string;
  tlsVersion: string;
  mutualTlsEnabled: boolean;
  sampleRecord: Record<string, any>;
}

export interface GDPRConsentRecord {
  id: string;
  purpose: string;
  legalBasis: 'GDPR_ART_6_1_C_LEGAL_OBLIGATION' | 'GDPR_ART_6_1_A_CONSENT' | 'GDPR_ART_6_1_E_PUBLIC_INTEREST';
  dataTypes: string[];
  grantedAt: string;
  retentionPeriod: string;
  canRevoke: boolean;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}
