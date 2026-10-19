/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Building, 
  Layers, 
  Scale,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { LandTitle, UserPersona } from '../types/fabric';
import { FabricLedgerService } from '../services/fabricLedger';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  titles: LandTitle[];
  activeUser: UserPersona;
  onSuccess: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  titles,
  activeUser,
  onSuccess
}) => {
  const [selectedTitleId, setSelectedTitleId] = useState<string>(
    titles.find(t => t.status === 'ACTIVE' || t.status === 'TRANSFER_PENDING')?.id || titles[0]?.id || ''
  );
  const [newOwnerName, setNewOwnerName] = useState('Alexander Vance');
  const [newOwnerDid, setNewOwnerDid] = useState('did:taka:citizen:alexander-vance-77');
  const [considerationUSD, setConsiderationUSD] = useState<number>(3400000);
  const [notaryNotes, setNotaryNotes] = useState('Purchase & Sale Agreement ratified under standard Law Society terms.');
  
  const [step, setStep] = useState<'FORM' | 'PRE_CHECK' | 'ENDORSE' | 'COMMITTED'>('FORM');
  const [preCheckResults, setPreCheckResults] = useState<{
    cadastre: boolean;
    tax: boolean;
    judicial: boolean;
  }>({ cadastre: false, tax: false, judicial: false });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [minedBlockNumber, setMinedBlockNumber] = useState<number | null>(null);

  if (!isOpen) return null;

  const selectedTitle = titles.find(t => t.id === selectedTitleId);

  const handleStartPreCheck = () => {
    if (!selectedTitle) return;
    setErrorMsg(null);

    if (selectedTitle.status === 'FROZEN_JUDICIAL') {
      setErrorMsg('Conveyance blocked: This property title is under a Judicial Court Injunction.');
      return;
    }

    setStep('PRE_CHECK');

    // Simulate multi-database government verification
    setTimeout(() => {
      setPreCheckResults(prev => ({ ...prev, cadastre: true }));
    }, 400);

    setTimeout(() => {
      setPreCheckResults(prev => ({ ...prev, tax: true }));
    }, 800);

    setTimeout(() => {
      setPreCheckResults(prev => ({ ...prev, judicial: true }));
    }, 1200);

    setTimeout(() => {
      setStep('ENDORSE');
      handleExecuteCommit();
    }, 1600);
  };

  const handleExecuteCommit = () => {
    try {
      const result = FabricLedgerService.executeTransfer({
        titleId: selectedTitleId,
        newOwnerName,
        newOwnerDid,
        considerationUSD,
        notaryMsp: activeUser.mspId === 'Org2MSP' ? 'Org2MSP' : 'Org2MSP',
        notaryName: activeUser.name,
        notes: notaryNotes,
        userRole: activeUser.role,
        userMsp: activeUser.mspId,
        userId: activeUser.id
      });

      setMinedBlockNumber(result.block.blockNumber);
      setStep('COMMITTED');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaction failed to commit.');
      setStep('FORM');
    }
  };

  const handleResetAndClose = () => {
    setStep('FORM');
    setErrorMsg(null);
    setMinedBlockNumber(null);
    setPreCheckResults({ cadastre: false, tax: false, judicial: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Conveyance & Title Transfer Proposal</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Chaincode Execution
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Initiate ownership conveyance with automated government cross-clearance
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'FORM' && (
            <div className="space-y-4">
              
              {/* Title Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  1. Select Land Title to Convey
                </label>
                <select
                  value={selectedTitleId}
                  onChange={(e) => {
                    setSelectedTitleId(e.target.value);
                    const sel = titles.find(t => t.id === e.target.value);
                    if (sel) setConsiderationUSD(sel.valuationUSD);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                >
                  {titles.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                      {t.id} &bull; {t.legalDescription.substring(0, 45)}... [Owner: {t.currentOwnerPseudonym}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedTitle && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Owner:</span>
                    <strong className="text-slate-200">{selectedTitle.currentOwnerPseudonym}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cadastral Zone & Area:</span>
                    <span className="font-mono text-slate-300">{selectedTitle.cadastralZone} &bull; {selectedTitle.areaSqm} m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Title Status:</span>
                    <span className={`font-semibold ${selectedTitle.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedTitle.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Transferee Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Transferee Full Legal Name:
                  </label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Alexander Vance"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Transferee DID (Decentralized ID):
                  </label>
                  <input
                    type="text"
                    value={newOwnerDid}
                    onChange={(e) => setNewOwnerDid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="did:taka:citizen:..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Consideration / Sale Price (USD):
                  </label>
                  <input
                    type="number"
                    value={considerationUSD}
                    onChange={(e) => setConsiderationUSD(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Submitting Endorser:
                  </label>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono">
                    {activeUser.name} ({activeUser.mspId})
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Conveyancer / Notary Attestation Notes:
                </label>
                <textarea
                  rows={2}
                  value={notaryNotes}
                  onChange={(e) => setNotaryNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={handleStartPreCheck}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                <span>Run Government Pre-Clearance & Endorse Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'PRE_CHECK' && (
            <div className="py-6 space-y-4 text-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-slate-100">
                Querying Local Government Gateway Databases...
              </h3>

              <div className="max-w-md mx-auto space-y-2 text-xs text-left">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Cadastral GIS Boundary Integrity Check</span>
                  </div>
                  {preCheckResults.cadastre ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-slate-500">Checking...</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>Municipal Property Tax Clearance Check</span>
                  </div>
                  {preCheckResults.tax ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-slate-500">Checking...</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <span>Judicial Land Court Injunction & Caveat Search</span>
                  </div>
                  {preCheckResults.judicial ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-slate-500">Checking...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'COMMITTED' && (
            <div className="py-6 space-y-4 text-center animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Conveyance Successfully Committed to Blockchain!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  New Block #{minedBlockNumber} was batched and ordered via Raft consensus. Title {selectedTitleId} is now transferred to <span className="text-emerald-400 font-bold">{newOwnerName}</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-xs font-mono text-left space-y-1">
                <div className="text-slate-400">Block Height: <span className="text-amber-400 font-bold">#{minedBlockNumber}</span></div>
                <div className="text-slate-400">Endorsements: <span className="text-emerald-400">Org1MSP, Org2MSP, Org4MSP</span></div>
                <div className="text-slate-400">WORM Audit Log: <span className="text-slate-200">Tamper-evident record appended</span></div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Close & View Updated Audit Trail
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
