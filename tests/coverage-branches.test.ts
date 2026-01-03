import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShoppingCart } from "../src/shoppingCart";

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe("Branch coverage helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).localStorage = createLocalStorageMock();
  });

  it("loadFromStorage: should handle corrupt JSON by clearing storage", () => {
    // Lägg in trasig JSON
    (globalThis as any).localStorage.setItem("shoppingCart_state", "{not-valid-json");

    // När ShoppingCart skapas ska den försöka läsa -> catch -> removeItem
    const cart = new ShoppingCart();

    expect(cart.cart).toHaveLength(0);
    expect((globalThis as any).localStorage.getItem("shoppingCart_state")).toBeNull();
  });

  it("loadFromStorage: should clear storage if marked as paid", () => {
    (globalThis as any).localStorage.setItem(
      "shoppingCart_state",
      JSON.stringify({
        isPaid: true,
        cart: [{ productId: 1, quantity: 2 }],
      })
    );

    const cart = new ShoppingCart();

    expect(cart.cart).toHaveLength(0);
    expect((globalThis as any).localStorage.getItem("shoppingCart_state")).toBeNull();
  });

  it("removeProduct: removing non-existing product should be a no-op (covers early return)", () => {
    const cart = new ShoppingCart();
    cart.addProduct(1, 1);

    cart.removeProduct(999, 1); // finns inte

    expect(cart.cart).toHaveLength(1);
    expect(cart.cart[0].productId).toBe(1);
  });

  it("placeOrder: should return success false when API response is not ok (covers error branch)", async () => {
    const cart = new ShoppingCart();
    cart.addProduct(1, 1);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Internal Server Error" }),
    } as any);

    const result = await cart.placeOrder({
      name: "Anna",
      lastName: "Svensson",
      fullAddress: "Street 1",
    } as any);

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });
});
