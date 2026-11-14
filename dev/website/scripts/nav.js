/* nav.js - single source of truth for header, footer (incl. contact info) and menu.
   Edit NAV for menu items; edit CONTACT for the footer contact block. */
const NAV = [
  { label: "About",               href: "about.html" },
  { label: "Advisory",            href: "advisory.html" },
  { label: "Investment Strategy", href: "strategy.html" },
  { label: "Consulting",          href: "consulting.html" },
  { label: "Substack",            href: "https://www.5thgenfinance.com", external: true },
  { label: "Client Apps", children: [
      { label: "Retirement Planning",   href: "https://fifthgenerationadvisers.streamlit.app/", external: true },
      { label: "What's My Risk Level?", href: "risk-tolerance-quiz.html" }
  ]}
];
const CONTACT = {
  firm: "Fifth Generation Financial LLC",
  city: "Houston, Texas",
  email: "adviser@5thgenfinance.com"
};
(function () {
  const cur = location.pathname.split("/").pop() || "index.html";
  const on = h => h === cur;
  const link = i => `<a href="${i.href}"${i.external ? ' target="_blank" rel="noopener noreferrer"' : ''}${on(i.href) ? ' class="active" aria-current="page"' : ''}>${i.label}${i.external ? ' <span aria-hidden="true">&#8599;</span>' : ''}</a>`;
  const desktop = NAV.map(i => i.children
    ? `<div class="nav-dd"><button class="nav-dd-btn${i.children.some(c => on(c.href)) ? ' active' : ''}" aria-haspopup="true" aria-expanded="false">${i.label} &#9662;</button><div class="nav-dd-menu">${i.children.map(link).join("")}</div></div>`
    : link(i)).join("");
  const mobile = NAV.map(i => i.children ? `<div class="m-group">${i.label}</div>` + i.children.map(link).join("") : link(i)).join("");
  const header = `<header class="site-header"><div class="site-header-inner">
    <a class="brand-lockup" href="index.html" aria-label="Fifth Generation Advisers home"><img class="brand-logo-image" src="brand_images/navy_ribbon.png" alt="Fifth Generation Advisers" style="height:56px;width:auto"></a>
    <nav class="site-nav" aria-label="Main">${desktop}</nav>
    <button class="nav-burger" aria-label="Menu" aria-expanded="false">&#9776;</button></div>
    <nav class="mobile-nav" hidden>${mobile}</nav></header>`;
  const footer = `<footer class="site-footer" style="text-transform:none;letter-spacing:.04em">
    <div style="width:48px;height:1px;background:var(--bronze);margin:0 auto 16px"></div>
    <div style="text-transform:uppercase;letter-spacing:.18em;color:var(--bronze);font-size:.75rem;margin-bottom:8px">Contact Us</div>
    <div>${CONTACT.firm} &middot; ${CONTACT.city}</div>
    <div style="margin-bottom:16px"><a href="mailto:${CONTACT.email}" style="color:var(--offwhite)">${CONTACT.email}</a></div>
    <div style="font-size:.75rem;opacity:.8">&copy; 2026 Fifth Generation Advisers &middot; All Rights Reserved</div>
    <div style="font-size:.7rem;opacity:.55;margin-top:4px">5th Gen Finance - Software &middot; Architecture &middot; Hosting</div></footer>`;
  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);
  const b = document.querySelector(".nav-burger"), m = document.querySelector(".mobile-nav");
  b.onclick = () => { const o = m.hidden; m.hidden = !o; b.setAttribute("aria-expanded", o); };
  document.querySelectorAll(".nav-dd").forEach(x => { const btn = x.querySelector("button");
    btn.onclick = e => { e.stopPropagation(); btn.setAttribute("aria-expanded", x.classList.toggle("open")); }; });
  document.addEventListener("click", () => document.querySelectorAll(".nav-dd.open").forEach(x => x.classList.remove("open")));
})();
