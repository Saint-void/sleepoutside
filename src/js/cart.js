import { loadHeaderFooter } from "./utils.mjs";
import ShoppingCart, { cartItemTemplate } from "./ShoppingCart.mjs";

loadHeaderFooter();

const cart = new ShoppingCart("so-cart", ".product-list");

if (typeof document !== "undefined") {
  cart.init();
}

export { cartItemTemplate };

export function removeItemFromCart(id) {
  cart.removeItem(id);
}

export function renderCartContents() {
  cart.renderCartContents();
}
