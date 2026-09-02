import { Badge } from "@/components/ui/badge";
import type { AnswerStatus } from "@/lib/types";

const LABELS: Record<AnswerStatus, string> = {
  draft: "Черновик",
  pending_review: "На проверке",
  published: "Опубликован",
  rejected: "Отклонён",
  failed: "Ошибка",
};

const VARIANTS: Record<
  AnswerStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  draft: "secondary",
  pending_review: "warning",
  published: "success",
  rejected: "secondary",
  failed: "destructive",
};

export function StatusBadge({ status }: { status: AnswerStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
