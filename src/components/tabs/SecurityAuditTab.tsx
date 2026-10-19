/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Search, 
  Terminal, 
  Key, 
  Cpu, 
  ShieldAlert, 
  Fingerprint,
  Zap,
  ArrowRight
} from 'lucide-react';
import { WORMAuditLog } from '../../types/fabric';
import { verifyWormChain } from '../../services/cryptoEngine';
import { FabricLedgerService } from '../../services/fabricLedger';

interface SecurityAuditTabProps {
  logs: WORMAuditLog[];
  onRefreshLogs: () => void;
}

export const SecurityAuditTab: React.FC<SecurityAuditTabProps> = ({
  logs,
  onRefreshLogs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'WORM_LOGS' | 'ENCRYPTION' | 'API_SECURITY'>('WORM_LOGS');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditResult, setAuditResult] = useState<{
    isValid: boolean;
    brokenIndex?: number;
    expectedHash?: string;
    actualHash?: string;
    verifiedCount: number;
  } | null>(null);

  const handleRunVerification = () => {
    const result = verifyWormChain(logs);
    setAuditResult(result);
  };

  const handleSimulateTamper = () => {
    FabricLedgerService.tamperWormLogForDemo(1);
    onRefreshLogs();
    const result = verifyWormChain(FabricLedgerService.getWormLogs());
    setAuditResult(result);
  };

  const handleResetLogs = () => {
    FabricLedgerService.resetToDefault();
    onRefreshLogs();
    setAuditResult(null);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchesQuery = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesQuery;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'SECURITY':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'GDPR':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Immutable WORM Audit Trail & Security Protocols</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FIPS 140-3 Compliant
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Write-Once-Read-Many (WORM) cryptographically chained audit logging, AES-256-GCM envelope encryption at rest, and TLS 1.3 in transit.
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('WORM_LOGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'WORM_LOGS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            WORM Audit Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ENCRYPTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'ENCRYPTION'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Encryption at Rest
          </button>
          <button
            onClick={() => setActiveSubTab('API_SECURITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'API_SECURITY'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            API & Transport Security
          </button>
        </div>
      </div>

      {activeSubTab === 'WORM_LOGS' && (
        <div className="space-y-4">
          
          {/* Integrity Audit Banner & Controls */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <span>Cryptographic Chain-of-Custody Verifier</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    H(i) = SHA256(Record_i || H(i-1))
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify that no log entry has been deleted, reordered, or modified since original write.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunVerification}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Run Integrity Verification</span>
                </button>

                <button
                  onClick={handleSimulateTamper}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition cursor-pointer"
                  title="Tamper with Log #1 to test forensic detection"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulate Tamper Attack</span>
                </button>

                <button
                  onClick={handleResetLogs}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Reset Log State"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audit Result Display */}
            {auditResult && (
              <div className={`p-4 rounded-xl border text-xs flex items-start space-x-3 ${
                auditResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}>
                {auditResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {auditResult.isValid
                      ? `Cryptographic Audit Successful: All ${auditResult.verifiedCount} WORM log entries intact!`
                      : `Forensic Alert: Tampering Detected at Log Index #${auditResult.brokenIndex}!`}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {auditResult.isValid
                      ? 'Every record hash matches its payload and successfully links to the preceding entry. Zero unauthorized mutations detected.'
                      : `The cryptographic hash of entry #${auditResult.brokenIndex} does not match its computed SHA-256 value. The chain has been broken, indicating unauthorized modification or record deletion.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Filters & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actor, action, or resource..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
              >
                <option value="ALL">All Severities</option>
                <option value="SECURITY">Security</option>
                <option value="GDPR">GDPR Privacy</option>
                <option value="CRITICAL">Critical</option>
                <option value="INFO">Info</option>
              </select>

              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `taka_worm_audit_log_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export WORM JSON</span>
              </button>
            </div>
          </div>

          {/* WORM Audit Log Table */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase font-sans">
                  <th className="pb-3 pl-2">Idx</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Actor / MSP</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Resource Target</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3 pr-2">Chained Hash (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const isTamperedRow = log.isTampered;

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isTamperedRow ? 'bg-rose-500/10 text-rose-200' : ''
                      }`}
                    >
                      <td className="py-3 pl-2 text-slate-400 font-bold">
                        #{log.index}
                      </td>
                      <td className="py-3 text-slate-300 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 text-slate-200 whitespace-nowrap">
                        <span className="font-semibold text-amber-400">{log.actorMsp}</span>
                        <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                      </td>
                      <td className="py-3 font-bold text-slate-100">
                        {log.action}
                      </td>
                      <td className="py-3 text-slate-400 max-w-[180px] truncate" title={log.resource}>
                        {log.resource}
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-slate-400 text-[10px] max-w-[140px] truncate" title={log.hash}>
                        {log.hash}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeSubTab === 'ENCRYPTION' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Data Encryption at Rest: Dual-Layer Envelope Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              To guarantee GDPR compliance and financial auditing standards, sensitive Personally Identifiable Information (PII) is stored in an off-chain encrypted vault, while only zero-knowledge hashes are published to the immutable blockchain.
            </p>
          </div>

          {/* Visual Envelope Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
                <Key className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">1. Cloud KMS Master Key</h4>
              <p className="text-[11px] text-slate-400">
                Hardware Security Module (HSM) FIPS 140-3 Level 3 managed master key. Controls key wrapping and access policies.
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                kms-arn-eu-west1-taka-key-089
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit border border-blue-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">2. Ephemeral DEK (AES-256)</h4>
              <p className="text-[11px] text-slate-400">
                A unique Data Encryption Key (DEK) is generated per citizen vault using AES-256-GCM with 96-bit random initialization vectors (IV).
              </p>
              <div className="text-[10px] font-mono text-emerald-400 pt-1">
                Authenticated AEAD Tag Attached
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 w-fit border border-purple-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">3. Cryptographic Shredding</h4>
              <p className="text-[11px] text-slate-400">
                When GDPR Right to Erasure is exercised, the DEK is cryptographically zeroized, rendering the ciphertext irreversibly unreadable forever.
              </p>
              <div className="text-[10px] font-mono text-purple-400 pt-1">
                GDPR Article 17 Compliant
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'API_SECURITY' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              API Security & Data in Transit Protocols
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Multi-layered defense protecting real-time conveyancing endpoints against replay attacks, unauthorized scraping, and eavesdropping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Transport Layer Security (TLS 1.3)</span>
              </h4>
              <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                <div>Cipher Suite: <span className="text-emerald-400">TLS_AES_256_GCM_SHA384</span></div>
                <div>Key Exchange: <span className="text-slate-300">ECDHE-X25519 (Forward Secrecy)</span></div>
                <div>Peer Auth: <span className="text-slate-300">Mutual TLS (mTLS) X.509</span></div>
                <div>HSTS: <span className="text-slate-300">max-age=63072000; includeSubDomains; preload</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>Replay Attack Prevention & Rate Limiting</span>
              </h4>
              <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                <div>Nonce Validation: <span className="text-emerald-400">128-bit Cryptographic Nonce per Request</span></div>
                <div>Timestamp Window: <span className="text-slate-300">&le; 30 seconds drift tolerance</span></div>
                <div>Token Bucket: <span className="text-slate-300">100 requests / minute per client DID</span></div>
                <div>HMAC Signature: <span className="text-slate-300">X-Taka-Signature: HMAC-SHA256</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
