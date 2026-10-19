import { describe, expect, it } from "vitest";

import {
  parseClientConfiguration,
  shadowedClientServers,
} from "./ClientConfigurationDocument.js";

describe("parseClientConfiguration shape diagnostics", () => {
  it.each([
    ["null", "null"],
    ["array", "[]"],
    ["string", '"x"'],
  ] as const)("names a non-object JSON root (%s)", (_label, text) => {
    expect(() => parseClientConfiguration(text, "json")).toThrow(
      new TypeError("The configuration root must be an object"),
    );
  });

  it.each([
    ["null", "null"],
    ["array", "[]"],
    ["string", '"x"'],
  ] as const)(
    'names a non-object "mcpServers" value (%s)',
    (_label, servers) => {
      expect(() =>
        parseClientConfiguration(`{"mcpServers":${servers},"keep":1}`, "json"),
      ).toThrow(new TypeError('"mcpServers" must be an object'));
    },
  );

  it("still rejects unparsable JSON with SyntaxError", () => {
    expect(() => parseClientConfiguration("not-json", "json")).toThrow(
      SyntaxError,
    );
  });

  it("reports only duplicates in the effective server object", () => {
    const owned = '{"command":"re-tool","args":["mcp"]}';
    const activeTable = `{"mcpServers":{"re-tool":null,"re-tool":${owned}}}`;
    const active = parseClientConfiguration(activeTable, "json");
    expect(shadowedClientServers(activeTable, active, "re-tool")).toEqual({
      servers: [null],
      legacyServers: [],
    });

    // Removing from the effective parent leaves an earlier repeated parent
    // inactive. Its members are not registrations the client would reveal.
    const inactiveParent =
      `{"mcpServers":{"re-tool":{"command":"/usr/bin/false"}},` +
      `"mcpServers":{"re-tool":${owned}}}`;
    const parsed = parseClientConfiguration(inactiveParent, "json");
    expect(shadowedClientServers(inactiveParent, parsed, "re-tool")).toEqual({
      servers: [],
      legacyServers: [],
    });
  });
});
