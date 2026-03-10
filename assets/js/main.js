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
       Homepage publications feed — 5 most recent publications
    ------------------------------------------------------- */
    function renderPublicationsFeed(events) {
        var container = select("#publications-home");
        if (!container) return;

        var pubs = events
            .filter(function (ev) { return ev.category === "Publication"; })
            .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
            .slice(0, 5);

        if (pubs.length === 0) return;

        var html = '<ul class="feed-list">';
        pubs.forEach(function (ev) {
            html += renderMinimalItem(ev);
        });
        html += '</ul>';

        container.innerHTML = html;
    }

    /* -------------------------------------------------------
       Homepage feed: minimal list — next 3 upcoming + recent 7
       Clean date + title lines, expand toggle for overflow.
    ------------------------------------------------------- */
    function renderMinimalItem(ev) {
        var titleInner = ev.link
            ? '<a href="' + ev.link + '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(ev.title) + "</a>"
            : escapeHtml(ev.title);

        return (
            '<li class="feed-item">' +
                '<span class="feed-date">' + formatDate(ev.date) + "</span>" +
                '<span class="event-category ' + categoryClass(ev.category) + '">' +
                    escapeHtml(ev.category) +
                "</span>" +
                '<span class="feed-title">' + titleInner + "</span>" +
            "</li>"
        );
    }

    function renderHomeFeed(events) {
        var container = select("#events-home");
        if (!container) return;

        /* Filter out publications — they have their own section */
        var filtered = events.filter(function (ev) {
            return ev.category !== "Publication";
        });
        var split = splitEvents(filtered);
        var html = "";

        if (split.upcoming.length > 0) {
            var upcomingPreview = 3;
            var hasMoreUpcoming = split.upcoming.length > upcomingPreview;

            html += '<div class="events-subsection">';
            html += '<p class="events-subsection-title">' +
                        'upcoming' +
                        (hasMoreUpcoming
                            ? ' <button class="expand-toggle" aria-expanded="false" data-target="upcoming-extra">' +
                              '<i class="bi bi-chevron-down"></i></button>'
                            : '') +
                    '</p>';
            html += '<ul class="feed-list">';
            split.upcoming.slice(0, upcomingPreview).forEach(function (ev) {
                html += renderMinimalItem(ev);
            });
            html += '</ul>';
            if (hasMoreUpcoming) {
                html += '<ul id="upcoming-extra" class="feed-list events-extra" hidden>';
                split.upcoming.slice(upcomingPreview).forEach(function (ev) {
                    html += renderMinimalItem(ev);
                });
                html += '</ul>';
            }
            html += '</div>';
        }

        if (split.recent.length > 0) {
            var recentPreview = 7;
            var hasMoreRecent = split.recent.length > recentPreview;

            html += '<div class="events-subsection">';
            html += '<p class="events-subsection-title">' +
                        'recent' +
                        (hasMoreRecent
                            ? ' <button class="expand-toggle" aria-expanded="false" data-target="recent-extra">' +
                              '<i class="bi bi-chevron-down"></i></button>'
                            : '') +
                    '</p>';
            html += '<ul class="feed-list">';
            split.recent.slice(0, recentPreview).forEach(function (ev) {
                html += renderMinimalItem(ev);
            });
            html += '</ul>';
            if (hasMoreRecent) {
                html += '<ul id="recent-extra" class="feed-list events-extra" hidden>';
                split.recent.slice(recentPreview).forEach(function (ev) {
                    html += renderMinimalItem(ev);
                });
                html += '</ul>';
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
       Policy & Industry feed — minimal lists grouped by section
    ------------------------------------------------------- */
    function renderPolicyFeed(events) {
        var container = select("#policy-feed");
        if (!container) return;

        var sections = [
            { label: "industry talks", filter: function (ev) { return (ev.category === "Talk" || ev.category === "Conference") && ev.grouping === "industry"; } },
            { label: "op-eds & commentary", filter: function (ev) { return ev.category === "Op-Ed"; } },
            { label: "media mentions", filter: function (ev) { return ev.category === "Media"; } }
        ];

        var html = "";
        sections.forEach(function (sec) {
            var items = events.filter(sec.filter);
            if (items.length === 0) return;

            items.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            html += '<div class="events-subsection">';
            html += '<p class="events-subsection-title">' + sec.label + '</p>';
            html += '<ul class="feed-list">';
            items.forEach(function (ev) {
                html += renderMinimalItem(ev);
            });
            html += '</ul>';
            html += '</div>';
        });

        container.innerHTML = html;
    }

    /* -------------------------------------------------------
       Load events and render wherever needed
       Uses window.SITE_EVENTS (set by data/events.js) for
       file:// protocol compatibility.
    ------------------------------------------------------- */
    if (window.SITE_EVENTS) {
        renderPublicationsFeed(window.SITE_EVENTS);
        renderHomeFeed(window.SITE_EVENTS);
        renderPolicyFeed(window.SITE_EVENTS);
    }
})();
