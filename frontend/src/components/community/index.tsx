'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatIcon, HeartIcon, StarIcon, ThumbsUpIcon } from '@/components/ui/emoji-icons';

interface Discussion {
  id: string;
  user: string;
  avatar: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  time: string;
}

const sampleDiscussions: Discussion[] = [
  { id: '1', user: 'TechGuru', avatar: 'T', title: 'Best wireless earbuds under $100?', content: 'Looking for recommendations for daily commute and gym use...', likes: 24, replies: 18, time: '2h ago' },
  { id: '2', user: 'GamerPro', avatar: 'G', title: 'Mechanical keyboard switches comparison', content: 'Just got the new Cherry MX Silent Reds...', likes: 42, replies: 31, time: '5h ago' },
  { id: '3', user: 'SmartHomeFan', avatar: 'S', title: 'Smart home hub setup guide', content: 'Sharing my experience with setting up a complete smart home...', likes: 56, replies: 27, time: '1d ago' },
];

const sampleReviews = [
  { id: '1', user: 'Verified User', avatar: 'V', product: 'Wireless Earbuds Pro', rating: 5, content: 'Absolutely love these! The sound quality is incredible and the battery lasts for days. Best purchase this year!', helpful: 47, time: '3d ago', verified: true },
  { id: '2', user: 'AudioPhile', avatar: 'A', product: 'Noise Cancelling Headphones', rating: 4, content: 'Great ANC, comfortable for long sessions. Slightly heavy but worth it for the sound quality.', helpful: 32, time: '1w ago', verified: true },
];

export function CommunityDiscussions() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Community Discussions</h3>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      {sampleDiscussions.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-xl p-4 cursor-pointer hover:border-[--primary]/20 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
              {d.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{d.user}</span>
                <span className="text-[10px] text-[--muted]">{d.time}</span>
              </div>
              <h4 className="text-sm font-medium mt-1">{d.title}</h4>
              <p className="text-xs text-[--muted] mt-0.5 line-clamp-1">{d.content}</p>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-[--muted]">
                <span><HeartIcon size={14} /> {d.likes}</span>
                <span><ChatIcon size={14} /> {d.replies} replies</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function TrendingReviews() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Trending Reviews</h3>
      {sampleReviews.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
              {r.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium">{r.user}</span>
                {r.verified && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Verified Purchase
                  </span>
                )}
                <span className="text-[10px] text-[--muted]">{r.time}</span>
              </div>
              <p className="text-xs text-yellow-400 mt-0.5">{[...Array(r.rating)].map((_, i) => <StarIcon key={i} size={14} />)}</p>
              <p className="text-xs text-[--muted] mt-0.5">on <span className="text-white">{r.product}</span></p>
              <p className="text-xs mt-1 line-clamp-2">{r.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-[--muted]"><ThumbsUpIcon size={14} /> {r.helpful} found helpful</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
