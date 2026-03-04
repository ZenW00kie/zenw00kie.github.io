(function () {
    "use strict";

    /* -------------------------------------------------------
       Helpers
    ------------------------------------------------------- */
    var select = function (el, all) {
        el = el.trim();
        if (all) return [].slice.call(document.querySelectorAll(el));
        return document.querySelector(el);
    };

    var on = function (type, el, listener, all) {
        var targets = select(el, all);
        if (all && targets) {
            targets.forEach(function (e) { e.addEventListener(type, listener); });
        } else if (targets) {
            targets.addEventListener(type, listener);
        }
    };

    /* -------------------------------------------------------
       Mobile nav toggle
    ------------------------------------------------------- */
    on("click", ".mobile-nav-toggle", function () {
        select("#navbar").classList.toggle("navbar-mobile");
        this.classList.toggle("bi-list");
        this.classList.toggle("bi-x");
    });

    /* -------------------------------------------------------
       Nav link click — close mobile nav if open
    ------------------------------------------------------- */
    on(
        "click",
        ".navbar a",
        function () {
            var navbar = select("#navbar");
            if (navbar.classList.contains("navbar-mobile")) {
                navbar.classList.remove("navbar-mobile");
                var toggle = select(".mobile-nav-toggle");
                if (toggle) {
                    toggle.classList.add("bi-list");
                    toggle.classList.remove("bi-x");
                }
            }
        },
        true
    );

    /* -------------------------------------------------------
       Console easter egg
    ------------------------------------------------------- */
    console.log(
        "%cThis website is so irrelevant it might as well be in Slough.",
        "background:#C85A17;color:#fff;padding:6px 12px;border-radius:3px;font-size:13px;"
    );

    /* -------------------------------------------------------
       Events feed — shared rendering utilities
    ------------------------------------------------------- */
    function formatDate(dateStr) {
        var d = new Date(dateStr + "T00:00:00");
        var months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    }

    function categoryClass(cat) {
        return "cat-" + cat.toLowerCase().replace(/\s+/g, "-");
    }

    function renderEventItem(ev) {
        var titleInner = ev.link
            ? '<a href="' + ev.link + '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(ev.title) + "</a>"
            : escapeHtml(ev.title);

        return (
            '<div class="event-item">' +
                '<div class="event-meta">' +
                    '<span class="event-date">' + formatDate(ev.date) + "</span>" +
                    '<span class="event-category ' + categoryClass(ev.category) + '">' +
                        escapeHtml(ev.category) +
                    "</span>" +
                "</div>" +
                '<h4 class="event-title">' + titleInner + "</h4>" +
                '<p class="event-description">' + escapeHtml(ev.description) + "</p>" +
            "</div>"
        );
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function splitEvents(events) {
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        var upcoming = [];
        var recent = [];

        events.forEach(function (ev) {
            var evDate = new Date(ev.date + "T00:00:00");
            if (evDate >= now) {
                upcoming.push(ev);
            } else {
                recent.push(ev);
            }
        });

        // Upcoming: soonest first
        upcoming.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
        // Recent: most recent first
        recent.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        return { upcoming: upcoming, recent: recent };
    }

    /* -------------------------------------------------------
       Homepage feed: next 3 upcoming + most recent 7
       Both sections are expandable if more items exist.
    ------------------------------------------------------- */
    function renderHomeFeed(events) {
        var container = select("#events-home");
        if (!container) return;

        var split = splitEvents(events);
        var html = "";

        if (split.upcoming.length > 0) {
            var upcomingPreview = 3;
            var hasMoreUpcoming = split.upcoming.length > upcomingPreview;

            html += '<div class="events-subsection">';
            html += '<p class="events-subsection-title">' +
                        'Upcoming' +
                        (hasMoreUpcoming
                            ? ' <button class="expand-toggle" aria-expanded="false" data-target="upcoming-extra">' +
                              '<i class="bi bi-chevron-down"></i></button>'
                            : '') +
                    '</p>';
            split.upcoming.slice(0, upcomingPreview).forEach(function (ev) {
                html += renderEventItem(ev);
            });
            if (hasMoreUpcoming) {
                html += '<div id="upcoming-extra" class="events-extra" hidden>';
                split.upcoming.slice(upcomingPreview).forEach(function (ev) {
                    html += renderEventItem(ev);
                });
                html += '</div>';
            }
            html += '</div>';
        }

        if (split.recent.length > 0) {
            var recentPreview = 7;
            var hasMoreRecent = split.recent.length > recentPreview;

            html += '<div class="events-subsection">';
            html += '<p class="events-subsection-title">' +
                        'Recent' +
                        (hasMoreRecent
                            ? ' <button class="expand-toggle" aria-expanded="false" data-target="recent-extra">' +
                              '<i class="bi bi-chevron-down"></i></button>'
                            : '') +
                    '</p>';
            split.recent.slice(0, recentPreview).forEach(function (ev) {
                html += renderEventItem(ev);
            });
            if (hasMoreRecent) {
                html += '<div id="recent-extra" class="events-extra" hidden>';
                split.recent.slice(recentPreview).forEach(function (ev) {
                    html += renderEventItem(ev);
                });
                html += '</div>';
            }
            html += '</div>';
        }

        container.innerHTML = html;

        /* Wire up expand/collapse toggles */
        var toggles = container.querySelectorAll(".expand-toggle");
        toggles.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var targetId = btn.getAttribute("data-target");
                var target = document.getElementById(targetId);
                var icon = btn.querySelector("i");
                if (!target) return;

                var expanded = btn.getAttribute("aria-expanded") === "true";
                if (expanded) {
                    target.hidden = true;
                    btn.setAttribute("aria-expanded", "false");
                    icon.className = "bi bi-chevron-down";
                } else {
                    target.hidden = false;
                    btn.setAttribute("aria-expanded", "true");
                    icon.className = "bi bi-chevron-up";
                }
            });
        });
    }

    /* -------------------------------------------------------
       Talks renderer — flat list, filtered by grouping
       Used on research.html (academic) and policy.html (industry)
    ------------------------------------------------------- */
    function renderTalks(events, containerId, grouping) {
        var container = select(containerId);
        if (!container) return;

        var talks = events.filter(function (ev) {
            return ev.category === "Talk" && ev.grouping === grouping;
        });

        // Sort: most recent first
        talks.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        var html = "";
        talks.forEach(function (ev) {
            html += renderEventItem(ev);
        });

        container.innerHTML = html;
    }

    /* -------------------------------------------------------
       Category list renderer — flat list, filtered by category
       Used for media mentions and op-eds on policy.html
    ------------------------------------------------------- */
    function renderByCategory(events, containerId, category) {
        var container = select(containerId);
        if (!container) return;

        var items = events.filter(function (ev) {
            return ev.category === category;
        });

        // Sort: most recent first
        items.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        var html = "";
        items.forEach(function (ev) {
            html += renderEventItem(ev);
        });

        container.innerHTML = html;
    }

    /* -------------------------------------------------------
       Load events and render wherever needed
       Uses window.SITE_EVENTS (set by data/events.js) for
       file:// protocol compatibility.
    ------------------------------------------------------- */
    if (window.SITE_EVENTS) {
        renderHomeFeed(window.SITE_EVENTS);
        renderTalks(window.SITE_EVENTS, "#academic-talks", "academic");
        renderTalks(window.SITE_EVENTS, "#industry-talks", "industry");
        renderByCategory(window.SITE_EVENTS, "#media-mentions", "Media");
        renderByCategory(window.SITE_EVENTS, "#op-eds", "Op-Ed");
    }
})();
