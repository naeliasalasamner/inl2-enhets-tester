import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShoppingCart } from "../src/shoppingCart";

function createLocalStorageMock() {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => (key in store ? store [key] : null),
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

describe("ShoppingCart persistence (localStorage)", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        (globalThis as any).localStorage = createLocalStorageMock();
    });

    it("should keep previous cart after 'reload' if not paid", () => {
        const cart1 = new ShoppingCart();

        cart1.addProduct(1, 2);
        cart1.addProduct(2, 1);

        const cart2 = new ShoppingCart();

        expect(cart2.cart).toHaveLength(2);
        expect(cart2.cart.find((i) => i.productId === 1)?.quantity).toBe(2);
        expect(cart2.cart.find((i) => i.productId === 2)?.quantity).toBe(1);

        expect(cart2.cartTotalExclTax).toBe(cart1.cartTotalExclTax);
        expect(cart2.cartTax).toBe(cart1.cartTax);
    });

    it("should NOT keep previouus cart after 'reload' if marked as paid", () => {
        const cart1 = new ShoppingCart();
        cart1.addProduct(1, 1);

        cart1.markAsPaid();

        const cart2 = new ShoppingCart();
        expect(cart2.cart).toHaveLength(0);
        expect(cart2.cartTotalExclTax).toBe(0);
        expect(cart2.cartTax).toBe(0);
    })
} )