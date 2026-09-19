/** @jest-environment node */

import { getLocalStorage, setLocalStorage } from "../js/utils.mjs";
import {
  cartItemTemplate,
  removeItemFromCart,
  renderCartContents,
} from "../js/cart.js";

const createLocalStorageMock = () => {
  let store = {};

  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
  };
};

describe("Cart removal functionality", () => {
  let productListMock;

  beforeEach(() => {
    global.localStorage = createLocalStorageMock();
    productListMock = {
      innerHTML: "",
      querySelectorAll: () => [],
    };
    global.document = {
      querySelector: (selector) => {
        if (selector === ".product-list") return productListMock;
        return null;
      },
      querySelectorAll: () => [],
    };
  });

  test("cartItemTemplate renders an X element with data-id", () => {
    const item = {
      Id: "880RR",
      Name: "Marmot Ajax Tent",
      Image: "/images/tent.jpg",
      Colors: [{ ColorName: "Terra Cotta" }],
      FinalPrice: 199.99,
    };

    const html = cartItemTemplate(item);

    expect(html).toContain("data-id=\"880RR\"");
    expect(html).toContain("class=\"cart-card__remove\"");
    expect(html).toContain(">X</span>");
  });

  test("setLocalStorage overwrites the store when passed an array", () => {
    const items = [
      { Id: "1", Name: "Tent A" },
      { Id: "2", Name: "Tent B" },
    ];

    setLocalStorage("so-cart", items);
    expect(getLocalStorage("so-cart")).toEqual(items);

    const updatedItems = [{ Id: "2", Name: "Tent B" }];
    setLocalStorage("so-cart", updatedItems);
    expect(getLocalStorage("so-cart")).toEqual(updatedItems);
  });

  test("removeItemFromCart removes the item with matching id from localStorage", () => {
    const item1 = {
      Id: "880RR",
      Name: "Marmot Ajax",
      Colors: [{ ColorName: "Orange" }],
      FinalPrice: 199.99,
    };
    const item2 = {
      Id: "985RF",
      Name: "The North Face Talus",
      Colors: [{ ColorName: "Yellow" }],
      FinalPrice: 199.99,
    };

    setLocalStorage("so-cart", [item1, item2]);
    expect(getLocalStorage("so-cart")).toHaveLength(2);

    removeItemFromCart("880RR");

    const remaining = getLocalStorage("so-cart");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].Id).toBe("985RF");
  });

  test("removeItemFromCart removes only one item when duplicate items are in cart", () => {
    const item1 = {
      Id: "880RR",
      Name: "Marmot Ajax",
      Colors: [{ ColorName: "Orange" }],
      FinalPrice: 199.99,
    };
    const item2 = {
      Id: "880RR",
      Name: "Marmot Ajax",
      Colors: [{ ColorName: "Orange" }],
      FinalPrice: 199.99,
    };

    setLocalStorage("so-cart", [item1, item2]);
    expect(getLocalStorage("so-cart")).toHaveLength(2);

    removeItemFromCart("880RR");

    const remaining = getLocalStorage("so-cart");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].Id).toBe("880RR");
  });

  test("renderCartContents updates DOM and attaches listeners without error", () => {
    const item = {
      Id: "880RR",
      Name: "Marmot Ajax Tent",
      Colors: [{ ColorName: "Terra Cotta" }],
      FinalPrice: 199.99,
    };

    setLocalStorage("so-cart", [item]);
    renderCartContents();

    expect(productListMock.innerHTML).toContain("data-id=\"880RR\"");
  });
});
