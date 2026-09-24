// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  const stored = localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return [];
  }
}

// save data to local storage
export function setLocalStorage(key, data) {
  if (Array.isArray(data)) {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    const currentItems = getLocalStorage(key);
    const nextItems = Array.isArray(currentItems)
      ? [...currentItems, data]
      : [data];

    localStorage.setItem(key, JSON.stringify(nextItems));
  }
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// get URL parameter
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// render template into a parent element
export function renderWithTemplate(template, parentElement, data, callback) {
  if (!parentElement) return;
  if (parentElement.insertAdjacentHTML) {
    parentElement.insertAdjacentHTML("afterbegin", template);
  } else {
    parentElement.innerHTML = template;
  }
  if (callback) {
    callback(data);
  }
}

// render a list of items using a template function
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (!parentElement) return;
  const htmlStrings = list.map(templateFn);
  if (clear) {
    parentElement.innerHTML = "";
  }
  if (parentElement.insertAdjacentHTML) {
    parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
  } else {
    parentElement.innerHTML = htmlStrings.join("");
  }
}

// load an HTML template from path
export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

// load header and footer partials into DOM
export async function loadHeaderFooter(callback) {
  if (typeof window === "undefined") {
    return;
  }
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");

  const headerElement = qs("#main-header") || qs("header");
  const footerElement = qs("#main-footer") || qs("footer");

  renderWithTemplate(headerTemplate, headerElement, null, callback);
  renderWithTemplate(footerTemplate, footerElement);
}

