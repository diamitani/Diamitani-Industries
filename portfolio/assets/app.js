// Skill & Product Library — client-side filter + search (read-only portfolio, no cart)
(function () {
  const grid = document.getElementById("grid");
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll(".card"));
  const buttons = Array.from(document.querySelectorAll(".filter-btn"));
  const search = document.getElementById("search");
  const empty = document.getElementById("empty");
  let activeCat = "all";

  function apply() {
    const q = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach((c) => {
      const okCat = activeCat === "all" || c.dataset.cat === activeCat;
      const okQ = !q || (c.dataset.search || "").includes(q);
      const show = okCat && okQ;
      c.style.display = show ? "" : "none";
      if (show) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      activeCat = b.dataset.cat;
      apply();
    })
  );
  search?.addEventListener("input", apply);
})();
