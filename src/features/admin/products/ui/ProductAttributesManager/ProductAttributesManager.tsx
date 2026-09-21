"use client";

import { useState } from "react";
import type { T_ProductAttribute } from "@/entities/product/model/types";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import type { T_ProductAttributesManagerProps } from "./types";

const createAttributeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

type T_ProductAttributeItem = T_ProductAttribute & {
  id: string;
};

export const ProductAttributesManager = ({
  attributes = [],
}: T_ProductAttributesManagerProps) => {
  const { t } = useI18n();
  const [attributeItems, setAttributeItems] = useState<T_ProductAttributeItem[]>(
    attributes.map((attribute) => ({
      ...attribute,
      id: attribute.id ?? createAttributeId(),
    })),
  );

  const preparedAttributes = attributeItems
    .map(({ id, name, value }) => ({
      id,
      name: name.trim(),
      value: value.trim(),
    }))
    .filter((attribute) => attribute.name || attribute.value);

  const updateAttribute = (
    id: string,
    field: keyof T_ProductAttribute,
    value: string,
  ) => {
    setAttributeItems((currentAttributes) =>
      currentAttributes.map((attribute) =>
        attribute.id === id ? { ...attribute, [field]: value } : attribute,
      ),
    );
  };

  const addAttribute = () => {
    setAttributeItems((currentAttributes) => [
      ...currentAttributes,
      { id: createAttributeId(), name: "", value: "" },
    ]);
  };

  const removeAttribute = (id: string) => {
    setAttributeItems((currentAttributes) =>
      currentAttributes.filter((attribute) => attribute.id !== id),
    );
  };

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <input
        type="hidden"
        name="attributes"
        value={JSON.stringify(preparedAttributes)}
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">
          {t("admin.product.form.attributesLabel")}
        </p>

        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          onClick={addAttribute}
        >
          {t("admin.product.form.attributesAdd")}
        </Button>
      </div>

      {attributeItems.length > 0 ? (
        <div className="grid gap-2">
          {attributeItems.map((attribute) => (
            <div
              key={attribute.id}
              className="grid gap-2 rounded-md border border-border bg-surface p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
            >
              <input
                value={attribute.name}
                placeholder={t("admin.product.form.attributesNamePlaceholder")}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                onChange={(event) =>
                  updateAttribute(attribute.id, "name", event.target.value)
                }
              />

              <input
                value={attribute.value}
                placeholder={t("admin.product.form.attributesValuePlaceholder")}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                onChange={(event) =>
                  updateAttribute(attribute.id, "value", event.target.value)
                }
              />

              <Button
                type="button"
                variant="danger"
                className="h-8 px-3 text-xs"
                onClick={() => removeAttribute(attribute.id)}
              >
                {t("admin.product.form.attributesRemove")}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted">
          {t("admin.product.form.attributesEmpty")}
        </div>
      )}
    </div>
  );
};
