document.documentElement.classList.add("js");
const toggle = document.querySelector(".menu-toggle");
const links = document.getElementById("navLinks");
function closeMenu(restoreFocus = false) {
  if (!toggle || !links) return;
  links.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "Menu";
  if (restoreFocus) toggle.focus();
}
toggle?.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Close" : "Menu";
});
links
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && links?.classList.contains("open"))
    closeMenu(true);
});
document.querySelectorAll("[data-video]").forEach((button) => {
  button.addEventListener("click", () => {
    const shell = button.closest(".video-shell");
    const frame = shell.querySelector("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?rel=0`;
    frame.hidden = false;
    shell.querySelector(".video-placeholder").hidden = true;
    frame.focus();
  });
});

// Perspective switcher: content remains fully available when JavaScript is absent.
const lensControls = document.querySelector(".lens-controls");
if (lensControls) {
  const panels = [...document.querySelectorAll(".lens-panel")];
  const buttons = [...lensControls.querySelectorAll("button")];
  const selectLens = (button) => {
    buttons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    panels.forEach((panel) => {
      panel.hidden = panel.id !== button.getAttribute("aria-controls");
    });
  };
  buttons.forEach((button) =>
    button.addEventListener("click", () => selectLens(button)),
  );
  selectLens(buttons[0]);
  lensControls.hidden = false;
}

// The storyboard is an editorial prototype, with no simulated audience data.
const storyboard = document.querySelector(".storyboard");
const storyControls = document.querySelector(".story-controls");
if (storyboard && storyControls) {
  const frames = [...storyboard.querySelectorAll(".story-frame")];
  const buttonGroup = storyControls.querySelector(".story-buttons");
  const position = storyControls.querySelector(".story-position");
  const buttons = frames.map((frame, index) => {
    const button = document.createElement("button");
    frame.id = `story-beat-${index + 1}`;
    button.type = "button";
    button.textContent = String(index + 1).padStart(2, "0");
    button.setAttribute("aria-controls", frame.id);
    button.setAttribute(
      "aria-label",
      `Beat ${index + 1}: ${frame.querySelector("h4").textContent}`,
    );
    button.addEventListener("click", () => showFrame(index));
    buttonGroup.append(button);
    return button;
  });
  function showFrame(index) {
    frames.forEach((frame, i) => {
      frame.hidden = i !== index;
    });
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    position.textContent = `Beat ${index + 1} of ${frames.length} · ${frames[index].querySelector(".frame-heading span").textContent} in the proposed edit`;
  }
  showFrame(0);
  storyboard.classList.add("is-stepped");
  storyControls.hidden = false;
}

// Restore useful section awareness from the early site, without hiding content.
const homeSections = [...document.querySelectorAll(".home main > section[id]")];
if ("IntersectionObserver" in window && homeSections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        document.querySelectorAll(".nav-links a").forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-15% 0px -65% 0px" },
  );
  homeSections.forEach((section) => observer.observe(section));
}
// A desktop resize should not leave a mobile menu in its open state.
window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
