/**
 * Template Name: Personal
 * Updated: Mar 17 2024 with Bootstrap v5.3.3
 * Template URL: https://bootstrapmade.com/personal-free-resume-bootstrap-template/
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */
(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Mobile nav toggle
   */
  on("click", ".mobile-nav-toggle", function (e) {
    select("body").classList.toggle("mobile-nav-active");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  /**
   * Open accordion item based on URL hash
   */
  window.addEventListener("load", () => {
    if (window.location.hash) {
      const hash = window.location.hash;
      const target = document.querySelector(hash);
      if (target && target.classList.contains("accordion-item")) {
        const button = target.querySelector(".accordion-button");
        const collapse = target.querySelector(".accordion-collapse");
        if (button && collapse) {
          button.classList.remove("collapsed");
          button.setAttribute("aria-expanded", "true");
          collapse.classList.add("show");
        }
      }
    }
  });
  const consoleStyle = [
    "background-color: #ec6602",
    "color: #121212",
    "padding: 4px 6px",
    "border-radius: 3px",
    "font-weight: bold",
  ].join(";");
  console.log(
    "%cThis website is so irrelevant it might as well be in Slough.",
    consoleStyle,
  );
})();
