import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const imgSrc =
    product.Image ||
    product.Images?.PrimaryMedium ||
    product.Images?.PrimaryLarge ||
    product.Images?.PrimarySmall ||
    "";
  const brandName = product.Brand?.Name || "";
  const productName = product.NameWithoutBrand || product.Name || "";

  return `<li class="product-card">
    <a href="../product_pages/index.html?product=${product.Id}">
      <img
        src="${imgSrc}"
        alt="Image of ${product.Name || productName}"
      />
      <h3 class="card__brand">${brandName}</h3>
      <h2 class="card__name">${productName}</h2>
      <p class="product-card__price">$${product.FinalPrice}</p>
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement, search = null) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.search = search;
  }

  async init() {
    const titleElement = document.querySelector(".title");

    if (this.search) {
      if (titleElement) {
        titleElement.textContent = `Search: "${this.search}"`;
      }
      this.listElement.innerHTML = `<li class="loading-message">Searching products...</li>`;

      try {
        const list = await this.dataSource.searchProducts(this.search);
        if (titleElement) {
          titleElement.textContent = `Search Results for "${this.search}" (${list.length})`;
        }
        if (list && list.length > 0) {
          this.renderList(list);
        } else {
          this.listElement.innerHTML = `<li class="no-products"><p>No products found matching "<strong>${this.search}</strong>". Try a different search term!</p></li>`;
        }
      } catch (err) {
        console.error("Error during search:", err);
        this.listElement.innerHTML = `<li class="no-products"><p>Unable to retrieve search results from the API. Please try again.</p></li>`;
      }
    } else {
      const cat = this.category || "tents";
      if (titleElement) {
        const formattedCategory =
          cat.charAt(0).toUpperCase() + cat.slice(1);
        titleElement.textContent = `Top Products: ${formattedCategory.replace("-", " ")}`;
      }
      this.listElement.innerHTML = `<li class="loading-message">Loading products...</li>`;

      try {
        const list = await this.dataSource.getData(cat);
        if (list && list.length > 0) {
          this.renderList(list);
        } else {
          this.listElement.innerHTML = `<li class="no-products"><p>No products found in this category.</p></li>`;
        }
      } catch (err) {
        console.error("Error loading products:", err);
        this.listElement.innerHTML = `<li class="no-products"><p>Unable to retrieve products from the API. Please try again.</p></li>`;
      }
    }
  }

  renderList(list) {
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      "afterbegin",
      true
    );
  }
}
