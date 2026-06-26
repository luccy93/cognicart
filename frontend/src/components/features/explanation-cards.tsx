'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { RecommendationExplanation } from '@/types';
import { MatchScore } from '@/components/product/match-score';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { BuildingIcon, CartIcon, ChartUpIcon, DocumentIcon, EyeSingleIcon, MoneyIcon, TagIcon, UsersIcon } from '@/components/ui/emoji-icons';

interface ExplanationCardProps {
  reason: string;
  reasonType: string;
  confidence: number;
  featureImportance?: Record<string, number>;
  engineContribution?: Record<string, number>;
}

const reasonIcons: Record<string, React.ReactNode> = {
  purchase_history: <CartIcon size={14} />,
  browsing_history: <EyeSingleIcon size={14} />,
  similar_users: <UsersIcon size={14} />,
  content_match: <DocumentIcon size={14} />,
  trending: <ChartUpIcon size={14} />,
  category_match: <TagIcon size={14} />,
  price_match: <MoneyIcon size={14} />,
  brand_match: <BuildingIcon size={14} />,
};

export function RecommendationExplanationCard({ reason, reasonType, confidence, featureImportance, engineContribution }: ExplanationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const icon = reasonIcons[reasonType] || <InfinityLoopIcon size={14} />;

  return (
    <motion.div
      layout
      className="glass rounded-xl p-4 cursor-pointer hover:border-[--primary]/30 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[--primary]/10 flex items-center justify-center text-sm shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium">{reason}</p>
            <MatchScore score={confidence} size="sm" showLabel={false} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[--muted] capitalize">{reasonType.replace(/_/g, ' ')}</span>
            <motion.svg
              animate={{ rotate: expanded ? 180 : 0 }}
              className="w-3 h-3 text-[--muted]"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (featureImportance || engineContribution) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 mt-3 pt-3 space-y-2">
              {featureImportance && Object.keys(featureImportance).length > 0 && (
                <div>
                  <p className="text-[10px] text-[--muted] mb-1.5">Feature Importance</p>
                  {Object.entries(featureImportance).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[--muted] w-24 truncate">{key}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, val * 100)}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {engineContribution && Object.keys(engineContribution).length > 0 && (
                <div>
                  <p className="text-[10px] text-[--muted] mb-1.5">Engine Contribution</p>
                  {Object.entries(engineContribution).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[--muted] w-24 truncate">{key}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, val)}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[--secondary] to-[--accent]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function XAIDashboardPanel({
  totalExplanations,
  averageConfidence,
  reasonTypeDistribution,
  engineContribution,
  featureImportance,
  recentExplanations,
}: {
  totalExplanations: number;
  averageConfidence: number;
  reasonTypeDistribution: Record<string, number>;
  engineContribution: Record<string, number>;
  featureImportance: Record<string, number>;
  recentExplanations: { product_id: string; reason: string; reason_type: string; confidence: number }[];
}) {
  const total = Object.values(reasonTypeDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] text-[--muted] uppercase">Explanations</p>
          <p className="text-2xl font-bold mt-1">{totalExplanations}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] text-[--muted] uppercase">Avg Confidence</p>
          <p className="text-2xl font-bold mt-1 text-[--secondary]">{averageConfidence}%</p>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <p className="text-xs font-semibold mb-3">Reason Type Distribution</p>
        <div className="space-y-2">
          {Object.entries(reasonTypeDistribution).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] text-[--muted] w-28 truncate capitalize">{key.replace(/_/g, ' ')}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(val / total) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]"
                />
              </div>
              <span className="text-[10px] text-[--muted] w-8 text-right">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <p className="text-xs font-semibold mb-3">Engine Contribution</p>
        {Object.entries(engineContribution).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-[--muted] w-20 truncate">{key}</span>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[--secondary] to-[--accent]"
              />
            </div>
            <span className="text-[10px] text-[--muted] w-10 text-right">{val}%</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-4">
        <p className="text-xs font-semibold mb-3">Recent Explanations</p>
        <div className="space-y-2">
          {recentExplanations.map((exp, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-[--muted]">{exp.reason_type}:</span>
              <span className="flex-1 truncate">{exp.reason}</span>
              <span className="text-[--secondary]">{exp.confidence}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
