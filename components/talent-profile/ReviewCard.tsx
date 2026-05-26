import type { TalentReview } from "@/types/database";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Briefcase, Building2, Star } from "lucide-react";

interface ReviewCardProps {
  review: TalentReview;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <Card className={cn("h-full gap-0 py-0 shadow-sm", className)}>
      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex items-center gap-1.5">
          <Star className="size-4 shrink-0 fill-secondary text-secondary" />
          <span className="text-sm font-semibold text-foreground">
            {review.rating}/5
          </span>
        </div>

        <p className="font-semibold text-foreground">{review.title}</p>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {review.body}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Briefcase className="size-4 shrink-0" />
            {review.event_title}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="size-4 shrink-0" />
            {review.client}
          </span>
        </div>
      </div>
    </Card>
  );
}
