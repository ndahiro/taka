/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { PublicAuditTrailTab } from './components/tabs/PublicAuditTrailTab';
import { CadastralExplorerTab } from './components/tabs/CadastralExplorerTab';
import { FabricLedgerTab } from './components/tabs/FabricLedgerTab';
import { GovIntegrationsTab } from './components/tabs/GovIntegrationsTab';
import { SecurityAuditTab } from './components/tabs/SecurityAuditTab';
import { GdprComplianceTab } from './components/tabs/GdprComplianceTab';
import { 
  UserPersona, 
  ChannelId, 
  LandTitle, 
  FabricBlock, 
  WORMAuditLog, 
  OffChainPiiRecord, 
  GDPRConsentRecord 
} from './types/fabric';
import { USER_PERSONAS } from './services/mockData';
import { FabricLedgerService } from './services/fabricLedger';
import { ShieldCheck, Lock, Radio, Server, Award } from 'lucide-react';

export default function App() {
  const [activeUserId, setActiveUserId] = useState<string>(FabricLedgerService.getActiveUserId());
  const [activeChannel, setActiveChannel] = useState<ChannelId>('property-transfer-channel');
  const [activeTab, setActiveTab] = useState<string>('public-audit');

  // Ledger State
  const [titles, setTitles] = useState<LandTitle[]>(FabricLedgerService.getTitles());
  const [blocks, setBlocks] = useState<FabricBlock[]>(FabricLedgerService.getBlocks());
  const [wormLogs, setWormLogs] = useState<WORMAuditLog[]>(FabricLedgerService.getWormLogs());
  const [piiVault, setPiiVault] = useState<Record<string, OffChainPiiRecord>>(FabricLedgerService.getPiiVault());
  const [gdprConsents, setGdprConsents] = useState<GDPRConsentRecord[]>(FabricLedgerService.getGdprConsents());

  // Modals
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // Active User object
  const activeUser = USER_PERSONAS.find(u => u.id === activeUserId) || USER_PERSONAS[0];

  const refreshAllState = () => {
    setTitles(FabricLedgerService.getTitles());
    setBlocks(FabricLedgerService.getBlocks());
    setWormLogs(FabricLedgerService.getWormLogs());
    setPiiVault(FabricLedgerService.getPiiVault());
    setGdprConsents(FabricLedgerService.getGdprConsents());
  };

  const handleSelectUser = (user: UserPersona) => {
    setActiveUserId(user.id);
    FabricLedgerService.setActiveUserId(user.id);
  };

  const handleResetLedger = () => {
    if (window.confirm('Reset all blockchain blocks, titles, and WORM logs to default demonstration state?')) {
      FabricLedgerService.resetToDefault();
      refreshAllState();
    }
  };

  const handleSelectTitleForAudit = (titleId: string) => {
    setActiveTab('public-audit');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Header */}
      <Header
        activeUser={activeUser}
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
        onResetLedger={handleResetLedger}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        blockHeight={blocks.length}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'public-audit' && (
          <PublicAuditTrailTab titles={titles} blocks={blocks} />
        )}

        {activeTab === 'cadastral-map' && (
          <CadastralExplorerTab 
            titles={titles} 
            onSelectTitleForAudit={handleSelectTitleForAudit} 
          />
        )}

        {activeTab === 'fabric-ledger' && (
          <FabricLedgerTab 
            blocks={blocks} 
            activeChannel={activeChannel} 
            onChannelChange={setActiveChannel} 
          />
        )}

        {activeTab === 'gov-integrations' && (
          <GovIntegrationsTab />
        )}

        {activeTab === 'security-audit' && (
          <SecurityAuditTab 
            logs={wormLogs} 
            onRefreshLogs={refreshAllState} 
          />
        )}

        {activeTab === 'gdpr-compliance' && (
          <GdprComplianceTab 
            piiVault={piiVault} 
            consents={gdprConsents} 
            activeUser={activeUser} 
            onRefreshData={refreshAllState} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              t
            </div>
            <span className="font-bold text-slate-300">taka</span>
            <span className="text-slate-600">&bull;</span>
            <span>Enterprise Land Registry & Cadastre Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>GDPR Art. 17 & 20 Compliant</span>
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>WORM Immutable Audit Storage</span>
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="flex items-center space-x-1">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Hyperledger Fabric v2.5 Consensus</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Role Switcher & MFA Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        activeUser={activeUser}
        onSelectUser={handleSelectUser}
      />

      {/* New Conveyance Transaction Modal */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        titles={titles}
        activeUser={activeUser}
        onSuccess={refreshAllState}
      />

    </div>
  );
}
