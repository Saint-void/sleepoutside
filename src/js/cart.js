import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export function removeItemFromCart(id) {
  const cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) return;

  const itemIndex = cartItems.findIndex(
    (item) => String(item.Id || item.id) === String(id)
  );

  if (itemIndex !== -1) {
    cartItems.splice(itemIndex, 1);
    setLocalStorage("so-cart", cartItems);
    renderCartContents();
  }
}

function handleRemoveClick(event) {
  const id = event.target.dataset.id;
  if (id) {
    removeItemFromCart(id);
  }
}

function handleRemoveKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleRemoveClick(event);
  }
}

function attachRemoveListeners() {
  const removeButtons = document.querySelectorAll(".cart-card__remove");
  removeButtons.forEach((button) => {
    button.addEventListener("click", handleRemoveClick);
    button.addEventListener("keydown", handleRemoveKeydown);
  });
}

export function renderCartContents() {
  if (typeof document === "undefined") {
    return;
  }
  const productList = document.querySelector(".product-list");
  const cartItems = getLocalStorage("so-cart");

  if (!productList) {
    return;
  }

  const htmlItems = Array.isArray(cartItems)
    ? cartItems.map((item) => cartItemTemplate(item))
    : [];

  productList.innerHTML = htmlItems.join("");
  attachRemoveListeners();
}

export function cartItemTemplate(item) {
  const colorName =
    item.Colors && item.Colors[0] ? item.Colors[0].ColorName : "";
  const itemId = item.Id || item.id;

  const newItem = `<li class="cart-card divider">
  <span class="cart-card__remove" role="button" tabindex="0" data-id="${itemId}" aria-label="Remove ${item.Name || "item"} from cart">X</span>
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
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

if (typeof document !== "undefined") {
  renderCartContents();
}
