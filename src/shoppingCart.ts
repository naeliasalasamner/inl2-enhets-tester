export type CartItem = {
  productId: number;
  quantity: number;
};

export type Product = {
  id: number;
  priceExclTax: number;
  category: ProductCategory;
  vatRate: number;
};

export type ProductCategory = "goods" | "food" | "culture";

export type CustomerData = {
  name: string;
  lastName: string;
  fullAddress: string;
};


export class ShoppingCart {
  cart: CartItem[] = [];
  cartTotalExclTax = 0;
  cartTax = 0;

private products: Product[] = [
  { id: 1, priceExclTax: 100, category: "goods", vatRate: 0.25 },
  { id: 2, priceExclTax: 300, category: "food", vatRate: 0.12 },
  { id: 3, priceExclTax: 200, category: "culture", vatRate: 0.06 },
];

private storageKey = "shoppingCart_state";
private isPaid = false;

private saveToStorage() {
  if (typeof localStorage === "undefined") return;

  const payload = {
    isPaid: this.isPaid,
    cart: this.cart,
  };

  localStorage.setItem(this.storageKey, JSON.stringify(payload));
}

private loadFromStorage() {
  if (typeof localStorage === "undefined") return;

  const raw = localStorage.getItem(this.storageKey);
  if(!raw) return;

  try {
    const parsed = JSON.parse(raw) as { isPaid: boolean; cart: { productId: number; quantity: number} []};

    if(parsed.isPaid){
      localStorage.removeItem(this.storageKey);
      return;
    }

    this.isPaid = parsed.isPaid ?? false;
    this.cart = Array.isArray(parsed.cart) ? parsed.cart : [];
    this.recalculateTotals();
  }catch {
    localStorage.removeItem(this.storageKey);
  }

}


  constructor() {
    this.loadFromStorage();
    this.recalculateTotals();
  }


async addProductFromApi(productId: number, quantity: number){
    const response = await fetch(`https://api.example.com/products/${productId}`);
    const product = await response.json();

    this.addProduct(product.id, quantity);

    this.saveToStorage();

}

  private getProduct(productId: number): Product {
    const product = this.products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found");
    return product;
  }

 private recalculateTotals() {
  let total = 0;
  let tax = 0;

  for (const item of this.cart) {
    const product = this.getProduct(item.productId);
    const lineExcl = product.priceExclTax * item.quantity;

    total += lineExcl;
    tax += lineExcl * product.vatRate;
  }

  this.cartTotalExclTax = total;
  this.cartTax = round2(tax);
}

  addProduct(productId: number, quantity: number) {
    const existing = this.cart.find((item) => item.productId === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ productId, quantity });
    }

    this.recalculateTotals();
    this.saveToStorage();
  }

  removeProduct(productId: number, quantity: number) {
    const index = this.cart.findIndex((item) => item.productId === productId);
    if(index === -1) return;

    this.cart[index].quantity -= quantity;

    if(this.cart[index].quantity <= 0) {
      this.cart.splice(index, 1);
    }

    this.recalculateTotals();
    this.saveToStorage();
  }

  getTotalQuantity(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  applyVoucher(code: string) {}


  async placeOrder(customerData: CustomerData) {

    if(this.cart.length === 0 ){
      throw new Error("Cannot place order: empty cart")
    }

  
    if(!customerData?.name ||
       !customerData?.lastName ||
        !customerData?.fullAddress
      ){
      throw new Error("Missing required customer data");
    }

  const response = await fetch("https://api.example.com/orders", {
    method: "POST",
    body: JSON.stringify({
      customer: customerData,
      items: this.cart,
      total: this.cartTotalExclTax,
      tax: this.cartTax,
    }),
  });

  if(!response.ok){
    return { success: false, status: response.status };
  }

  const data = await response.json();
  return { success: true, status: response.status, orderId: data.orderId }
}

  clearCart() {
    this.cart = [];
    this.cartTotalExclTax = 0;
    this.cartTax = 0;
    this.isPaid = false;
    if(typeof localStorage !== "undefined") localStorage.removeItem(this.storageKey);
  }


  markAsPaid() {
    this.isPaid = true;

    this.cart = [];
    this.cartTotalExclTax = 0;
    this.cartTax = 0;

    if(typeof localStorage !== "undefined"){
      localStorage.removeItem(this.storageKey);
    }
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
