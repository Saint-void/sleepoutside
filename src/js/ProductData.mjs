let rawBaseURL = "https://wdd330-backend-osp8.onrender.com/";
try {
  const envUrl = new Function("return import.meta.env.VITE_SERVER_URL")();
  if (envUrl) {
    rawBaseURL = envUrl;
  }
} catch {
  // Not in Vite environment
}
const baseURL = rawBaseURL.endsWith("/") ? rawBaseURL : `${rawBaseURL}/`;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  constructor(category) {
    this.category = category;
  }

  async getData(category) {
    const cat = category || this.category || "tents";
    try {
      const response = await fetch(`${baseURL}products/search/${cat}`);
      const data = await convertToJson(response);
      return data.Result || data;
    } catch {
      let metaUrl = "";
      try {
        metaUrl = new Function("return import.meta.url")();
      } catch {
        // Not in ESM
      }
      const path = metaUrl
        ? new URL(`../json/${cat}.json`, metaUrl).href
        : `../json/${cat}.json`;
      return fetch(path)
        .then(convertToJson)
        .then((data) => data);
    }
  }

  async findProductById(id) {
    try {
      const response = await fetch(`${baseURL}product/${id}`);
      const data = await convertToJson(response);
      return data.Result || data;
    } catch {
      const products = await this.getData(this.category);
      return products.find((item) => item.Id === id);
    }
  }

  async searchProducts(query) {
    if (!query) return [];
    const trimmed = query.trim();
    if (!trimmed) return [];
    const normalized = trimmed.toLowerCase();

    try {
      // 1. Search products from API using ?q= query param
      const response = await fetch(
        `${baseURL}products?q=${encodeURIComponent(trimmed)}`
      );
      const data = await convertToJson(response);
      let results = Array.isArray(data) ? data : data.Result || [];

      // 2. If no results, check if the query corresponds to a category search
      if (results.length === 0) {
        const catRes = await fetch(
          `${baseURL}products/search/${encodeURIComponent(normalized)}`
        );
        if (catRes.ok) {
          const catData = await convertToJson(catRes);
          if (Array.isArray(catData.Result)) {
            results = catData.Result;
          }
        }
      }

      // 3. If still empty, fetch entire catalog from API and perform client filter
      if (results.length === 0) {
        const allRes = await fetch(`${baseURL}products`);
        if (allRes.ok) {
          const allProducts = await convertToJson(allRes);
          if (Array.isArray(allProducts)) {
            results = allProducts.filter((product) => {
              const name = (product.Name || "").toLowerCase();
              const brand = (product.Brand?.Name || "").toLowerCase();
              const nameWithoutBrand = (
                product.NameWithoutBrand || ""
              ).toLowerCase();
              const category = (product.Category || "").toLowerCase();
              return (
                name.includes(normalized) ||
                brand.includes(normalized) ||
                nameWithoutBrand.includes(normalized) ||
                category.includes(normalized)
              );
            });
          }
        }
      }

      // Rank results so direct title/brand/category matches appear first
      results.sort((a, b) => {
        const aName = (a.Name || "").toLowerCase().includes(normalized);
        const bName = (b.Name || "").toLowerCase().includes(normalized);
        const aBrand = (a.Brand?.Name || "").toLowerCase().includes(normalized);
        const bBrand = (b.Brand?.Name || "").toLowerCase().includes(normalized);
        const aCat = (a.Category || "").toLowerCase() === normalized;
        const bCat = (b.Category || "").toLowerCase() === normalized;

        const aScore = (aName ? 3 : 0) + (aBrand ? 2 : 0) + (aCat ? 2 : 0);
        const bScore = (bName ? 3 : 0) + (bBrand ? 2 : 0) + (bCat ? 2 : 0);
        return bScore - aScore;
      });

      return results;
    } catch (err) {
      console.error("Error retrieving search results from API:", err);
      return [];
    }
  }
}
