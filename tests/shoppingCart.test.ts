import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShoppingCart } from "../src/shoppingCart";

describe("ShoppingCart", () => {
  it("should be empty from the start", () => {
    const cart = new ShoppingCart();

    expect(cart.cart.length).toBe(0);
    expect(cart.cartTotalExclTax).toBe(0);
    expect(cart.cartTax).toBe(0);
  });
});

describe("ShoppingCart", () => {
  it("should add a product to the cart and increase the length", () => {
    const cart = new ShoppingCart();

    expect(cart.cart.length).toBe(0);
    cart.addProduct(1, 1);
    expect(cart.cart.length).toBe(1);
   
  });
});

  it("should have correct name, price, description, and product ID", () => {
  const cart = new ShoppingCart();

  cart.addProduct(2, 3) 

  expect(cart.cart).toHaveLength(1);
  expect(cart.cart[0].productId).toBe(2);
  expect(cart.cart[0].quantity).toBe(3);
  });


  it("should increase quantity if same product is added", () => {
  const cart = new ShoppingCart();

  cart.addProduct(1, 1) 
  cart.addProduct(1, 2) 

  expect(cart.cart).toHaveLength(1);
  expect(cart.cart[0].productId).toBe(1);
  expect(cart.cart[0].quantity).toBe(3);
});

it("should decrease quantity when removing part of the quantity", () => {
  const cart = new ShoppingCart();

  cart.addProduct(1, 5);
  cart.removeProduct(1, 2);

  expect(cart.cart).toHaveLength(1);
  expect(cart.cart[0].productId).toBe(1);
  expect(cart.cart[0].quantity).toBe(3);
});

it("should remove product completely when quantity reaches 0 and decrease cart lenght", () =>{
    const cart = new ShoppingCart();

    cart.addProduct(1, 1);
    cart.addProduct(2, 1);
    expect(cart.cart).toHaveLength(2);

    cart.removeProduct(2, 1);

    expect(cart.cart).toHaveLength(1);
    expect(cart.cart[0].productId).toBe(1);
})

it("should return the total quantity of all products in the cart", () => {
  const cart = new ShoppingCart();
cart.addProduct(1, 3);
cart.addProduct(2, 4);

const totalQuantity = cart.getTotalQuantity();

expect(totalQuantity).toBe(7)
});

it("should update total (sum) correctly when adding and removing products", () => {
      const cart = new ShoppingCart();

    cart.addProduct(1, 2);
    expect(cart.cartTotalExclTax).toBe(200); 

    cart.addProduct(2, 1);
    expect(cart.cartTotalExclTax).toBe(500);

    cart.removeProduct(1,1);
    expect(cart.cartTotalExclTax).toBe(400);

    cart.removeProduct(2, 1);
    expect(cart.cartTotalExclTax).toBe(100);
});

it("should calculate correct VAT (tax) per category and update when quantities change", () => {
    const cart = new ShoppingCart();

    cart.addProduct(1, 2);
    expect(cart.cartTax).toBe(50);

    cart.addProduct(2, 1);
    expect(cart.cartTax).toBe(86);

    cart.addProduct(1, 1);
    expect(cart.cartTax).toBe(111);

    cart.removeProduct(2, 1);
    expect(cart.cartTax).toBe(75);

    cart.addProduct(3, 1);
    expect(cart.cartTax).toBe(87);
});

it("should clear the cart, total amount and tax when clearCart is called", () =>{
    const cart = new ShoppingCart();

    cart.addProduct(1, 2);
    cart.addProduct(2, 1);

    expect(cart.cart.length).toBeGreaterThan(0);
    expect(cart.cartTotalExclTax).toBeGreaterThan(0);
    expect(cart.cartTax).toBeGreaterThan(0);

    cart.clearCart();

    expect(cart.cart.length).toBe(0);
    expect(cart.cartTotalExclTax).toBe(0);
    expect(cart.cartTax).toBe(0);
});

it("should add the correct product from API (productId = 1)", async () => {
  const cart = new ShoppingCart();

  globalThis.fetch = vi.fn().mockResolvedValue({
    json: async () => ({
      id: 1,
      name: "Test Product",
      priceExclTax: 100,
    }),
  } as any);

  await cart.addProductFromApi(1, 2);

  expect(cart.cart.length).toBe(1);
  expect(cart.cart[0].productId).toBe(1);
  expect(cart.cart[0].quantity).toBe(2);
});

it("shouuld remove the correct product(productId =1) from the cart", () => {
    const cart = new ShoppingCart();

    cart.addProduct(1, 2);
    cart.addProduct(2, 1);

    expect(cart.cart).toHaveLength(2);
    

    cart.removeProduct(1, 2);

    expect(cart.cart).toHaveLength(1);
    expect(cart.cart[0].productId).toBe(2);

    expect(cart.cart.find((item) => item.productId === 1)).toBeUndefined();
});

it("should remove product if quantity becomes zero or negative", () => {
    const cart = new ShoppingCart();

    cart.addProduct(1, 1);
    expect(cart.cart).toHaveLength(1);

    cart.removeProduct(1, 2);

    expect(cart.cart).toHaveLength(0);
});

it("should not place an order if required customer data is missing", async () => {
  const cart = new ShoppingCart();
  cart.addProduct(1, 1);

  globalThis.fetch = vi.fn();

  await expect(
    cart.placeOrder({
      name: "Anna",
      lastName: "", 
      fullAddress: "Street 1, 12345 City",
    } as any)
  ).rejects.toThrow(/Missing.*customer data/);


  expect(globalThis.fetch).not.toHaveBeenCalled();
});

it("should not place an order if the cart is empty", async () => {
    const cart = new ShoppingCart();

    globalThis.fetch = vi.fn();

    await expect(
        cart.placeOrder({
            name: "Anna",
            lastName: "Svensson",
            fullAddress: "Street 1, 12345 City",
        } as any)
    ).rejects.toThrow(/empty cart/i);

    expect(globalThis.fetch).not.toHaveBeenCalled();
});


