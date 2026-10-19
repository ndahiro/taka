/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  UserCheck, 
  PlusCircle, 
  RefreshCw, 
  Lock, 
  Radio, 
  ChevronDown,
  Menu,
  X,
  FileCheck2,
  Database
} from 'lucide-react';
import { UserPersona, ChannelId } from '../types/fabric';

interface HeaderProps {
  activeUser: UserPersona;
  activeChannel: ChannelId;
  onChannelChange: (channel: ChannelId) => void;
  onOpenRoleSwitcher: () => void;
  onOpenNewTransaction: () => void;
  onResetLedger: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  blockHeight: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeUser,
  activeChannel,
  onChannelChange,
  onOpenRoleSwitcher,
  onOpenNewTransaction,
  onResetLedger,
  activeTab,
  onTabChange,
  blockHeight
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'public-audit', label: 'Public Audit Trail', icon: FileCheck2 },
    { id: 'cadastral-map', label: 'Cadastral GIS Map', icon: Layers },
    { id: 'fabric-ledger', label: 'Hyperledger Fabric', icon: Radio },
    { id: 'gov-integrations', label: 'Gov Integrations', icon: Database },
    { id: 'security-audit', label: 'WORM Logs & Security', icon: Lock },
    { id: 'gdpr-compliance', label: 'GDPR Compliance', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner with Taka Branding, Network Status & Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Network Identifier */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 shadow-md shadow-emerald-500/20 text-slate-950 font-black text-xl tracking-tighter">
              <span className="font-display font-bold">t</span>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  taka
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HLF v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Immutable Land Registry & Cadastre Platform
              </p>
            </div>
          </div>

          {/* Center: Channel Selector & Consensus Badge (desktop) */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Channel:</span>
            </div>
            <select
              value={activeChannel}
              onChange={(e) => onChannelChange(e.target.value as ChannelId)}
              className="bg-transparent text-xs font-mono font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="property-transfer-channel" className="bg-slate-900 text-slate-200">
                property-transfer-channel
              </option>
              <option value="cadastre-channel" className="bg-slate-900 text-slate-200">
                cadastre-channel
              </option>
              <option value="tax-compliance-channel" className="bg-slate-900 text-slate-200">
                tax-compliance-channel
              </option>
            </select>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Block #{blockHeight}</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              mTLS TLS 1.3
            </span>
          </div>

          {/* Right: Actions & User Persona Pill */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* New Transfer Button */}
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm shadow-emerald-700/30 active:scale-95 cursor-pointer"
              title="Initiate Conveyance / Title Transfer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Transfer</span>
            </button>

            {/* Active User Switcher Pill */}
            <button
              onClick={onOpenRoleSwitcher}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition text-left cursor-pointer group"
            >
              <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${activeUser.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                {activeUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold text-slate-200 leading-tight group-hover:text-amber-300 transition">
                    {activeUser.name}
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-amber-400 border border-amber-400/20">
                    {activeUser.mspId}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[130px]">{activeUser.title}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition" />
            </button>

            {/* Reset ledger button */}
            <button
              onClick={onResetLedger}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
              title="Reset Blockchain Ledger to Defaults"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="hidden md:block border-t border-slate-900 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
          <div className="pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            Active Channel: <span className="text-emerald-400">{activeChannel}</span> (Block #{blockHeight})
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
