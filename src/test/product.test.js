/** @jest-environment node */

import { getLocalStorage, setLocalStorage } from "../js/utils.mjs";

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

describe("cart storage", () => {
  beforeEach(() => {
    global.localStorage = createLocalStorageMock();
  });

  test("returns an empty array when cart is missing", () => {
    expect(getLocalStorage("so-cart")).toEqual([]);
  });

  test("adds products to the existing cart instead of replacing it", () => {
    const firstProduct = { Id: "1", Name: "Tent A" };
    const secondProduct = { Id: "2", Name: "Tent B" };

    setLocalStorage("so-cart", firstProduct);
    setLocalStorage("so-cart", secondProduct);

    expect(JSON.parse(global.localStorage.getItem("so-cart"))).toEqual([
      firstProduct,
      secondProduct,
    ]);
  });
});
