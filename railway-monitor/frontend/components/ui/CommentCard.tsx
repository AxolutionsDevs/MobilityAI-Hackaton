import { Comment } from "@/types";
import { Minus, ThumbsDown, ThumbsUp } from "lucide-react";
import React from "react";

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const config = {
    positive: {
      icon: ThumbsUp,
      color: "text-green-400",
      bg: "bg-green-500/20",
    },
    neutral: { icon: Minus, color: "text-yellow-400", bg: "bg-yellow-500/20" },
    negative: { icon: ThumbsDown, color: "text-red-400", bg: "bg-red-500/20" },
  };

  const c = config[comment.sentiment];
  const Icon = c.icon;

  return (
    <div className={`p-3 rounded-xl ${c.bg} border border-white/10`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${c.color} mt-0.5`} />
        <p className="text-xs text-white/90 flex-1">{comment.text}</p>
      </div>
    </div>
  );
};

export default CommentCard;
