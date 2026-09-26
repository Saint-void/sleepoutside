import { loadHeaderFooter, getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

loadHeaderFooter();

const search = getParam("search") || getParam("q");
const category = getParam("category");
const dataSource = new ProductData(category);
const listElement = document.querySelector(".product-list");
const myList = new ProductList(category, dataSource, listElement, search);

myList.init();
