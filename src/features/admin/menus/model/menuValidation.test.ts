import { describe, expect, it } from "vitest";
import { createMenuLocalizedText, type T_MenuItem } from "@/entities/menu";
import { isMenuItemComplete } from "./menuValidation";

const item = (label: string, href: string, children: T_MenuItem[] = []): T_MenuItem => ({
  id: label || "empty",
  label: createMenuLocalizedText("en", label),
  href,
  openInNewTab: false,
  isVisible: true,
  children,
});

describe("menu validation", () => {
  it("validates every nested item", () => {
    expect(isMenuItemComplete(item("Parent", "/parent", [item("", "/child")]), "en")).toBe(false);
    expect(isMenuItemComplete(item("Parent", "/parent", [item("Child", "/child")]), "en")).toBe(true);
  });
});
