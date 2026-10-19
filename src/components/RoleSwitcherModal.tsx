/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Lock,
  Building2,
  Clock
} from 'lucide-react';
import { UserPersona } from '../types/fabric';
import { USER_PERSONAS } from '../services/mockData';
import { FabricLedgerService } from '../services/fabricLedger';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: UserPersona;
  onSelectUser: (user: UserPersona) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  onSelectUser
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<UserPersona | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [currentOtpValue, setCurrentOtpValue] = useState('849201');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [authMethod, setAuthMethod] = useState<'TOTP' | 'PASSKEY'>('TOTP');

  // TOTP 30-second rolling token simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const sec = now.getSeconds();
      const rem = 30 - (sec % 30);
      setSecondsRemaining(rem);

      if (rem === 30 || rem === 1) {
        // Generate pseudo-deterministic 6-digit OTP
        const seed = Math.floor(Date.now() / 30000);
        const code = (Math.abs(Math.sin(seed) * 1000000) % 900000 + 100000).toFixed(0);
        setCurrentOtpValue(code);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleSelectCandidate = (persona: UserPersona) => {
    setSelectedCandidate(persona);
    setMfaError(null);
    setMfaSuccess(false);
    setTotpCode('');
  };

  const handleVerifyOtp = (codeToVerify?: string) => {
    const code = codeToVerify || totpCode;
    if (!selectedCandidate) return;

    if (code.trim() === currentOtpValue || code.trim() === '849201' || code.trim().length === 6) {
      setMfaSuccess(true);
      setMfaError(null);

      FabricLedgerService.appendWormLog(
        selectedCandidate.id,
        selectedCandidate.role,
        selectedCandidate.mspId,
        'MFA_VERIFICATION_SUCCESS',
        `auth/session/${selectedCandidate.did}`,
        `Authenticated ${selectedCandidate.name} via ${authMethod === 'TOTP' ? 'RFC 6238 TOTP' : 'FIDO2 / WebAuthn Passkey'}. Session granted level ${selectedCandidate.clearanceLevel}.`,
        'SECURITY'
      );

      setTimeout(() => {
        onSelectUser(selectedCandidate);
        setSelectedCandidate(null);
        setMfaSuccess(false);
        onClose();
      }, 700);
    } else {
      setMfaError('Invalid TOTP token. Please ensure your authenticator is synchronized.');
    }
  };

  const handlePasskeyAuth = () => {
    if (!selectedCandidate) return;
    setAuthMethod('PASSKEY');
    setMfaSuccess(true);
    setMfaError(null);

    FabricLedgerService.appendWormLog(
      selectedCandidate.id,
      selectedCandidate.role,
      selectedCandidate.mspId,
      'WEBAUTHN_PASSKEY_SUCCESS',
      `auth/passkey/${selectedCandidate.did}`,
      `FIDO2 cryptographic signature attested by secure hardware enclave. User ${selectedCandidate.name} verified.`,
      'SECURITY'
    );

    setTimeout(() => {
      onSelectUser(selectedCandidate);
      setSelectedCandidate(null);
      setMfaSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Identity & Role-Based Access Control (RBAC)</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  MSP Membership
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Switch organizational persona with simulated Multi-Factor Authentication (MFA)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active User Status Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${activeUser.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                {activeUser.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs text-slate-400">Currently Authenticated As:</div>
                <div className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                  <span>{activeUser.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Level {activeUser.clearanceLevel} Clearance
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-slate-400">MSP Org: <span className="text-amber-400">{activeUser.mspId}</span></div>
              <div className="text-[11px] font-mono text-slate-500">{activeUser.did}</div>
            </div>
          </div>

          {/* Persona Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Select Stakeholder Identity to Assume
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {USER_PERSONAS.map((persona) => {
                const isCurrent = activeUser.id === persona.id;
                const isSelectedForMfa = selectedCandidate?.id === persona.id;

                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectCandidate(persona)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition relative group ${
                      isSelectedForMfa
                        ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/20'
                        : isCurrent
                        ? 'bg-slate-900/90 border-emerald-500/50'
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${persona.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {persona.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                            <span>{persona.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{persona.title}</div>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {persona.mspId}
                      </span>
                    </div>

                    {/* Permissions list preview */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">
                        Authorized Smart Contract Actions:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {persona.allowedActions.slice(0, 3).map((act) => (
                          <span
                            key={act}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {act}
                          </span>
                        ))}
                        {persona.allowedActions.length > 3 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                            +{persona.allowedActions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MFA Verification Drawer if a candidate is chosen */}
          {selectedCandidate && (
            <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                  <span className="text-sm font-bold">MFA Challenge: Authenticate as {selectedCandidate.name}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Code expires in <span className="font-mono text-amber-400 font-semibold">{secondsRemaining}s</span></span>
                </div>
              </div>

              {mfaError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mfaError}</span>
                </div>
              )}

              {mfaSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>MFA challenge passed! Establishing encrypted mTLS session...</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                
                {/* Method 1: TOTP App */}
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Option A: Time-Based OTP (Authenticator)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Live rotating RFC 6238 token for secret <code className="text-amber-300 font-mono">{selectedCandidate.mfaSecret}</code>
                  </p>

                  <div className="flex items-center space-x-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 849201"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono tracking-widest text-white text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setTotpCode(currentOtpValue);
                        handleVerifyOtp(currentOtpValue);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono transition cursor-pointer"
                    >
                      Fill: {currentOtpValue}
                    </button>
                    <button
                      onClick={() => handleVerifyOtp()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Method 2: FIDO2 / Touch Passkey */}
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                      <span>Option B: FIDO2 / WebAuthn Passkey</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Hardware biometric enclave (YubiKey / Touch ID / Windows Hello)
                    </p>
                  </div>

                  <button
                    onClick={handlePasskeyAuth}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Touch Hardware Passkey to Authenticate</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Hyperledger Fabric Membership Service Provider (MSP) Security Policy v2.5</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
