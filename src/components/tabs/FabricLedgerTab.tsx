/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Radio, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Code2, 
  ArrowRight, 
  Box, 
  Database, 
  FileCode,
  Network,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { FabricBlock, FabricTransaction, ChannelId } from '../../types/fabric';

interface FabricLedgerTabProps {
  blocks: FabricBlock[];
  activeChannel: ChannelId;
  onChannelChange: (channel: ChannelId) => void;
}

export const FabricLedgerTab: React.FC<FabricLedgerTabProps> = ({
  blocks,
  activeChannel,
  onChannelChange
}) => {
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number>(blocks.length - 1);
  const [activeSubTab, setActiveSubTab] = useState<'BLOCKS' | 'ARCHITECTURE' | 'CHAINCODE'>('BLOCKS');

  const selectedBlock = blocks.find(b => b.blockNumber === selectedBlockNumber) || blocks[blocks.length - 1];

  const sampleChaincodeSource = `/**
 * taka LandRegistryContract_v2.4 (Hyperledger Fabric Smart Contract)
 * Package: taka.landregistry.chaincode
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { LandTitle, ConveyanceProposal } from './models';

@Info({ title: 'TakaLandRegistry', description: 'Enterprise Cadastral & Deeds Smart Contract' })
export class LandRegistryContract extends Contract {

  /**
   * Conveys land title deed to a new owner.
   * Endorsement Policy: AND('Org1MSP.peer', 'Org2MSP.peer', 'Org4MSP.peer')
   */
  @Transaction(true)
  public async ConveyTitleDeed(
    ctx: Context,
    titleId: string,
    newOwnerPseudonym: string,
    newOwnerDid: string,
    considerationUSD: number
  ): Promise<void> {
    const clientMsp = ctx.clientIdentity.getMSPID();
    
    // RBAC: Verify caller is an authorized conveyancer (Notary Org)
    if (clientMsp !== 'Org2MSP' && clientMsp !== 'Org1MSP') {
      throw new Error(\`Access Denied: Caller MSP \${clientMsp} unauthorized to convey deeds.\`);
    }

    const titleBytes = await ctx.stub.getState(titleId);
    if (!titleBytes || titleBytes.length === 0) {
      throw new Error(\`Title \${titleId} does not exist in World State DB.\`);
    }

    const title: LandTitle = JSON.parse(titleBytes.toString());

    // Judicial Check: Prevent transfer if title is under court injunction
    if (title.status === 'FROZEN_JUDICIAL') {
      throw new Error(\`Conveyance rejected: Title \${titleId} is frozen by Judicial Court order.\`);
    }

    // Update World State (CouchDB / LevelDB)
    title.currentOwnerPseudonym = newOwnerPseudonym;
    title.ownerDid = newOwnerDid;
    title.valuationUSD = considerationUSD;
    title.status = 'ACTIVE';

    await ctx.stub.putState(titleId, Buffer.from(JSON.stringify(title)));
    
    // Emit Blockchain Event for Cadastral subscribers
    ctx.stub.setEvent('TitleTransferred', Buffer.from(JSON.stringify({ titleId, newOwnerDid })));
  }
}`;

  return (
    <div className="space-y-6">
      
      {/* Tab Header with Channel Status & Architecture Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>Hyperledger Fabric Enterprise Framework</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Raft Consensus Active
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Permissioned distributed ledger architecture with private channels, pluggable endorsement policies, and CouchDB state database.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('BLOCKS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'BLOCKS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Ledger Blocks ({blocks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ARCHITECTURE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'ARCHITECTURE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Fabric Architecture
          </button>
          <button
            onClick={() => setActiveSubTab('CHAINCODE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'CHAINCODE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Chaincode (Contract)
          </button>
        </div>
      </div>

      {activeSubTab === 'BLOCKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Block Chain List (1 Col) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Block Sequence (Height: {blocks.length})</span>
              <span className="font-mono text-emerald-400">Immutable</span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {[...blocks].reverse().map((b) => {
                const isSelected = selectedBlock?.blockNumber === b.blockNumber;

                return (
                  <div
                    key={b.blockNumber}
                    onClick={() => setSelectedBlockNumber(b.blockNumber)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/20'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Box className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold font-mono text-slate-100">
                          Block #{b.blockNumber} {b.blockNumber === 0 ? '(Genesis)' : ''}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {b.transactions.length} Tx
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
                      Hash: {b.currentHash.substring(0, 24)}...
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(b.timestamp).toLocaleDateString()} {new Date(b.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Block Inspector (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-mono">
                    Block Header #{selectedBlock.blockNumber}
                  </h3>
                  <div className="text-xs text-slate-400">
                    Channel: <span className="text-emerald-400 font-mono">{selectedBlock.channelId}</span> &bull; Orderer: <span className="text-slate-300 font-mono">{selectedBlock.ordererMsp}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400">
                {new Date(selectedBlock.timestamp).toUTCString()}
              </span>
            </div>

            {/* Block Header Cryptographic Hashes */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-sans block text-[11px]">Current Block Header Hash (SHA-256):</span>
                <div className="text-amber-400 break-all select-all font-semibold">
                  {selectedBlock.currentHash}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 font-sans block text-[11px]">Previous Block Hash Pointer:</span>
                  <div className="text-slate-300 break-all select-all">
                    {selectedBlock.previousHash}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 font-sans block text-[11px]">Merkle Data Hash (Transactions Root):</span>
                  <div className="text-emerald-400 break-all select-all">
                    {selectedBlock.dataHash}
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions committed in this block */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Transactions in Block #{selectedBlock.blockNumber} ({selectedBlock.transactions.length})
              </h4>

              {selectedBlock.transactions.map((tx) => (
                <div key={tx.txId} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {tx.chaincode}::{tx.functionName}()
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Tx: {tx.txId}
                    </span>
                  </div>

                  {/* Arguments & RW Set */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-sans mb-1">Invocation Parameters</div>
                      <pre className="text-slate-200 overflow-x-auto text-[11px]">
                        {JSON.stringify(tx.args, null, 2)}
                      </pre>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-sans mb-1">World State WriteSet (CouchDB)</div>
                      <pre className="text-emerald-300 overflow-x-auto text-[11px]">
                        {JSON.stringify(tx.writeSet, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Endorsement Signatures */}
                  <div>
                    <div className="text-[10px] uppercase font-sans text-slate-400 mb-1.5">
                      Peer Endorsement Signatures:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tx.endorsements.map((sig, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{sig.mspId} &bull; {sig.endorserName.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'ARCHITECTURE' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="max-w-3xl">
            <h3 className="text-base font-bold text-slate-100">
              Hyperledger Fabric Enterprise Architecture Overview
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fabric separates transaction endorsement and execution from ordering and ledger state updates, delivering superior throughput, regulatory isolation, and deterministic finality (no mining or forks).
            </p>
          </div>

          {/* 4-Step Transaction Flow Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-200">Client Proposal</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Client (Citizen or Notary) sends conveyance proposal signed with their X.509 MSP certificate.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-200">Peer Endorsement</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Peer nodes execute chaincode in isolated Docker/Wasm container, generate Read-Write sets, and attach digital signatures.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-200">Ordering Service (Raft)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Leader orderer collects endorsed transactions, batches them into chronological blocks, and computes Merkle data root.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
                4
              </div>
              <h4 className="text-xs font-bold text-slate-200">Validation & Commit</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Committer peers validate endorsement policy and multi-version concurrency control (MVCC), then write to CouchDB state database.
              </p>
            </div>

          </div>

          {/* MSP Nodes & Channel Isolation Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Network Topology & Membership Service Providers (MSPs)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-mono font-bold text-amber-400">Org1MSP (Land Registry)</div>
                <div className="text-slate-400 text-[11px] mt-1">peer0.reg.taka.gov</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Policy: Super-Admin & Deed Issuer</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-mono font-bold text-blue-400">Org2MSP (Notary & Bar)</div>
                <div className="text-slate-400 text-[11px] mt-1">peer0.notary.taka.gov</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Policy: Conveyancer & Endorser</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-mono font-bold text-emerald-400">Org3MSP (Cadastral GIS)</div>
                <div className="text-slate-400 text-[11px] mt-1">peer0.survey.taka.gov</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Policy: Spatial Boundary Certifier</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-mono font-bold text-cyan-400">Org4MSP (Municipal Revenue)</div>
                <div className="text-slate-400 text-[11px] mt-1">peer0.tax.taka.gov</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Policy: Tax Clearance Validator</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'CHAINCODE' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  LandRegistryContract_v2.4.ts (Smart Contract)
                </h3>
                <p className="text-xs text-slate-400">
                  Fabric Contract API &bull; Endorsement Policy: AND('Org1MSP.peer', 'Org2MSP.peer')
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Production Bytecode
            </span>
          </div>

          <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed">
              <code>{sampleChaincodeSource}</code>
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
