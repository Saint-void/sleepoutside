import {
  getLocalStorage,
  setLocalStorage,
  renderListWithTemplate,
} from "./utils.mjs";

export function cartItemTemplate(item) {
  const colorName =
    item.Colors && item.Colors[0] ? item.Colors[0].ColorName : "";
  const itemId = item.Id || item.id;

  const itemImage =
    item.Image ||
    item.Images?.PrimaryMedium ||
    item.Images?.PrimaryLarge ||
    item.Images?.PrimarySmall ||
    "";

  const newItem = `<li class="cart-card divider">
  <span class="cart-card__remove" role="button" tabindex="0" data-id="${itemId}" aria-label="Remove ${item.Name || "item"} from cart">X</span>
  <a href="#" class="cart-card__image">
    <img
      src="${itemImage}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${colorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

export default class ShoppingCart {
  constructor(key = "so-cart", parentElement = ".product-list") {
    this.key = key;
    this.parentElement = parentElement;
  }

  init() {
    this.renderCartContents();
  }

  getParentElement() {
    if (typeof this.parentElement === "string") {
      return typeof document !== "undefined"
        ? document.querySelector(this.parentElement)
        : null;
    }
    return (
      this.parentElement ||
      (typeof document !== "undefined"
        ? document.querySelector(".product-list")
        : null)
    );
  }

  renderCartContents() {
    if (typeof document === "undefined") {
      return;
    }
    const parent = this.getParentElement();
    if (!parent) {
      return;
    }

    const cartItems = getLocalStorage(this.key);
    const items = Array.isArray(cartItems) ? cartItems : [];

    parent.innerHTML = "";
    renderListWithTemplate(cartItemTemplate, parent, items);
    this.attachRemoveListeners(parent);
  }

  removeItem(id) {
    const cartItems = getLocalStorage(this.key);
    if (!Array.isArray(cartItems)) return;

    const itemIndex = cartItems.findIndex(
      (item) => String(item.Id || item.id) === String(id)
    );

    if (itemIndex !== -1) {
      cartItems.splice(itemIndex, 1);
      setLocalStorage(this.key, cartItems);
      this.renderCartContents();
    }
  }

  attachRemoveListeners(parent) {
    const target =
      parent || (typeof document !== "undefined" ? document : null);
    if (!target || typeof target.querySelectorAll !== "function") return;

    const removeButtons = target.querySelectorAll(".cart-card__remove");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const id = event.target.dataset.id;
        if (id) {
          this.removeItem(id);
        }
      });
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const id = event.target.dataset.id;
          if (id) {
            this.removeItem(id);
          }
        }
      });
    });
  }
}
