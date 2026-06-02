import { PillOption } from "@/components/ui/PillOption";
import { getRelativeActivityTime } from "@/lib/utils/circle";
import {
  getFeelingLabel,
  getReactionLabel,
  getTrainingLabel,
} from "@/lib/utils/labels";
import type { CircleActivity, SupportReaction } from "@/types/circle";

type CircleActivityItemProps = {
  activity: CircleActivity;
  selectedReaction?: SupportReaction;
  onReact: (activityId: string, reaction: SupportReaction) => void;
};

const supportReactions: SupportReaction[] = [
  "Respect",
  "Keep Going",
  "Proud of You",
];

export function CircleActivityItem({
  activity,
  selectedReaction,
  onReact,
}: CircleActivityItemProps) {
  return (
    <article className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-accent">
          {activity.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-primary-text">
              {activity.memberName}
            </p>
            <time className="text-xs text-secondary-text">
              {getRelativeActivityTime(activity.committedAt)}
            </time>
          </div>
          <p className="mt-1 text-sm text-primary-text">
            {getTrainingLabel(activity.trainingFocus)}
            {activity.feeling && (
              <span className="text-secondary-text">
                {" "}
                - se sintió {getFeelingLabel(activity.feeling).toLowerCase()}
              </span>
            )}
          </p>
          <p className="mt-2 text-sm leading-5 text-secondary-text">
            {activity.message}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 pl-[3.25rem]">
        {supportReactions.map((reaction) => {
          const isSelected = selectedReaction === reaction;

          return (
            <PillOption
              active={isSelected}
              key={reaction}
              label={getReactionLabel(reaction)}
              onClick={() => onReact(activity.id, reaction)}
            />
          );
        })}
      </div>
    </article>
  );
}
