import { describe, it, expect } from "vitest";
import type { AnyToolDefinition } from "@barry-rocks/sdk/bags";
import * as tools from "./tools.js";


function exportedTools(): AnyToolDefinition[] {
  return (Object.values(tools) as unknown[]).filter(
    (v): v is AnyToolDefinition =>
      typeof v === "object" && v !== null && "name" in v && "namespace" in v && "handler" in v,
  );
}

describe("tool exports", () => {
  it("exports at least one tool", () => {
    expect(exportedTools().length).toBeGreaterThan(0);
  });

  for (const tool of exportedTools()) {
    describe(tool.name, () => {
      it("has required fields", () => {
        expect(tool.name).toBeTruthy();
        expect(tool.namespace).toBeTruthy();
        expect(typeof tool.handler).toBe("function");
        expect(tool.description).toBeTruthy();
      });
    });
  }

  // The MCP client prefixes the namespace, so `filetype_convert` would surface
  // as mcp__filetype__filetype_convert.
  it("no tool repeats the namespace in its name", () => {
    for (const tool of exportedTools()) expect(tool.name).not.toMatch(/^filetype[_-]/);
  });

  it("publishes all conversion tools through the Media entry point", async () => {
    const media = await import("../../tools.js");
    const published = Object.values(media);
    for (const tool of exportedTools()) expect(published).toContain(tool);
  });
});
