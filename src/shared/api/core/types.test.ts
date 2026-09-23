import { describe, expect, it } from "vitest";
import { ApiError, isApiError } from "./types";

describe("ApiError", () => {
  it("keeps a stable machine-readable code", () => {
    const error = new ApiError("NOT_FOUND", "Entity not found");

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("NOT_FOUND");
    expect(isApiError(error)).toBe(true);
    expect(isApiError(error, "NOT_FOUND")).toBe(true);
    expect(isApiError(error, "INVALID_INPUT")).toBe(false);
  });
});
