'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { recommendationsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { ThumbsUp, ThumbsDown, Users, Target, TrendingUp, Activity, Cpu, Brain, BookOpen } from 'lucide-react';

interface FeedbackItem {
  id: number;
  product: string;
  user: string;
  feedback_type: string;
  rating: number | null;
  date: string;
}

interface EngineMetrics {
  name: string;
  label: string;
  accuracy: number;
  coverage: number;
  latency: number;
  color: string;
  icon: typeof Cpu;
}

const fallbackStats = {
  total_recommendations: 142_890,
  active_users: 8_423,
  avg_match_score: 87.6,
  conversion_rate: 12.4,
};

const fallbackFeedback: FeedbackItem[] = [
  { id: 1, product: 'Wireless Headphones Pro', user: 'alice@example.com', feedback_type: 'like', rating: 5, date: '2025-06-24' },
  { id: 2, product: 'Smart Watch Ultra', user: 'bob@example.com', feedback_type: 'dislike', rating: null, date: '2025-06-23' },
  { id: 3, product: 'Bluetooth Speaker X', user: 'carol@example.com', feedback_type: 'like', rating: 4, date: '2025-06-23' },
  { id: 4, product: 'Laptop Stand Adjustable', user: 'david@example.com', feedback_type: 'like', rating: 5, date: '2025-06-22' },
  { id: 5, product: 'Mechanical Keyboard RGB', user: 'eve@example.com', feedback_type: 'dislike', rating: 2, date: '2025-06-21' },
  { id: 6, product: '4K Webcam Stream', user: 'frank@example.com', feedback_type: 'like', rating: 4, date: '2025-06-20' },
  { id: 7, product: 'Gaming Mouse Pro', user: 'grace@example.com', feedback_type: 'like', rating: 3, date: '2025-06-19' },
  { id: 8, product: 'Noise Canceling Earbuds', user: 'henry@example.com', feedback_type: 'dislike', rating: null, date: '2025-06-18' },
];

const fallbackEngines: EngineMetrics[] = [
  { name: 'svd', label: 'SVD Matrix Factorization', accuracy: 89.2, coverage: 78.5, latency: 42, color: '#6C63FF', icon: Cpu },
  { name: 'deep', label: 'Deep Neural Network', accuracy: 93.7, coverage: 85.1, latency: 98, color: '#00E5FF', icon: Brain },
  { name: 'content', label: 'Content-Based (TF-IDF)', accuracy: 81.4, coverage: 92.3, latency: 28, color: '#00E676', icon: BookOpen },
];

const statsConfig = [
  { label: 'Recommendations Served', key: 'total_recommendations' as const, icon: Activity, color: '#6C63FF', format: (v: number) => v.toLocaleString('en-US') },
  { label: 'Active Users', key: 'active_users' as const, icon: Users, color: '#00E5FF', format: (v: number) => v.toLocaleString('en-US') },
  { label: 'Avg Match Score', key: 'avg_match_score' as const, icon: Target, color: '#00E676', format: (v: number) => `${v}%` },
  { label: 'Conversion Rate', key: 'conversion_rate' as const, icon: TrendingUp, color: '#FF6B35', format: (v: number) => `${v}%` },
];

export default function AdminRecommendations() {
  const [analytics, setAnalytics] = useState(fallbackStats);
  const [feedback, setFeedback] = useState<FeedbackItem[]>(fallbackFeedback);
  const [engines, setEngines] = useState<EngineMetrics[]>(fallbackEngines);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await recommendationsApi.analytics();
        if (data) {
          setAnalytics({
            total_recommendations: data.total_recommendations ?? data.total ?? fallbackStats.total_recommendations,
            active_users: data.active_users ?? data.users ?? fallbackStats.active_users,
            avg_match_score: data.avg_match_score ?? data.match_score ?? fallbackStats.avg_match_score,
            conversion_rate: data.conversion_rate ?? data.conversion ?? fallbackStats.conversion_rate,
          });
          const fb = data.feedback ?? data.recent_feedback ?? [];
          setFeedback(Array.isArray(fb) && fb.length > 0 ? fb : fallbackFeedback);
          const eng = data.engines ?? data.engine_metrics ?? [];
          setEngines(Array.isArray(eng) && eng.length > 0 ? eng : fallbackEngines);
        }
      } catch {
        toast.error('Failed to load analytics, showing sample data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs text-[--secondary] font-medium">Admin Panel</span>
        <h1 className="text-3xl font-extrabold mt-1 text-gradient">Recommendations</h1>
        <p className="text-sm text-[--muted] mt-1">Monitor recommendation engine performance and user feedback.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 card-3d">
                <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse mb-3" />
                <div className="h-7 w-20 bg-white/5 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              </div>
            ))
          : statsConfig.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass rounded-xl p-5 card-3d"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                    <s.icon size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{s.format(analytics[s.key])}</div>
                <div className="text-[11px] text-[--muted] mt-0.5">{s.label}</div>
              </motion.div>
            ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 card-3d">
                <div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))
          : engines.map((engine, i) => (
              <motion.div
                key={engine.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass rounded-xl p-5 card-3d"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${engine.color}15`, color: engine.color }}>
                    <engine.icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{engine.label}</div>
                    <div className="text-[10px] text-[--muted]">Engine Performance</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[--muted]">Accuracy</span>
                      <span className="font-medium">{engine.accuracy}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${engine.accuracy}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${engine.color}, ${engine.color}88)` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[--muted]">Coverage</span>
                      <span className="font-medium">{engine.coverage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${engine.coverage}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${engine.color}88, ${engine.color})` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[--muted]">Avg Latency</span>
                    <span className="font-medium">{engine.latency}ms</span>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl overflow-hidden card-3d"
      >
        <div className="p-5 pb-0">
          <h2 className="text-sm font-semibold mb-1">Recent Feedback</h2>
          <p className="text-[11px] text-[--muted] mb-3">User feedback on recommended products.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-y border-white/5 text-[--muted]">
                <th className="text-left py-3 px-4 font-medium">Product</th>
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Feedback</th>
                <th className="text-center py-3 px-4 font-medium">Rating</th>
                <th className="text-right py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-4"><div className="h-4 w-36 bg-white/5 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-28 bg-white/5 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-14 bg-white/5 rounded-full animate-pulse" /></td>
                      <td className="py-3 px-4 text-center"><div className="h-4 w-10 bg-white/5 rounded animate-pulse mx-auto" /></td>
                      <td className="py-3 px-4 text-right"><div className="h-4 w-20 bg-white/5 rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                : feedback.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{item.product}</td>
                      <td className="py-3 px-4 text-[--muted]">{item.user}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                            item.feedback_type === 'like'
                              ? 'bg-[#00E676]/15 text-[#00E676]'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {item.feedback_type === 'like' ? (
                            <><ThumbsUp size={10} /> Like</>
                          ) : (
                            <><ThumbsDown size={10} /> Dislike</>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.rating != null ? (
                          <span className="text-yellow-400 font-medium">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                        ) : (
                          <span className="text-[--muted]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-[--muted]">{item.date}</td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
