import { describe, it, expect } from "vitest";
import { pickMessage, milestoneText } from "./messages";

describe("pickMessage", () => {
  it("returns a title, body and done label for each reminder", () => {
    for (const id of ["water", "stretch", "walk"] as const) {
      const m = pickMessage(id, 0);
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.body.length).toBeGreaterThan(0);
      expect(m.done.length).toBeGreaterThan(0);
    }
  });

  it("rotates through bodies deterministically", () => {
    const first = pickMessage("water", 0);
    const second = pickMessage("water", 1);
    expect(second.body).not.toBe(first.body);
    expect(pickMessage("water", 0)).toEqual(first);
  });

  it("wraps around when the index exceeds the body list", () => {
    expect(pickMessage("water", 10)).toEqual(pickMessage("water", 5));
  });
});

describe("milestoneText", () => {
  it("returns a celebration for milestone counts", () => {
    for (const count of [1, 3, 5, 8]) {
      expect(milestoneText(count)).toContain(`${count}`);
    }
  });

  it("returns null for non-milestone counts", () => {
    expect(milestoneText(2)).toBeNull();
    expect(milestoneText(4)).toBeNull();
  });
});
