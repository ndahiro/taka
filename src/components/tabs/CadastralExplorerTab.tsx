/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Compass, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  FileCheck, 
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { LandTitle } from '../../types/fabric';

interface CadastralExplorerTabProps {
  titles: LandTitle[];
  onSelectTitleForAudit: (titleId: string) => void;
}

export const CadastralExplorerTab: React.FC<CadastralExplorerTabProps> = ({
  titles,
  onSelectTitleForAudit
}) => {
  const [selectedParcelId, setSelectedParcelId] = useState<string>(titles[0]?.id || '');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  const selectedTitle = titles.find(t => t.id === selectedParcelId) || titles[0];

  const filteredTitles = zoneFilter === 'ALL' 
    ? titles 
    : titles.filter(t => t.cadastralZone === zoneFilter);

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'COMMERCIAL_DOWNTOWN':
        return { fill: 'fill-amber-500/25', stroke: 'stroke-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'AGRI_HIGHLAND':
        return { fill: 'fill-emerald-500/25', stroke: 'stroke-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'TECH_INNOVATION':
        return { fill: 'fill-cyan-500/25', stroke: 'stroke-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'RESIDENTIAL_PRIME':
        return { fill: 'fill-purple-500/25', stroke: 'stroke-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'COASTAL_MARINA':
        return { fill: 'fill-blue-500/25', stroke: 'stroke-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      default:
        return { fill: 'fill-slate-500/25', stroke: 'stroke-slate-400', badge: 'bg-slate-500/20 text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cadastral Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Cadastral GIS Map & Geodetic Boundary Register
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization with Local Government Ordnance Survey & Cadastre GIS database (ISO 19152 LADM)
          </p>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Zone Filter:</span>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer font-mono"
          >
            <option value="ALL">All Zones ({titles.length})</option>
            <option value="COMMERCIAL_DOWNTOWN">Commercial Downtown</option>
            <option value="AGRI_HIGHLAND">Highland Agricultural</option>
            <option value="TECH_INNOVATION">Tech Innovation</option>
            <option value="RESIDENTIAL_PRIME">Residential Prime</option>
            <option value="COASTAL_MARINA">Coastal Marina</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Cadastral Map (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-slate-300">Municipal Grid Datum: EPSG:4326 / WGS 84</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              Click parcel polygon to inspect title
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
            
            {/* Background Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Geographical Map Overlay */}
            <svg viewBox="0 0 500 500" className="w-full h-full relative z-10">
              
              {/* Natural features: River / Coastline */}
              <path
                d="M 0 350 Q 150 300 250 380 T 500 450 L 500 500 L 0 500 Z"
                fill="#0e3a5a"
                opacity="0.3"
              />
              <text x="350" y="470" fill="#38bdf8" fontSize="11" fontFamily="sans-serif" opacity="0.6">
                ~ Coastal Waterfront & Harbour ~
              </text>

              {/* Highway / Transit corridor */}
              <line x1="240" y1="0" x2="240" y2="350" stroke="#334155" strokeWidth="3" strokeDasharray="6,4" />
              <text x="245" y="40" fill="#64748b" fontSize="9" fontFamily="monospace">
                Corridor A1
              </text>

              {/* Render Land Parcels */}
              {filteredTitles.map((title) => {
                const isSelected = selectedParcelId === title.id;
                const colors = getZoneColor(title.cadastralZone);
                const pointsString = title.coordinates.polygonPoints.map(p => `${p[0]},${p[1]}`).join(' ');

                // Calculate centroid for label
                const avgX = title.coordinates.polygonPoints.reduce((sum, p) => sum + p[0], 0) / title.coordinates.polygonPoints.length;
                const avgY = title.coordinates.polygonPoints.reduce((sum, p) => sum + p[1], 0) / title.coordinates.polygonPoints.length;

                return (
                  <g
                    key={title.id}
                    onClick={() => setSelectedParcelId(title.id)}
                    className="cursor-pointer transition duration-200"
                  >
                    <polygon
                      points={pointsString}
                      className={`${colors.fill} ${colors.stroke} transition-all duration-300 ${
                        isSelected 
                          ? 'stroke-[3.5] filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] fill-amber-500/40' 
                          : 'stroke-[1.5] hover:stroke-[2.5] hover:fill-amber-500/20'
                      }`}
                    />
                    
                    {/* Centroid Pin & Label */}
                    <circle
                      cx={avgX}
                      cy={avgY}
                      r={isSelected ? "5" : "3.5"}
                      className={isSelected ? "fill-amber-400 stroke-slate-900 stroke-2" : "fill-white/80"}
                    />
                    
                    <text
                      x={avgX}
                      y={avgY - 9}
                      textAnchor="middle"
                      fill={isSelected ? "#fef08a" : "#cbd5e1"}
                      fontSize={isSelected ? "11" : "9.5"}
                      fontWeight={isSelected ? "bold" : "600"}
                      fontFamily="monospace"
                      className="pointer-events-none drop-shadow"
                    >
                      {title.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend (Floating in corner) */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1.5 z-20">
              <div className="font-bold text-slate-300 uppercase tracking-wider">Zoning Legend</div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400" />
                <span className="text-slate-400">Commercial Core</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400" />
                <span className="text-slate-400">Highland Agri</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-400" />
                <span className="text-slate-400">Tech Innovation</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-500/40 border border-purple-400" />
                <span className="text-slate-400">Residential Prime</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500/40 border border-blue-400" />
                <span className="text-slate-400">Coastal Marina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Parcel Inspector Drawer (1 Col) */}
        {selectedTitle ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {selectedTitle.id}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getZoneColor(selectedTitle.cadastralZone).badge}`}>
                  {selectedTitle.cadastralZone.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100">
                {selectedTitle.titleDeedNumber}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedTitle.legalDescription}
              </p>
            </div>

            {/* Metrics */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-slate-400">Registered Owner</div>
                <div className="font-bold text-slate-100">{selectedTitle.currentOwnerPseudonym}</div>
                <div className="text-[10px] font-mono text-slate-500 truncate">{selectedTitle.ownerDid}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400">Parcel Surface Area</div>
                  <div className="font-bold text-slate-100 font-mono mt-0.5">
                    {selectedTitle.areaSqm.toLocaleString()} m²
                  </div>
                  <div className="text-[10px] text-slate-500">{(selectedTitle.areaSqm / 10000).toFixed(2)} Ha</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400">Cadastral Valuation</div>
                  <div className="font-bold text-emerald-400 font-mono mt-0.5">
                    ${selectedTitle.valuationUSD.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Rate: {selectedTitle.annualTaxRatePercent}%</div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                <div className="text-slate-400 font-sans flex items-center justify-between">
                  <span>Centroid GPS Coordinates</span>
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-slate-200">
                  Lat: {selectedTitle.coordinates.centerLat.toFixed(5)}° N, Lng: {selectedTitle.coordinates.centerLng.toFixed(5)}° E
                </div>
                <div className="text-[10px] text-slate-500">
                  Elevation: {selectedTitle.coordinates.elevationMeters}m above MSL
                </div>
              </div>

              {/* Status and Liens */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[10px]">Title Status</div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1 mt-0.5">
                    {selectedTitle.status === 'ACTIVE' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{selectedTitle.status}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Encumbrances</div>
                  <div className="text-xs font-bold font-mono text-slate-200">
                    {selectedTitle.liens.length} Registered
                  </div>
                </div>
              </div>

              {/* Jump to Audit Trail button */}
              <button
                onClick={() => onSelectTitleForAudit(selectedTitle.id)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition cursor-pointer"
              >
                <span>Verify Full Audit Trail on Blockchain</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};
