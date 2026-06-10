import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseFrom = vi.fn();
const supabaseRpc = vi.fn();

vi.mock("@/lib/api/require-user", () => ({
  createAuthedClient: vi.fn(async () => ({
    supabase: {
      from: supabaseFrom,
      rpc: supabaseRpc,
    },
  })),
}));

import { POST } from "./route";

function queryResult(data: unknown, error: unknown = null) {
  return Promise.resolve({ data, error });
}

function chain(terminal: () => Promise<{ data: unknown; error: unknown }>) {
  const result = terminal();
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    then: (
      onFulfilled?: (value: { data: unknown; error: unknown }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => result.then(onFulfilled, onRejected),
  };
  return builder;
}

function request(body: unknown) {
  return new Request("http://localhost/api/characters/42/level-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const context = { params: Promise.resolve({ id: "42" }) };

describe("POST /api/characters/[id]/level-up", () => {
  beforeEach(() => {
    supabaseFrom.mockReset();
    supabaseRpc.mockReset();
    supabaseRpc.mockResolvedValue({ data: { ok: true }, error: null });
  });

  it("rejeita repetir ou reduzir nível de classe antes do RPC", async () => {
    supabaseFrom.mockReturnValue(
      chain(() => queryResult([{ class_id: 30, class_level: 5 }])),
    );

    const response = await POST(
      request({ class_id: 30, new_class_level: 5 }),
      context,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/maior que o nível atual/i);
    expect(supabaseRpc).not.toHaveBeenCalled();
  });

  it("rejeita nível total acima de 20 antes do RPC", async () => {
    supabaseFrom.mockReturnValue(
      chain(() =>
        queryResult([
          { class_id: 30, class_level: 10 },
          { class_id: 40, class_level: 10 },
        ]),
      ),
    );

    const response = await POST(
      request({ class_id: 30, new_class_level: 11 }),
      context,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/não pode exceder 20/i);
    expect(supabaseRpc).not.toHaveBeenCalled();
  });

  it("chama level_up_character quando o novo nível é válido", async () => {
    supabaseFrom.mockReturnValue(
      chain(() => queryResult([{ class_id: 30, class_level: 5 }])),
    );

    const response = await POST(
      request({ class_id: 30, new_class_level: 6 }),
      context,
    );

    expect(response.status).toBe(200);
    expect(supabaseRpc).toHaveBeenCalledWith("level_up_character", {
      p_character_id: 42,
      p_class_id: 30,
      p_new_class_level: 6,
      p_subclass_id: null,
      p_choices: {},
    });
  });
});
