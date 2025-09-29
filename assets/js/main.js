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
    select("#navbar").classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on(
    "click",
    "#navbar .nav-link",
    function (e) {
      if (this.hash) {
        const section = select(this.hash);
        if (section) {
          e.preventDefault();

          let navbar = select("#navbar");
          let header = select("#header");
          let sections = select("section", true);
          let navlinks = select("#navbar .nav-link", true);

          navlinks.forEach((item) => {
            item.classList.remove("active");
          });

          this.classList.add("active");

          if (navbar.classList.contains("navbar-mobile")) {
            navbar.classList.remove("navbar-mobile");
            let navbarToggle = select(".mobile-nav-toggle");
            navbarToggle.classList.toggle("bi-list");
            navbarToggle.classList.toggle("bi-x");
          }

          if (this.hash == "#header") {
            header.classList.remove("header-top");
            sections.forEach((item) => {
              item.classList.remove("section-show");
            });
            return;
          }

          if (!header.classList.contains("header-top")) {
            header.classList.add("header-top");
            setTimeout(function () {
              sections.forEach((item) => {
                item.classList.remove("section-show");
              });
              section.classList.add("section-show");
            }, 350);
          } else {
            sections.forEach((item) => {
              item.classList.remove("section-show");
            });
            section.classList.add("section-show");
          }

          scrollto(this.hash);
        }
      }
    },
    true,
  );

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
