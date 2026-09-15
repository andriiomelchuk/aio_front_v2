import { describe, expect, it } from "vitest";
import { getManagedImageReferences } from "./managedImages";

describe("managed image references", () => {
  it("collects nested references and ignores regular URLs", () => {
    expect(getManagedImageReferences({
      image: "aio-image://first",
      gallery: ["https://example.com/image.jpg", { src: "aio-image://second" }],
    })).toEqual(["aio-image://first", "aio-image://second"]);
  });
});
