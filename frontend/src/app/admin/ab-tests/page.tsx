'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TestTube, Plus, Play, Square, BarChart3 } from 'lucide-react';
import { featuresApi } from '@/lib/api';

interface ABTest {
  id: string;
  name: string;
  description?: string;
  experiment_type: string;
  is_active: boolean;
  variant_a_impressions: number;
  variant_b_impressions: number;
  variant_a_conversions: number;
  variant_b_conversions: number;
  started_at: string;
  ended_at?: string;
}

export default function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTests(); }, []);

  async function loadTests() {
    try {
      setLoading(true);
      const { data } = await featuresApi.getABTests();
      setTests(data as ABTest[]);
    } catch { /* admin only */ }
    setLoading(false);
  }

  function calcRate(conversions: number, impressions: number): string {
    if (!impressions) return '0';
    return ((conversions / impressions) * 100).toFixed(1);
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[--secondary] font-medium">Admin</span>
          <h1 className="text-3xl font-extrabold mt-1 text-gradient">A/B Tests</h1>
          <p className="text-sm text-[--muted] mt-1">Monitor and manage experimentation.</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test, i) => {
            const aRate = parseFloat(calcRate(test.variant_a_conversions, test.variant_a_impressions));
            const bRate = parseFloat(calcRate(test.variant_b_conversions, test.variant_b_impressions));
            const winner = aRate > bRate ? 'A' : bRate > aRate ? 'B' : '—';

            return (
              <motion.div key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-5 card-3d">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${test.is_active ? 'bg-[#00E676]/10' : 'bg-white/5'}`}>
                      <TestTube size={16} className={test.is_active ? 'text-[#00E676]' : 'text-[--muted]'} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{test.name}</div>
                      <div className="text-[11px] text-[--muted]">{test.description || test.experiment_type}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    test.is_active ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-white/5 text-[--muted]'
                  }`}>
                    {test.is_active ? <><Play size={10} /> Active</> : <><Square size={10} /> Ended</>}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className={`rounded-lg p-3 ${winner === 'A' ? 'bg-[--primary]/10 border border-[--primary]/20' : 'bg-white/5'}`}>
                    <div className="text-[10px] text-[--muted] mb-1">Variant A</div>
                    <div className="text-lg font-bold text-[--primary]">{aRate}%</div>
                    <div className="text-[10px] text-[--muted] mt-0.5">
                      {test.variant_a_conversions} / {test.variant_a_impressions} conversions
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 ${winner === 'B' ? 'bg-[--secondary]/10 border border-[--secondary]/20' : 'bg-white/5'}`}>
                    <div className="text-[10px] text-[--muted] mb-1">Variant B</div>
                    <div className="text-lg font-bold text-[--secondary]">{bRate}%</div>
                    <div className="text-[10px] text-[--muted] mt-0.5">
                      {test.variant_b_conversions} / {test.variant_b_impressions} conversions
                    </div>
                  </div>
                </div>

                {winner !== '—' && (
                  <div className="mt-3 text-[11px] text-[--muted]">
                    Winner: <span className={`font-bold ${winner === 'A' ? 'text-[--primary]' : 'text-[--secondary]'}`}>
                      Variant {winner}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
          {tests.length === 0 && (
            <div className="text-center py-16 text-[--muted]">
              <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No A/B tests found. Log in as admin to view experiments.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
