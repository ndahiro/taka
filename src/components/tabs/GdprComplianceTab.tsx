/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Key, 
  Layers, 
  HelpCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { OffChainPiiRecord, GDPRConsentRecord, UserPersona } from '../../types/fabric';
import { FabricLedgerService } from '../../services/fabricLedger';

interface GdprComplianceTabProps {
  piiVault: Record<string, OffChainPiiRecord>;
  consents: GDPRConsentRecord[];
  activeUser: UserPersona;
  onRefreshData: () => void;
}

export const GdprComplianceTab: React.FC<GdprComplianceTabProps> = ({
  piiVault,
  consents,
  activeUser,
  onRefreshData
}) => {
  const [selectedVaultKey, setSelectedVaultKey] = useState<string>('vault_sophia_chen');
  const [shreddingCertificate, setShreddingCertificate] = useState<string | null>(null);
  const [isShredding, setIsShredding] = useState(false);

  const selectedRecord = piiVault[selectedVaultKey] || Object.values(piiVault)[0];

  const handleExecuteShredding = () => {
    if (!selectedRecord) return;
    setIsShredding(true);

    setTimeout(() => {
      const result = FabricLedgerService.executeGdprErasure(
        selectedRecord.vaultId,
        selectedRecord.ownerDid,
        activeUser.id
      );
      setShreddingCertificate(result.certificateId);
      setIsShredding(false);
      onRefreshData();
    }, 700);
  };

  const handleExportDsarBundle = () => {
    const dsarPayload = {
      complianceStandard: 'EU General Data Protection Regulation (Regulation 2016/679)',
      subjectDid: selectedRecord.ownerDid,
      exportTimestamp: new Date().toISOString(),
      rightExercised: 'Article 20 (Right to Data Portability) & Article 15 (Right of Access)',
      vaultRecord: selectedRecord,
      activeConsents: consents
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dsarPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taka_gdpr_dsar_export_${selectedRecord.vaultId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>GDPR Regulatory Compliance & Privacy Vault</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                EU Regulation 2016/679
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dual-layer architecture: On-chain zero-knowledge pseudonymization + Off-chain encrypted PII with Article 17 "Cryptographic Shredding".
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportDsarBundle}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export DSAR Bundle (Art. 20)</span>
          </button>
        </div>
      </div>

      {/* Vault Record Selection & Shredding Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Vault Selector (1 Col) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Encrypted PII Vaults</span>
            <span className="font-mono text-purple-400">Off-Chain KMS</span>
          </div>

          <div className="space-y-2">
            {Object.entries(piiVault).map(([key, record]) => {
              const isSelected = selectedVaultKey === key;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedVaultKey(key)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500 ring-2 ring-purple-500/20'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 truncate max-w-[170px]">
                      {record.fullName}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      record.isShredded
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {record.isShredded ? 'SHREDDED' : 'ENCRYPTED'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate mt-1">
                    {record.ownerDid}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Record Details & Erasure Action (2 Cols) */}
        {selectedRecord && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Vault ID: <code className="text-amber-400 font-mono">{selectedRecord.vaultId}</code></div>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  {selectedRecord.fullName}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {selectedRecord.encryptionAlgorithm}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  selectedRecord.isShredded
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {selectedRecord.isShredded ? 'Key Destroyed (Erased)' : 'Active Key'}
                </span>
              </div>
            </div>

            {/* PII Attributes Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans text-[11px]">National Identity / Passport:</span>
                <div className="text-slate-200">{selectedRecord.nationalIdNumber}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans text-[11px]">Tax Identification Number:</span>
                <div className="text-slate-200">{selectedRecord.taxPayerNumber}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans text-[11px]">Direct Contact Email:</span>
                <div className="text-slate-200 truncate">{selectedRecord.email}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans text-[11px]">Direct Contact Phone:</span>
                <div className="text-slate-200">{selectedRecord.phoneNumber}</div>
              </div>

              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans text-[11px]">Official Residential Address:</span>
                <div className="text-slate-200">{selectedRecord.registeredAddress}</div>
              </div>
            </div>

            {/* Shredding Confirmation Badge if already erased */}
            {selectedRecord.isShredded && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start space-x-3">
                <Award className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">GDPR Article 17 Erasure Certificate Active</div>
                  <p className="text-[11px] leading-relaxed">
                    Certificate ID: <code className="text-rose-300 font-mono font-bold">{selectedRecord.erasureCertificateId}</code> &bull; Shredded on {selectedRecord.erasureDate}.
                    The AES-256 KMS key has been purged from the hardware security enclave. Blockchain transactions remain verifiable without personal exposure.
                  </p>
                </div>
              </div>
            )}

            {/* Action: Execute Cryptographic Shredding */}
            {!selectedRecord.isShredded && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Exercise Article 17: Right to Erasure
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Irreversible Key Destruction</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically zeroizes the off-chain decryption key for this citizen. Personal data is permanently shredded while on-chain land title transfers maintain mathematical validity.
                </p>

                <button
                  onClick={handleExecuteShredding}
                  disabled={isShredding}
                  className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isShredding ? 'Zeroizing KMS Encryption Key...' : 'Execute Cryptographic Shredding'}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Consent Register (Article 7 & 13) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100">
            GDPR Article 7 &bull; Lawful Basis & Consent Management Register
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear separation between non-revocable statutory legal obligations (Article 6(1)(c)) and revocable explicit consent (Article 6(1)(a)).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {consents.map((consent) => (
            <div
              key={consent.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{consent.purpose}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  {consent.status}
                </span>
              </div>

              <div className="text-[11px] font-mono text-amber-400">
                Basis: {consent.legalBasis}
              </div>

              <div className="text-[11px] text-slate-400">
                Retention: <span className="text-slate-300 font-medium">{consent.retentionPeriod}</span>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {consent.dataTypes.map((dt) => (
                  <span
                    key={dt}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                  >
                    {dt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
