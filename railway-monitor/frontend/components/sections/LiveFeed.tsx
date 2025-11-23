'use client';

import CommentCard from "@/components/ui/CommentCard";
import { Comment } from "@/types";
import { useCity } from "@/lib/CityContext";
import React from "react";

interface LiveFeedProps {
  comments: Comment[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ comments }) => {
  const { translations } = useCity();

  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-white/60">{translations.liveFeedTitle}</h3>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 animate-pulse">
          ● {translations.live}
        </span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {comments.map((comment, i) => (
          <CommentCard key={i} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;
