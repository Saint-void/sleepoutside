import { setLocalStorage } from "./utils.mjs";

function productDetailsTemplate(product) {
  return `<section class="product-detail">
    <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>
    <img
      class="divider"
      src="${product.Image}"
      alt="${product.NameWithoutBrand}"
    />
    <p class="product-card__price">$${product.FinalPrice}</p>
    <p class="product__color">${product.Colors[0].ColorName}</p>
    <p class="product__description">
      ${product.DescriptionHtmlSimple}
    </p>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div>
  </section>`;
}

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // use the datasource to get the details for the current product. findProductById will return a promise! use await or .then() to process it
    this.product = await this.dataSource.findProductById(this.productId);

    if (!this.product) {
      const main = document.querySelector("main");
      if (main) {
        main.innerHTML = `<p class="error">Product not found.</p>`;
      }
      return;
    }

    // the product details are needed before rendering the HTML
    this.renderProductDetails("main");

    // once the HTML is rendered, add a listener to the Add to Cart button
    // Notice the .bind(this). This callback will not work if the bind(this) is missing. Review the readings from this week on 'this' to understand why.
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addToCart.bind(this));
  }

  addToCart() {
    setLocalStorage("so-cart", this.product);
  }

  addProductToCart() {
    this.addToCart();
  }

  renderProductDetails(selector = "main") {
    const element = document.querySelector(selector);
    if (!element) return;

    if (element.classList.contains("product-detail")) {
      element.outerHTML = productDetailsTemplate(this.product);
    } else {
      element.innerHTML = productDetailsTemplate(this.product);
    }

    document.title = `Sleep Outside | ${this.product.NameWithoutBrand}`;
  }
}
