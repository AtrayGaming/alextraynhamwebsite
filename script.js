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

if (location.pathname === '/' || location.pathname === '/index.html') {
  const legacy = {work:'/work',projects:'/work',content:'/work',archive:'/work#more-projects',experience:'/experience',proof:'/experience#training-tools',about:'/about',contact:'/contact'};
  const followLegacy = () => {
    const destination = legacy[location.hash.slice(1)];
    if (destination) {
      const target = new URL(destination, location.origin);
      target.search = location.search;
      location.replace(target.href);
    }
  };
  followLegacy();
  window.addEventListener('hashchange', followLegacy);
}
