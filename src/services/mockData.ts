/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserPersona,
  LandTitle,
  OffChainPiiRecord,
  GovernmentIntegrationStatus,
  GDPRConsentRecord,
  ChannelId,
  FabricBlock
} from '../types/fabric';
import {
  computeFabricBlockHash,
  calculateMerkleRoot,
  computeWormLogHash,
  sha256
} from './cryptoEngine';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'user_registrar',
    name: 'Dr. Elena Vance',
    title: 'Chief Land Registrar & Cadastre Director',
    role: 'ROLE_REGISTRAR',
    mspId: 'Org1MSP',
    clearanceLevel: 4,
    did: 'did:taka:reg:elena-vance-001',
    avatarColor: 'from-amber-500 to-orange-600',
    mfaEnabled: true,
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    allowedActions: [
      'ISSUE_TITLE_DEED',
      'COMMIT_TRANSFER',
      'EMERGENCY_FREEZE_TITLE',
      'VIEW_CLASSIFIED_DEEDS',
      'GENERATE_DEED_SEAL'
    ]
  },
  {
    id: 'user_notary',
    name: 'Marcus Sterling, Esq.',
    title: 'Licensed Conveyancing Notary & Legal Counsel',
    role: 'ROLE_NOTARY',
    mspId: 'Org2MSP',
    clearanceLevel: 3,
    did: 'did:taka:notary:marcus-sterling-402',
    avatarColor: 'from-blue-600 to-indigo-700',
    mfaEnabled: true,
    mfaSecret: 'HXDMVJECJJWSRZ3U',
    allowedActions: [
      'DRAFT_CONVEYANCE_DEED',
      'ENDORSE_TRANSFER_PROPOSAL',
      'VALIDATE_ESCROW_FUNDS',
      'ATTEST_POWER_OF_ATTORNEY'
    ]
  },
  {
    id: 'user_surveyor',
    name: 'Amina Diallo, MSc',
    title: 'Senior Cadastral GIS & Geodetic Surveyor',
    role: 'ROLE_SURVEYOR',
    mspId: 'Org3MSP',
    clearanceLevel: 3,
    did: 'did:taka:survey:amina-diallo-771',
    avatarColor: 'from-emerald-500 to-teal-700',
    mfaEnabled: true,
    mfaSecret: 'MZXXE33QNZTWK43U',
    allowedActions: [
      'SUBMIT_CADASTRAL_BOUNDARY',
      'CERTIFY_PARCEL_SPLIT',
      'GEO_RECTIFY_COORDINATES',
      'SIGN_SURVEY_PLAT'
    ]
  },
  {
    id: 'user_tax',
    name: 'Vikram Patel',
    title: 'Principal Municipal Tax Assessor',
    role: 'ROLE_TAX_ASSESSOR',
    mspId: 'Org4MSP',
    clearanceLevel: 2,
    did: 'did:taka:tax:vikram-patel-309',
    avatarColor: 'from-cyan-500 to-blue-600',
    mfaEnabled: true,
    mfaSecret: 'N5ZGS3THORXW63TF',
    allowedActions: [
      'ISSUE_TAX_CLEARANCE',
      'ASSESS_ANNUAL_LAND_RATES',
      'REGISTER_MUNICIPAL_TAX_LIEN',
      'AUDIT_VALUATIONS'
    ]
  },
  {
    id: 'user_citizen',
    name: 'Sophia Chen',
    title: 'Registered Property Owner & Citizen',
    role: 'ROLE_CITIZEN',
    mspId: 'CitizenMSP',
    clearanceLevel: 1,
    did: 'did:taka:citizen:sophia-chen-92',
    avatarColor: 'from-purple-500 to-pink-600',
    mfaEnabled: true,
    mfaSecret: 'KRSXG5CTMVRXEZLU',
    allowedActions: [
      'VIEW_OWNED_TITLES',
      'SIGN_TRANSFER_OFFER',
      'EXERCISE_GDPR_PORTABILITY',
      'REQUEST_GDPR_ERASURE',
      'MANAGE_CONSENT_PREFERENCES'
    ]
  },
  {
    id: 'user_auditor',
    name: 'Arthur Pendelton',
    title: 'Senior Judicial & Forensic Blockchain Auditor',
    role: 'ROLE_AUDITOR',
    mspId: 'ExternalAuditMSP',
    clearanceLevel: 5,
    did: 'did:taka:audit:arthur-pendelton-999',
    avatarColor: 'from-slate-600 to-zinc-800',
    mfaEnabled: true,
    mfaSecret: 'OBWGC3TFONXXEZLU',
    allowedActions: [
      'READ_ALL_WORM_LOGS',
      'VERIFY_CHAIN_INTEGRITY',
      'EXPORT_FORENSIC_EVIDENCE',
      'INSPECT_CONSENSUS_ROUNDS',
      'AUDIT_GDPR_DESTRUCTION_LOGS'
    ]
  }
];

export const INITIAL_OFFCHAIN_PII: Record<string, OffChainPiiRecord> = {
  'vault_sophia_chen': {
    vaultId: 'vault_sophia_chen',
    ownerDid: 'did:taka:citizen:sophia-chen-92',
    fullName: 'Sophia Maria Chen',
    nationalIdNumber: 'ID-8849-2094-X',
    taxPayerNumber: 'TAX-UK-99210-90',
    email: 'sophia.chen@example.org',
    phoneNumber: '+44 7700 900341',
    registeredAddress: '42 Meadowsweet Lane, Highland Valley, Postcode HV4 9TQ',
    encryptionAlgorithm: 'AES-256-GCM',
    kmsKeyId: 'kms-arn-cloud-eu-west1-taka-key-089',
    isShredded: false
  },
  'vault_marina_holdings': {
    vaultId: 'vault_marina_holdings',
    ownerDid: 'did:taka:org:marina-holdings-88',
    fullName: 'Marina Commercial Real Estate Holdings PLC',
    nationalIdNumber: 'CORP-GB-09881234',
    taxPayerNumber: 'VAT-GB-883-9912-10',
    email: 'registry@marinaholdings.example.com',
    phoneNumber: '+44 20 7946 0881',
    registeredAddress: 'Level 38, Marina Waterfront Tower, Financial District',
    encryptionAlgorithm: 'AES-256-GCM',
    kmsKeyId: 'kms-arn-cloud-eu-west1-taka-key-011',
    isShredded: false
  },
  'vault_silicon_ridge': {
    vaultId: 'vault_silicon_ridge',
    ownerDid: 'did:taka:org:quantum-ventures-55',
    fullName: 'Quantum Ventures & Real Estate SPV LLC',
    nationalIdNumber: 'CORP-US-DE-4491028',
    taxPayerNumber: 'EIN-84-9910283',
    email: 'acquisitions@quantumridge.example.com',
    phoneNumber: '+1 415 555 0192',
    registeredAddress: '500 Innovation Way, Silicon Ridge Innovation Park',
    encryptionAlgorithm: 'AES-256-GCM',
    kmsKeyId: 'kms-arn-cloud-eu-west1-taka-key-044',
    isShredded: false
  },
  'vault_st_jude': {
    vaultId: 'vault_st_jude',
    ownerDid: 'did:taka:estate:st-jude-heritage-trust',
    fullName: 'St. Jude Heritage & Philanthropic Trust',
    nationalIdNumber: 'CHARITY-UK-1102934',
    taxPayerNumber: 'TAX-EXEMPT-009182',
    email: 'trustees@stjudeheritage.example.org',
    phoneNumber: '+44 131 496 0229',
    registeredAddress: '1 Manor Crescent, Old Town Edinburgh',
    encryptionAlgorithm: 'AES-256-GCM',
    kmsKeyId: 'kms-arn-cloud-eu-west1-taka-key-022',
    isShredded: false
  }
};

export const INITIAL_LAND_TITLES: LandTitle[] = [
  {
    id: 'TK-CAD-2026-8801',
    parcelId: 'CAD-PARCEL-DOWNTOWN-8801',
    titleDeedNumber: 'DEED-REG-2026-008801-A',
    legalDescription: 'Downtown Commercial Parcel 8801, Prime Business Core, 42-Storey Tower Footprint with underground transit easement.',
    cadastralZone: 'COMMERCIAL_DOWNTOWN',
    areaSqm: 4250,
    coordinates: {
      centerLat: 51.5074,
      centerLng: -0.1278,
      polygonPoints: [[120, 100], [220, 100], [240, 180], [140, 190]],
      boundaryWGS84: 'POLYGON((-0.1281 51.5076, -0.1272 51.5076, -0.1270 51.5071, -0.1279 51.5070, -0.1281 51.5076))',
      elevationMeters: 28.4
    },
    status: 'ACTIVE',
    currentOwnerPseudonym: 'Marina Commercial Real Estate Holdings PLC',
    ownerDid: 'did:taka:org:marina-holdings-88',
    ownerEncryptedVaultId: 'vault_marina_holdings',
    valuationUSD: 18400000,
    annualTaxRatePercent: 1.25,
    lastTaxClearanceId: 'TCC-2026-9041-CLEARED',
    liens: [],
    provenanceHistory: [
      {
        id: 'PROV-001',
        timestamp: '2021-03-15T10:00:00Z',
        event: 'ORIGINAL_STATE_CADASTRAL_GRANT',
        fromParty: 'National Department of Crown & Municipal Lands',
        toParty: 'Marina Commercial Real Estate Holdings PLC',
        considerationUSD: 14200000,
        txId: 'tx_8801_grant_origin_c49',
        blockNumber: 1,
        notaryMsp: 'Org2MSP',
        deedRef: 'DEED-GRANT-2021-001'
      },
      {
        id: 'PROV-002',
        timestamp: '2024-06-20T14:30:00Z',
        event: 'COMMERCIAL_MORTGAGE_DISCHARGE',
        fromParty: 'Syndicate Bank of London',
        toParty: 'Marina Commercial Real Estate Holdings PLC',
        considerationUSD: 0,
        txId: 'tx_8801_lien_discharge_92a',
        blockNumber: 2,
        notaryMsp: 'Org2MSP',
        deedRef: 'DISCHARGE-CERT-909'
      }
    ],
    createdDate: '2021-03-15',
    registeredBlock: 1
  },
  {
    id: 'TK-CAD-2026-4412',
    parcelId: 'CAD-PARCEL-HIGHLAND-4412',
    titleDeedNumber: 'DEED-REG-2026-004412-B',
    legalDescription: 'Highland Agricultural Parcel 4412, Organic Soil Certified, Spring Water Rights with Natural Stream Easement.',
    cadastralZone: 'AGRI_HIGHLAND',
    areaSqm: 85400,
    coordinates: {
      centerLat: 56.4907,
      centerLng: -4.2026,
      polygonPoints: [[260, 80], [380, 70], [370, 180], [250, 160]],
      boundaryWGS84: 'POLYGON((-4.2040 56.4920, -4.1990 56.4918, -4.2001 56.4880, -4.2052 56.4885, -4.2040 56.4920))',
      elevationMeters: 312.0
    },
    status: 'ACTIVE',
    currentOwnerPseudonym: 'Sophia Maria Chen',
    ownerDid: 'did:taka:citizen:sophia-chen-92',
    ownerEncryptedVaultId: 'vault_sophia_chen',
    valuationUSD: 2850000,
    annualTaxRatePercent: 0.65,
    lastTaxClearanceId: 'TCC-2026-4412-CLEARED',
    liens: [
      {
        id: 'LIEN-2023-MORT-891',
        lienType: 'MORTGAGE',
        holder: 'Apex Rural & Agricultural Credit Bank',
        amountUSD: 1200000,
        dateRegistered: '2023-11-04',
        status: 'ACTIVE',
        instrumentRef: 'MORT-INST-2023-891'
      }
    ],
    provenanceHistory: [
      {
        id: 'PROV-4412-01',
        timestamp: '2019-09-12T09:15:00Z',
        event: 'SUBDIVISION_FROM_PARENT_ESTATE',
        fromParty: 'Lochland Ancestral Holdings Trust',
        toParty: 'David & Eleanor Chen',
        considerationUSD: 2100000,
        txId: 'tx_4412_subdiv_9901',
        blockNumber: 1,
        notaryMsp: 'Org2MSP',
        deedRef: 'DEED-SUBDIV-2019-44'
      },
      {
        id: 'PROV-4412-02',
        timestamp: '2023-08-14T11:45:00Z',
        event: 'SUCCESSION_AND_INHERITANCE_CONVEYANCE',
        fromParty: 'Estate of David Chen',
        toParty: 'Sophia Maria Chen',
        considerationUSD: 0,
        txId: 'tx_4412_inherit_transfer_a14',
        blockNumber: 3,
        notaryMsp: 'Org2MSP',
        deedRef: 'PROBATE-DEED-2023-772'
      }
    ],
    createdDate: '2019-09-12',
    registeredBlock: 1
  },
  {
    id: 'TK-CAD-2026-7204',
    parcelId: 'CAD-PARCEL-TECH-7204',
    titleDeedNumber: 'DEED-REG-2026-007204-C',
    legalDescription: 'Silicon Ridge Quantum Innovation Zone Lot 4, Fiber-optic direct ring link, High-load industrial electrical substation.',
    cadastralZone: 'TECH_INNOVATION',
    areaSqm: 12800,
    coordinates: {
      centerLat: 52.2053,
      centerLng: 0.1218,
      polygonPoints: [[110, 230], [210, 220], [230, 310], [120, 320]],
      boundaryWGS84: 'POLYGON((0.1210 52.2060, 0.1235 52.2058, 0.1238 52.2039, 0.1212 52.2041, 0.1210 52.2060))',
      elevationMeters: 45.2
    },
    status: 'TRANSFER_PENDING',
    currentOwnerPseudonym: 'Quantum Ventures & Real Estate SPV LLC',
    ownerDid: 'did:taka:org:quantum-ventures-55',
    ownerEncryptedVaultId: 'vault_silicon_ridge',
    valuationUSD: 9650000,
    annualTaxRatePercent: 1.10,
    lastTaxClearanceId: 'TCC-2026-7204-CLEARED',
    liens: [],
    provenanceHistory: [
      {
        id: 'PROV-7204-01',
        timestamp: '2022-04-10T15:00:00Z',
        event: 'SPECIAL_INNOVATION_DISTRICT_ALLOCATION',
        fromParty: 'Regional Development Agency',
        toParty: 'Quantum Ventures & Real Estate SPV LLC',
        considerationUSD: 8400000,
        txId: 'tx_7204_tech_alloc_33b',
        blockNumber: 2,
        notaryMsp: 'Org2MSP',
        deedRef: 'DEED-RDA-2022-99'
      }
    ],
    createdDate: '2022-04-10',
    registeredBlock: 2
  },
  {
    id: 'TK-CAD-2026-1190',
    parcelId: 'CAD-PARCEL-HERITAGE-1190',
    titleDeedNumber: 'DEED-REG-2026-001190-D',
    legalDescription: 'St. Jude Heritage Historic Manor & Grounds, Grade-I Listed Architectural Conservation Landmark.',
    cadastralZone: 'RESIDENTIAL_PRIME',
    areaSqm: 1950,
    coordinates: {
      centerLat: 55.9533,
      centerLng: -3.1883,
      polygonPoints: [[270, 210], [360, 200], [350, 290], [260, 280]],
      boundaryWGS84: 'POLYGON((-3.1895 55.9540, -3.1865 55.9538, -3.1870 55.9520, -3.1901 55.9522, -3.1895 55.9540))',
      elevationMeters: 74.0
    },
    status: 'ENCUMBERED_LIEN',
    currentOwnerPseudonym: 'St. Jude Heritage & Philanthropic Trust',
    ownerDid: 'did:taka:estate:st-jude-heritage-trust',
    ownerEncryptedVaultId: 'vault_st_jude',
    valuationUSD: 3200000,
    annualTaxRatePercent: 0.80,
    lastTaxClearanceId: 'TCC-2026-1190-CLEARED',
    liens: [
      {
        id: 'LIEN-2025-JUD-041',
        lienType: 'JUDICIAL_INJUNCTION',
        holder: 'High Court of Justice (Probate & Trust Division)',
        amountUSD: 650000,
        dateRegistered: '2025-07-19',
        status: 'ACTIVE',
        instrumentRef: 'HCJ-ORDER-2025-CV-8820'
      }
    ],
    provenanceHistory: [
      {
        id: 'PROV-1190-01',
        timestamp: '2015-01-20T10:00:00Z',
        event: 'HERITAGE_CHARITABLE_SETTLEMENT',
        fromParty: 'Lord Alistair Montgomery',
        toParty: 'St. Jude Heritage & Philanthropic Trust',
        considerationUSD: 2400000,
        txId: 'tx_1190_heritage_settle_01',
        blockNumber: 1,
        notaryMsp: 'Org2MSP',
        deedRef: 'DEED-CHARITY-2015-09'
      }
    ],
    createdDate: '2015-01-20',
    registeredBlock: 1
  },
  {
    id: 'TK-CAD-2026-3055',
    parcelId: 'CAD-PARCEL-COASTAL-3055',
    titleDeedNumber: 'DEED-REG-2026-003055-E',
    legalDescription: 'Azure Coastline Eco Villa 12, Direct Sea Access, Riparian Rights with Ecological Marine Protection Buffer.',
    cadastralZone: 'COASTAL_MARINA',
    areaSqm: 3100,
    coordinates: {
      centerLat: 50.7192,
      centerLng: -1.8808,
      polygonPoints: [[180, 340], [280, 330], [290, 420], [170, 410]],
      boundaryWGS84: 'POLYGON((-1.8820 50.7200, -1.8790 50.7195, -1.8795 50.7175, -1.8825 50.7180, -1.8820 50.7200))',
      elevationMeters: 14.8
    },
    status: 'ACTIVE',
    currentOwnerPseudonym: 'Marina Commercial Real Estate Holdings PLC',
    ownerDid: 'did:taka:org:marina-holdings-88',
    ownerEncryptedVaultId: 'vault_marina_holdings',
    valuationUSD: 5400000,
    annualTaxRatePercent: 0.95,
    lastTaxClearanceId: 'TCC-2026-3055-CLEARED',
    liens: [],
    provenanceHistory: [
      {
        id: 'PROV-3055-01',
        timestamp: '2023-02-18T13:20:00Z',
        event: 'COASTAL_DEVELOPMENT_DEED',
        fromParty: 'Coastal Haven Developers Ltd',
        toParty: 'Marina Commercial Real Estate Holdings PLC',
        considerationUSD: 4900000,
        txId: 'tx_3055_coastal_transfer_7c',
        blockNumber: 3,
        notaryMsp: 'Org2MSP',
        deedRef: 'DEED-COAST-2023-12'
      }
    ],
    createdDate: '2023-02-18',
    registeredBlock: 3
  }
];

export const GOVERNMENT_INTEGRATIONS: GovernmentIntegrationStatus[] = [
  {
    serviceId: 'gov_gis_cadastre',
    name: 'National Cadastre & Geodetic Survey System (GIS)',
    agency: 'HM Land Registry & Ordnance Survey Division',
    endpoint: 'https://api.cadastre.gov.local/v3/parcels',
    protocol: 'RESTful + GeoJSON (OGC API Features Standard)',
    status: 'ONLINE',
    latencyMs: 14,
    lastSync: '2026-10-19T04:22:10Z',
    schemaVersion: 'v3.4.1-ISO-19152-LADM',
    tlsVersion: 'TLS 1.3 (RFC 8446)',
    mutualTlsEnabled: true,
    sampleRecord: {
      crs: 'EPSG:4326',
      accuracyToleranceMeters: 0.05,
      licensedSurveyorRef: 'SURV-LIC-771-DIALLO',
      boundaryMonuments: 8
    }
  },
  {
    serviceId: 'gov_revenue_tax',
    name: 'Municipal Revenue & Property Tax Database',
    agency: 'HM Revenue & Customs / Municipal Tax Assessor',
    endpoint: 'https://api.tax-assessment.gov.local/v2/clearance',
    protocol: 'gRPC over HTTP/2 with mTLS',
    status: 'ONLINE',
    latencyMs: 22,
    lastSync: '2026-10-19T04:25:30Z',
    schemaVersion: 'v2.8.0-OECD-CRS',
    tlsVersion: 'TLS 1.3 (RFC 8446)',
    mutualTlsEnabled: true,
    sampleRecord: {
      taxYear: 2026,
      rateAssessmentFormula: 'MillRate_x_Valuation',
      auditStatus: 'VERIFIED_CLEARED'
    }
  },
  {
    serviceId: 'gov_civil_kyc',
    name: 'National Identity & Civil Status Registry',
    agency: 'National Identity & Passport Verification Agency',
    endpoint: 'https://api.civil-id.gov.local/v1/verify',
    protocol: 'OpenID Connect Core 1.0 + eIDAS High Assurance',
    status: 'ONLINE',
    latencyMs: 31,
    lastSync: '2026-10-19T04:27:01Z',
    schemaVersion: 'eIDAS-2.0-QES',
    tlsVersion: 'TLS 1.3 (RFC 8446)',
    mutualTlsEnabled: true,
    sampleRecord: {
      assuranceLevel: 'SUBSTANTIAL_HIGH',
      sanctionsScreening: 'CLEARED_UN_EU_OFAC',
      biometricThumbprintMatched: true
    }
  },
  {
    serviceId: 'gov_judicial_court',
    name: 'Judicial Land Court & Encumbrance Register',
    agency: 'Ministry of Justice / Court of Protection & Probate',
    endpoint: 'https://api.landcourt-justice.gov.local/v2/caveats',
    protocol: 'RESTful + JSON:API Standard',
    status: 'ONLINE',
    latencyMs: 19,
    lastSync: '2026-10-19T04:26:45Z',
    schemaVersion: 'v2.1.9-LEX',
    tlsVersion: 'TLS 1.3 (RFC 8446)',
    mutualTlsEnabled: true,
    sampleRecord: {
      injunctionQueryScope: 'NATIONWIDE',
      activeJudgmentsChecked: 0,
      probateInsolvencyStatus: 'CLEAR'
    }
  }
];

export const INITIAL_GDPR_CONSENTS: GDPRConsentRecord[] = [
  {
    id: 'CONSENT-CADASTRE-TITLE',
    purpose: 'Maintenance of Public Cadastre & Legal Title of Ownership',
    legalBasis: 'GDPR_ART_6_1_C_LEGAL_OBLIGATION',
    dataTypes: ['Parcel Boundary', 'Pseudonymized Owner DID', 'Valuation Bracket', 'Deed Hash'],
    grantedAt: '2023-08-14T11:45:00Z',
    retentionPeriod: 'Statutory 70-Year Land Ownership Registry Requirement',
    canRevoke: false,
    status: 'ACTIVE'
  },
  {
    id: 'CONSENT-TAX-ASSESSMENT',
    purpose: 'Municipal Property Taxation & Real Estate Transfer Stamp Duty',
    legalBasis: 'GDPR_ART_6_1_C_LEGAL_OBLIGATION',
    dataTypes: ['Valuation USD', 'Tax Clearance ID', 'Payer Tax Identifier'],
    grantedAt: '2023-08-14T11:45:00Z',
    retentionPeriod: '7 Years Post-Assessment (Statute of Limitations)',
    canRevoke: false,
    status: 'ACTIVE'
  },
  {
    id: 'CONSENT-DIGITAL-NOTIFICATIONS',
    purpose: 'Automated SMS / Email Notifications on Title Activity & Liens',
    legalBasis: 'GDPR_ART_6_1_A_CONSENT',
    dataTypes: ['Email Address', 'Mobile Phone Number'],
    grantedAt: '2024-01-10T08:00:00Z',
    retentionPeriod: 'Until Citizen Revocation (Explicit Consent)',
    canRevoke: true,
    status: 'ACTIVE'
  },
  {
    id: 'CONSENT-CONVEYANCE-DISCLOSURE',
    purpose: 'Third-Party Conveyancing Solicitor & Bank Mortgage Due Diligence',
    legalBasis: 'GDPR_ART_6_1_A_CONSENT',
    dataTypes: ['Deed History', 'Lien Documents', 'Property Boundary Plat'],
    grantedAt: '2024-03-22T14:15:00Z',
    retentionPeriod: 'Transaction Lifecycle + 90 Days',
    canRevoke: true,
    status: 'ACTIVE'
  }
];
