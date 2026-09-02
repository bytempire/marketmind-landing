import { cn } from "@/lib/utils";

type OzonApiRoleRow = {
  role: string;
  sections: string;
  note?: string;
};

const GRANULAR_ROLES: OzonApiRoleRow[] = [
  {
    role: "Product read-only",
    sections: "Товары, цены, контент карточек, остатки",
    note: "достаточно для чтения; Product — если нужны изменения",
  },
  {
    role: "Posting FBO",
    sections: "Выкупы и отгрузки FBO",
  },
  {
    role: "Posting FBS",
    sections: "Выкупы и отгрузки FBS",
  },
  {
    role: "Returns",
    sections: "Возвраты по SKU",
  },
  {
    role: "Actions read-only",
    sections: "Акции и автоакции",
    note: "Actions — если нужны заявки на скидку",
  },
  {
    role: "Report",
    sections: "Платное хранение",
  },
  {
    role: "Warehouse",
    sections: "Остатки по складам FBS",
  },
  {
    role: "Review + Question",
    sections: "Отзывы и вопросы, ИИ-ответы",
    note: "нужна подписка Ozon Premium Pro",
  },
];

function RolesContent() {
  return (
    <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
      <p>
        В Ozon:{" "}
        <span className="text-[var(--foreground)]">
          Настройки → Seller API → API-ключи → Сгенерировать ключ
        </span>
        . Проще всего выбрать тип токена{" "}
        <strong className="text-[var(--foreground)]">Admin read only</strong> —
        он покрывает продажи, финансы, выкупы, остатки и рейтинг кабинета без
        права менять данные в Ozon.
      </p>
      <p>
        Если нужны точечные права, включите роли из таблицы ниже. После
        изменения прав создайте новый ключ и обновите его в MarketMind.
      </p>
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-[var(--muted)]/60 text-[var(--foreground)]">
            <tr>
              <th className="px-3 py-2 font-medium">Роль ключа</th>
              <th className="px-3 py-2 font-medium">Разделы MarketMind</th>
              <th className="px-3 py-2 font-medium">Примечание</th>
            </tr>
          </thead>
          <tbody>
            {GRANULAR_ROLES.map((row) => (
              <tr
                key={row.role}
                className="border-t border-[var(--border)] align-top"
              >
                <td className="px-3 py-2 font-medium text-[var(--foreground)]">
                  {row.role}
                </td>
                <td className="px-3 py-2">{row.sections}</td>
                <td className="px-3 py-2">{row.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Реклама — отдельные ключи{" "}
        <span className="text-[var(--foreground)]">Performance API</span>{" "}
        (Настройки → API-ключи → Performance), не Seller.
      </p>
    </div>
  );
}

export function OzonSellerApiRolesHint({
  className,
  variant = "collapsible",
}: {
  className?: string;
  variant?: "collapsible" | "sidebar";
}) {
  if (variant === "sidebar") {
    return (
      <div className={cn("min-w-0", className)}>
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          Какие роли включить для Seller API
        </h3>
        <div className="mt-3">
          <RolesContent />
        </div>
      </div>
    );
  }

  return (
    <details
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3 text-sm",
        className,
      )}
    >
      <summary className="cursor-pointer font-medium text-[var(--foreground)]">
        Какие роли включить для Seller API
      </summary>
      <div className="mt-3">
        <RolesContent />
      </div>
    </details>
  );
}
