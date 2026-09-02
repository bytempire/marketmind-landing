import type { ReactNode } from "react";

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  emptyText = "Нет данных",
  errorText,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  errorText?: string;
  children: ReactNode;
}) {
  if (isLoading) {
    return <p className="text-sm text-[var(--muted-foreground)]">Загрузка…</p>;
  }
  if (isError) {
    return (
      <p className="text-sm text-[var(--destructive)]">
        {errorText ?? "Не удалось загрузить данные"}
      </p>
    );
  }
  if (isEmpty) {
    return <p className="text-sm text-[var(--muted-foreground)]">{emptyText}</p>;
  }
  return <>{children}</>;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
