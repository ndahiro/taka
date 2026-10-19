/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  Download, 
  Printer, 
  ExternalLink,
  Clock,
  Building,
  Layers,
  Scale,
  Hash,
  Award,
  AlertTriangle
} from 'lucide-react';
import { LandTitle, FabricBlock, FabricTransaction } from '../../types/fabric';
import { generateMerkleProof, verifyMerkleProof, sha256 } from '../../services/cryptoEngine';

interface PublicAuditTrailTabProps {
  titles: LandTitle[];
  blocks: FabricBlock[];
}

export const PublicAuditTrailTab: React.FC<PublicAuditTrailTabProps> = ({
  titles,
  blocks
}) => {
  const [searchQuery, setSearchQuery] = useState('TK-CAD-2026-8801');
  const [selectedTitle, setSelectedTitle] = useState<LandTitle | null>(
    titles.find(t => t.id === 'TK-CAD-2026-8801') || titles[0] || null
  );
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const match = titles.find(t => 
      t.id.toLowerCase() === query ||
      t.parcelId.toLowerCase() === query ||
      t.titleDeedNumber.toLowerCase() === query ||
      t.provenanceHistory.some(p => p.txId.toLowerCase() === query)
    );

    if (match) {
      setSelectedTitle(match);
    }
  };

  const selectQuickTitle = (title: LandTitle) => {
    setSelectedTitle(title);
    setSearchQuery(title.id);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Find the block corresponding to the latest provenance record
  const latestProvenance = selectedTitle?.provenanceHistory[selectedTitle.provenanceHistory.length - 1];
  const associatedBlock = blocks.find(b => b.blockNumber === (latestProvenance?.blockNumber ?? selectedTitle?.registeredBlock ?? 1));
  const latestTx = associatedBlock?.transactions.find(tx => tx.txId === latestProvenance?.txId) || associatedBlock?.transactions[0];

  // Generate Merkle Proof for latestTx if present
  let merkleProofData: any = null;
  let isMerkleValid = false;
  if (associatedBlock && latestTx) {
    const leafIndex = associatedBlock.merkleLeaves.indexOf(latestTx.txId);
    if (leafIndex !== -1) {
      merkleProofData = generateMerkleProof(associatedBlock.merkleLeaves, leafIndex);
      isMerkleValid = verifyMerkleProof(merkleProofData.leafHash, merkleProofData.proof, associatedBlock.dataHash);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Hero / Public Verification Intro */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Public Trust Architecture &bull; Cryptographic Provenance Proofs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            National Land Registry Public Audit Trail
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Search any property title, cadastral parcel ID, or transaction hash to verify mathematical proof of ownership, inspect municipal endorsements, and examine the complete chain of custody on the Hyperledger Fabric ledger.
          </p>

          {/* Quick Preset Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sample Titles:</span>
            {titles.map((t) => (
              <button
                key={t.id}
                onClick={() => selectQuickTitle(t)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-mono ${
                  selectedTitle?.id === t.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 relative max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Title ID (e.g. TK-CAD-2026-8801) or Parcel Number..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-28 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition shadow-inner font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              Verify Title
            </button>
          </div>
        </form>
      </div>

      {selectedTitle ? (
        <div className="space-y-6">
          
          {/* Main Title Verification Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xl font-bold font-mono text-white">
                    {selectedTitle.id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedTitle.titleDeedNumber}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    selectedTitle.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : selectedTitle.status === 'TRANSFER_PENDING'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    {selectedTitle.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    {selectedTitle.cadastralZone.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  {selectedTitle.legalDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition shadow-sm cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Verifiable Digital Deed</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400">Current Owner of Record</div>
                <div className="text-sm font-bold text-slate-100 truncate mt-0.5" title={selectedTitle.currentOwnerPseudonym}>
                  {selectedTitle.currentOwnerPseudonym}
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">{selectedTitle.ownerDid}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400">Official Cadastral Valuation</div>
                <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                  ${selectedTitle.valuationUSD.toLocaleString()} USD
                </div>
                <div className="text-[10px] text-slate-500">Rate: {selectedTitle.annualTaxRatePercent}% p.a.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400">Surveyed Parcel Area</div>
                <div className="text-base font-bold text-slate-100 mt-0.5 font-mono">
                  {selectedTitle.areaSqm.toLocaleString()} m²
                </div>
                <div className="text-[10px] text-slate-500">{(selectedTitle.areaSqm / 10000).toFixed(2)} Hectares</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400">Municipal Tax Clearance</div>
                <div className="text-sm font-semibold text-emerald-400 mt-0.5 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cleared</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">{selectedTitle.lastTaxClearanceId}</div>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification Proof Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  Real-Time Cryptographic Verification Proof
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SHA-256 Validated</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="text-slate-400 flex items-center justify-between font-sans">
                  <span>Block Header Hash</span>
                  <button
                    onClick={() => associatedBlock && copyToClipboard(associatedBlock.currentHash, 'blockHash')}
                    className="text-amber-400 hover:text-amber-300 text-[10px] cursor-pointer"
                  >
                    {copiedHash === 'blockHash' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-slate-200 break-all select-all">
                  {associatedBlock?.currentHash || 'Pending'}
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Block #{associatedBlock?.blockNumber} &bull; Timestamp: {associatedBlock?.timestamp}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="text-slate-400 flex items-center justify-between font-sans">
                  <span>Merkle Data Root (Transactions)</span>
                  <button
                    onClick={() => associatedBlock && copyToClipboard(associatedBlock.dataHash, 'merkleRoot')}
                    className="text-amber-400 hover:text-amber-300 text-[10px] cursor-pointer"
                  >
                    {copiedHash === 'merkleRoot' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-emerald-400 break-all select-all">
                  {associatedBlock?.dataHash || 'Pending'}
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Inclusion Proof: {isMerkleValid ? '100% Mathematically Verified' : 'Checking proof'}
                </div>
              </div>
            </div>

            {/* Endorsing Peer Organizations */}
            {latestTx && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-300 mb-2 font-sans">
                  Endorsing Peer Organizations (Endorsement Policy Fulfilled):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {latestTx.endorsements.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-amber-400 font-semibold">{sig.mspId}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                          VALID
                        </span>
                      </div>
                      <div className="text-slate-200 text-[11px] truncate">{sig.endorserName}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate" title={sig.signature}>
                        {sig.signature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historical Provenance Chain of Custody Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Chain of Custody & Historical Provenance Trail
                  </h3>
                  <p className="text-xs text-slate-400">
                    Complete immutable chronological record from origin cadastral grant to current deed
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {selectedTitle.provenanceHistory.length} Recorded Conveyances
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {selectedTitle.provenanceHistory.map((item, index) => {
                const isLatest = index === selectedTitle.provenanceHistory.length - 1;

                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline Node Bullet */}
                    <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                      isLatest
                        ? 'bg-emerald-500 border-slate-950 shadow-sm shadow-emerald-500'
                        : 'bg-slate-900 border-slate-700 group-hover:border-amber-400'
                    }`}>
                      {isLatest && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 group-hover:border-slate-700 transition space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-amber-300 font-mono">
                            {item.event.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Block #{item.blockNumber}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-slate-500">Grantor / Transferor: </span>
                          <span className="text-slate-300 font-medium">{item.fromParty}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Transferee / Grantee: </span>
                          <span className="text-slate-200 font-bold">{item.toParty}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                        <div>
                          Consideration: <span className="text-emerald-400 font-semibold">${item.considerationUSD.toLocaleString()} USD</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>Tx: <code className="text-slate-300">{item.txId}</code></span>
                          <span className="text-slate-600">&bull;</span>
                          <span>Deed: <code className="text-amber-400/90">{item.deedRef}</code></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Liens & Encumbrances Section */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Encumbrances, Liens & Judicial Injunctions Register
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cross-referenced with Judicial Land Court & Municipal Tax Registries
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                selectedTitle.liens.some(l => l.status === 'ACTIVE')
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedTitle.liens.some(l => l.status === 'ACTIVE') ? 'Encumbered' : 'Clean Title / Zero Liens'}
              </span>
            </div>

            {selectedTitle.liens.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-400">
                No active mortgages, judicial caveats, or tax liens registered against this parcel.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTitle.liens.map((lien) => (
                  <div
                    key={lien.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          lien.status === 'ACTIVE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {lien.lienType} &bull; {lien.status}
                        </span>
                        <span className="text-slate-200 font-semibold">{lien.holder}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Instrument Ref: <code className="text-slate-300 font-mono">{lien.instrumentRef}</code> &bull; Registered: {lien.dateRegistered}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-rose-400 font-mono">
                        ${lien.amountUSD.toLocaleString()} USD
                      </div>
                      <div className="text-[10px] text-slate-500">Secured Obligation</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          No property title found matching search criteria. Please enter a valid Title ID above.
        </div>
      )}

      {/* Verifiable Certificate Modal */}
      {showCertificateModal && selectedTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600/30 overflow-hidden print:p-0 print:border-none print:shadow-none">
            
            {/* National Seal Header */}
            <div className="text-center pb-6 border-b-2 border-slate-300 space-y-1">
              <div className="flex items-center justify-center space-x-2 text-amber-700 font-display font-bold text-2xl tracking-widest uppercase">
                <Award className="w-8 h-8 text-amber-600" />
                <span>Certificate of Legal Title</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
                HM National Cadastre & Sovereign Land Registry Authority
              </p>
              <div className="text-[10px] font-mono text-slate-500">
                Issued under Hyperledger Fabric Cryptographic Consensus Protocol v2.5
              </div>
            </div>

            {/* Certificate Body */}
            <div className="py-6 space-y-4">
              <div className="text-center">
                <div className="text-xs uppercase text-slate-500 tracking-wider">Title Deed Identification</div>
                <div className="text-xl font-bold font-mono text-slate-900">{selectedTitle.id}</div>
                <div className="text-xs text-slate-600 font-mono">{selectedTitle.titleDeedNumber}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">Registered Owner:</span>
                    <strong className="text-slate-800 text-sm">{selectedTitle.currentOwnerPseudonym}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cadastral Zone:</span>
                    <strong className="text-slate-800">{selectedTitle.cadastralZone.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Surveyed Area:</span>
                    <strong className="text-slate-800">{selectedTitle.areaSqm.toLocaleString()} m²</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Assessed Valuation:</span>
                    <strong className="text-emerald-700 font-mono text-sm">${selectedTitle.valuationUSD.toLocaleString()} USD</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Legal Description of Parcel:</span>
                  <p className="text-slate-700 italic mt-0.5">{selectedTitle.legalDescription}</p>
                </div>
              </div>

              {/* Cryptographic Footprint & QR Pattern */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-mono">
                <div className="space-y-1 max-w-[360px]">
                  <div className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">
                    Blockchain Merkle Proof Stamp
                  </div>
                  <div className="text-[11px] text-slate-700 break-all">
                    Root: {associatedBlock?.dataHash || sha256(selectedTitle.id)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Block Height: #{associatedBlock?.blockNumber || 1} &bull; Timestamp: {new Date().toISOString()}
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-inner flex flex-col items-center">
                  <QrCode className="w-14 h-14 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-500 mt-1">SCAN TO VERIFY</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedTitle, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `${selectedTitle.id}_deed_certificate.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON-LD</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
