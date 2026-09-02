"use client";

import { ExpenseConstructor } from "@/components/expense-constructor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCommerceEconomics,
  useCreateExpenseItem,
  useDeleteExpenseItem,
  useExpenseCatalog,
  usePatchExpenseItem,
  useUpdateExpenseProfile,
} from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";

export default function EconomicsExpensesPage() {
  const { marketplaceId } = useCabinet();
  const economics = useCommerceEconomics();
  const catalog = useExpenseCatalog();
  const updateProfile = useUpdateExpenseProfile();
  const createItem = useCreateExpenseItem();
  const patchItem = usePatchExpenseItem();
  const deleteItem = useDeleteExpenseItem();

  const data = economics.data;
  const profile = catalog.data?.profile ?? data?.profile ?? null;
  const items = data?.items?.length ? data.items : (catalog.data?.items ?? []);
  const busy =
    updateProfile.isPending ||
    createItem.isPending ||
    patchItem.isPending ||
    deleteItem.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Свои расходы</CardTitle>
      </CardHeader>
      <CardContent>
        {!marketplaceId ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Выберите кабинет, чтобы добавить упаковку, фулфилмент и другие
            статьи.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Мастер модели и статьи, которых нет у Ozon: упаковка, закупка
              логистики, зарплата. Они входят в чистую прибыль кабинета.
              Постоянные не попадают в ₽/шт по SKU.
            </p>
            <ExpenseConstructor
              profile={profile}
              items={items}
              disabled={busy}
              onSaveProfile={(patch) => updateProfile.mutate(patch)}
              onCreate={(payload) => createItem.mutate(payload)}
              onToggle={(item, enabled) =>
                patchItem.mutate({
                  itemId: item.id,
                  payload: { enabled },
                })
              }
              onDelete={(id) => deleteItem.mutate(id)}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
