document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const links = document.getElementById('navLinks');
function closeMenu(restoreFocus = false) {
  if (!toggle || !links) return;
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Menu';
  if (restoreFocus) toggle.focus();
}
toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
});
links?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && links?.classList.contains('open')) closeMenu(true);
});
document.querySelectorAll('[data-video]').forEach(button => {
  button.addEventListener('click', () => {
    const shell = button.closest('.video-shell');
    const frame = shell.querySelector('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?rel=0`;
    frame.hidden = false;
    shell.querySelector('.video-placeholder').hidden = true;
    frame.focus();
  });
});
