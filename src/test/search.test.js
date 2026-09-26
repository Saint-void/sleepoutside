/** @jest-environment node */

import ProductData from "../js/ProductData.mjs";

describe("ProductData search functionality", () => {
  let productData;

  beforeEach(() => {
    productData = new ProductData();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns an empty array when search query is empty or whitespace", async () => {
    const results = await productData.searchProducts("");
    expect(results).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();

    const wsResults = await productData.searchProducts("   ");
    expect(wsResults).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("retrieves products from the API matching the search query", async () => {
    const mockProducts = [
      {
        Id: "989CG",
        Name: "The North Face Talus Tent - 3-Person, 3-Season",
        NameWithoutBrand: "Talus Tent - 3-Person, 3-Season",
        Brand: { Name: "The North Face" },
        FinalPrice: 179.99,
        Category: "tents",
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const results = await productData.searchProducts("talus");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("products?q=talus"),
    );
    expect(results).toHaveLength(1);
    expect(results[0].Id).toBe("989CG");
  });

  test("ranks exact title/brand matches higher than description-only matches", async () => {
    const mockProducts = [
      {
        Id: "DESC_ONLY",
        Name: "Camp Stove",
        NameWithoutBrand: "Stove",
        Brand: { Name: "Generic" },
        DescriptionHtmlSimple: "Great to use near your tent",
        Category: "accessories",
      },
      {
        Id: "TITLE_MATCH",
        Name: "Marmot Ajax Tent",
        NameWithoutBrand: "Ajax Tent",
        Brand: { Name: "Marmot" },
        DescriptionHtmlSimple: "Top quality tent",
        Category: "tents",
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const results = await productData.searchProducts("tent");
    expect(results).toHaveLength(2);
    expect(results[0].Id).toBe("TITLE_MATCH");
    expect(results[1].Id).toBe("DESC_ONLY");
  });

  test("handles API errors gracefully without throwing", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network failed"));

    const results = await productData.searchProducts("error-test");
    expect(results).toEqual([]);
  });
});
