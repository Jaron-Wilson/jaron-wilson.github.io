// In-page links land with the section's heading centered in the viewport,
// instead of the browser default (heading flush against the top, often
// half-hidden under the sticky nav) - so you don't have to hunt for it.
(function () {
  function centerOn(target) {
    if (!target) return;
    var heading = target.querySelector(".heading") || target;
    heading.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href").slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    centerOn(target);
    if (window.history && history.pushState) {
      history.pushState(null, "", "#" + id);
    } else {
      location.hash = id;
    }
  });

  // Landing directly on a link with a hash (e.g. a shared /#projects URL)
  // should center it too, once layout and fonts have settled.
  if (location.hash) {
    var initialTarget = document.getElementById(location.hash.slice(1));
    if (initialTarget) {
      window.addEventListener("load", function () {
        centerOn(initialTarget);
      });
    }
  }
})();
