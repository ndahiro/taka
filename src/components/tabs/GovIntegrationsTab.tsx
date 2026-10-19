/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  Lock, 
  ExternalLink, 
  Layers, 
  Building, 
  Scale, 
  UserCheck,
  ShieldCheck,
  Server
} from 'lucide-react';
import { GovernmentIntegrationStatus } from '../../types/fabric';
import { GOVERNMENT_INTEGRATIONS } from '../../services/mockData';
import { sha256 } from '../../services/cryptoEngine';

export const GovIntegrationsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<GovernmentIntegrationStatus[]>(GOVERNMENT_INTEGRATIONS);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(integrations[0].serviceId);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryInput, setQueryInput] = useState('TK-CAD-2026-8801');
  const [queryResponse, setQueryResponse] = useState<any>(null);

  const selectedService = integrations.find(s => s.serviceId === selectedServiceId) || integrations[0];

  const handleTestQuery = () => {
    setIsQuerying(true);
    setQueryResponse(null);

    setTimeout(() => {
      let mockResult: any = {};
      const now = new Date().toISOString();

      if (selectedService.serviceId === 'gov_gis_cadastre') {
        mockResult = {
          agency: 'HM Land Registry & Ordnance Survey',
          parcelId: queryInput,
          spatialReference: 'EPSG:4326',
          boundaryStatus: 'GEO_RECTIFIED_ACCURATE',
          surveyDate: '2026-09-15',
          surveyorId: 'SURV-LIC-771-DIALLO',
          areaSquareMeters: 4250.8,
          boundaryIntegrityHash: sha256(`GIS_${queryInput}_4250`),
          mtlsClientCert: 'CN=peer0.survey.taka.gov,OU=CadastralUnit,O=TakaGov'
        };
      } else if (selectedService.serviceId === 'gov_revenue_tax') {
        mockResult = {
          agency: 'Municipal Tax Assessor & HM Revenue',
          propertyRef: queryInput,
          taxAssessmentYear: 2026,
          annualRateAmountUSD: 230000,
          arrearsBalanceUSD: 0.00,
          clearanceStatus: 'CLEARED_COMPLIANT',
          taxClearanceCertificate: `TCC-2026-${sha256(queryInput).substring(0, 8).toUpperCase()}`,
          authorizedAssessor: 'Vikram Patel (Org4MSP)'
        };
      } else if (selectedService.serviceId === 'gov_civil_kyc') {
        mockResult = {
          agency: 'National Identity & Civil Status Registry',
          querySubject: queryInput,
          eidasAssuranceLevel: 'HIGH_ASSURANCE_QES',
          identityStatus: 'AUTHENTICATED_AND_VERIFIED',
          sanctionsListMatch: 'NONE_CLEARED_OFAC_EU',
          biometricMatchConfidence: 99.84,
          kycVerificationToken: `KYC-DID-${sha256(queryInput).substring(0, 10).toUpperCase()}`
        };
      } else {
        mockResult = {
          agency: 'Judicial Land Court & Encumbrance Register',
          parcelSubject: queryInput,
          activeInjunctionsCount: 0,
          probateDisputesCount: 0,
          bankruptcyLiensCount: 0,
          courtClearanceCertificate: `LEX-CLEAR-2026-${sha256(queryInput).substring(0, 8).toUpperCase()}`,
          registryStamp: now
        };
      }

      setQueryResponse({
        timestamp: now,
        status: 200,
        latencyMs: Math.floor(Math.random() * 20) + 12,
        protocol: selectedService.protocol,
        cipherSuite: 'TLS_AES_256_GCM_SHA384 (X25519)',
        body: mockResult
      });
      setIsQuerying(false);
    }, 600);
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'gov_gis_cadastre':
        return Layers;
      case 'gov_revenue_tax':
        return Building;
      case 'gov_civil_kyc':
        return UserCheck;
      default:
        return Scale;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Local Government Database Gateways
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seamless interoperability with Municipal Tax, Cadastral GIS, National Civil ID, and Judicial Court registers via secure Mutual TLS (mTLS) APIs.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>4/4 Services Online</span>
          </span>
        </div>
      </div>

      {/* 4 Agency Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((svc) => {
          const Icon = getServiceIcon(svc.serviceId);
          const isSelected = selectedServiceId === svc.serviceId;

          return (
            <div
              key={svc.serviceId}
              onClick={() => {
                setSelectedServiceId(svc.serviceId);
                setQueryResponse(null);
              }}
              className={`p-4 rounded-xl border text-left cursor-pointer transition relative ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {svc.status}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-100 mt-3 line-clamp-1">
                {svc.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {svc.agency}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Latency: {svc.latencyMs}ms</span>
                <span className="text-slate-400">TLS 1.3 mTLS</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Gateway Query Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Endpoint Spec & Trigger (1 Col) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">
              API Client & Query Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="text-amber-400 font-semibold">{selectedService.name}</span>
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Endpoint URL</div>
              <div className="text-emerald-400 break-all">{selectedService.endpoint}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Security Standard</div>
              <div className="text-slate-200">{selectedService.protocol}</div>
              <div className="text-[10px] text-blue-400">Mutual TLS (mTLS) Client Certificate Required</div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">
                Lookup Key (Title ID, Parcel ID, or National ID):
              </label>
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="e.g. TK-CAD-2026-8801"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={handleTestQuery}
              disabled={isQuerying}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              {isQuerying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Negotiating mTLS Handshake...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Real-Time API Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Response Inspector (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Live Gateway Response Inspector</span>
            </div>
            {queryResponse && (
              <span className="font-mono text-emerald-400">
                HTTP {queryResponse.status} OK &bull; {queryResponse.latencyMs}ms
              </span>
            )}
          </div>

          {queryResponse ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Cipher: {queryResponse.cipherSuite}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Protocol: {queryResponse.protocol}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  Time: {queryResponse.timestamp}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
                <pre className="text-emerald-300 leading-relaxed text-[11px]">
                  <code>{JSON.stringify(queryResponse.body, null, 2)}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs">
              Select a government database agency on the left and click "Execute Real-Time API Query" to inspect live response payloads and TLS certificate attributes.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
