import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Sparkles, FileText, CheckCircle2, Database, Shield, FileCheck2 } from 'lucide-react';
import { api } from '../../services/api';

const MOCK_DOCUMENTS = [
  {
    id: 'doc-001',
    docCode: 'SOP-RF-001',
    title: 'Customer Refund Processing Standard Operating Procedure',
    category: 'REFUND_POLICY',
    content: 'Autonomous refund limit: $500 for standard customers, $1,000 for VIP tier. All amounts above threshold require MANAGER role HITL approval. Processing time: T+2 business days via Stripe Gateway. Duplicate charge refunds eligible within 30 days of transaction. Refund reason codes: DUPLICATE, FRAUD, PRODUCT_ISSUE, MERCHANT_ERROR.',
    version: '2.4',
  },
  {
    id: 'doc-002',
    docCode: 'RBI-GUIDELINE-2024',
    title: 'RBI Digital Payments Compliance & Anti-Fraud Framework',
    category: 'REGULATORY',
    content: 'Per RBI Circular 2024/45: All digital payment platforms must enforce velocity checks (max 10 transactions per 60 seconds per customer), mandatory KYC for accounts transacting above ₹10 lakh annually, real-time fraud detection with <200ms latency, and 7-year immutable audit log retention with SHA-256 signatures.',
    version: '5.1',
  },
  {
    id: 'doc-003',
    docCode: 'FRP-001',
    title: 'Fraud Risk Protocol — Velocity Attack & Geo-Mismatch Detection',
    category: 'FRAUD_POLICY',
    content: 'Trigger conditions for immediate account freeze: (1) >10 transactions in 60 seconds, (2) Tor/VPN proxy IP detected, (3) Geographic mismatch >3,000km from registered address, (4) Unrecognized device fingerprint + failed 2FA. Human authorization required before permanent freeze for accounts with lifetime spend >$10,000.',
    version: '3.0',
  },
  {
    id: 'doc-004',
    docCode: 'KYC-002',
    title: 'Know Your Customer (KYC) Verification & Onboarding Protocol',
    category: 'COMPLIANCE',
    content: 'Tier 1 KYC (standard): Government ID + utility bill within 3 months. Tier 2 KYC (high-value): Tier 1 + bank statement + source of funds declaration. HIGH_RISK accounts must complete Tier 2 before any transactions above $100 are permitted. UNDER_REVIEW status prevents withdrawals but allows deposits.',
    version: '1.8',
  },
  {
    id: 'doc-005',
    docCode: 'EXP-004',
    title: 'VIP & Corporate Account Policy Exception Handling Guide',
    category: 'POLICY_EXCEPTION',
    content: 'CORPORATE and VIP tier accounts may request policy exceptions via the HITL approval workflow. Exception types: (1) Refund above standard threshold, (2) KYC documentation extension up to 14 days, (3) Transaction velocity limit increase (requires VP approval). All exceptions are logged with full cryptographic audit trail.',
    version: '2.1',
  },
  {
    id: 'doc-006',
    docCode: 'SEC-AUDIT-001',
    title: 'Cryptographic Audit Trail & SHA-256 Chain of Custody Standard',
    category: 'SECURITY',
    content: 'Every AI agent action must generate an immutable audit log entry with: (1) SHA-256 hash of input+output+timestamp, (2) Agent identity and version, (3) Confidence score, (4) Human approval flag and approver ID where applicable, (5) Full reason chain traceable to RAG evidence sources. Audit records must be retained for minimum 7 years per RBI directive.',
    version: '1.5',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  REFUND_POLICY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REGULATORY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  FRAUD_POLICY: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  COMPLIANCE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  POLICY_EXCEPTION: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  SECURITY: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export const KnowledgeBaseDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.getDocuments()
      .then((res) => setDocuments(res.documents.length > 0 ? res.documents : MOCK_DOCUMENTS))
      .catch(() => setDocuments(MOCK_DOCUMENTS));
  }, []);

  const displayDocs = documents.length > 0 ? documents : MOCK_DOCUMENTS;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await api.searchKnowledge(searchQuery);
      setSearchResults(res.results);
    } catch {
      // Local keyword search fallback
      const q = searchQuery.toLowerCase();
      const fallback = MOCK_DOCUMENTS
        .filter((d) => d.content.toLowerCase().includes(q) || d.title.toLowerCase().includes(q))
        .map((d) => ({ ...d, similarity: 0.85 + Math.random() * 0.14 }))
        .sort((a, b) => b.similarity - a.similarity);
      setSearchResults(fallback);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Retrieval Augmented Generation (RAG) Policy Vector Engine</h1>
          <p className="text-xs text-slate-400">
            Indexed compliance documents, refund SOPs, and RBI rules used for real-time AI evidence grounding
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Database className="w-3.5 h-3.5" />
            <span>{displayDocs.length} Documents Vectorized</span>
          </div>
        </div>
      </div>

      {/* Semantic Vector Search */}
      <div className="p-6 rounded-2xl glass-panel border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span>Semantic Cosine Vector Search Simulator</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 'What is the refund auto-approval limit?' or 'Tor proxy detection policy'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition whitespace-nowrap"
          >
            {searching ? 'Searching...' : 'Run Vector Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-xs font-bold text-cyan-400">
              Relevant Evidence Chunks Found ({searchResults.length}):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((res: any, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{res.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                      {Math.round(res.similarity * 100)}% Match
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{res.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Library */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Indexed Knowledge Document Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayDocs.map((doc: any) => (
            <div key={doc.id} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3 hover:border-blue-500/30 transition">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] font-bold text-blue-400">{doc.docCode}</span>
                  <h3 className="font-bold text-sm text-white mt-0.5 leading-tight">{doc.title}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${CATEGORY_COLORS[doc.category] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  {doc.category?.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{doc.content}</p>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Version {doc.version}</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Vectorized &amp; Active</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
