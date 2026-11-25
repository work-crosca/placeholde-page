// A lightweight, accessible desktop context menu for the placeholder page.
const menu = document.querySelector('#custom-context-menu');
const toast = document.querySelector('#context-menu-toast');

if (menu && toast) {
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  const margin = 12;
  let previousFocus = null;
  let toastTimer = 0;

  function close(restoreFocus = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    if (restoreFocus && previousFocus?.isConnected && typeof previousFocus.focus === 'function') {
      previousFocus.focus({ preventScroll: true });
    }
  }

  function styled(){return window.getComputedStyle(menu).position==='fixed';}

  function open(x, y) {
    if(menu.hidden)previousFocus = document.activeElement;
    menu.hidden = false;
    // Measure after making the popup visible so it never spills off-screen.
    const bounds = menu.getBoundingClientRect();
    const maxX = Math.max(margin, window.innerWidth - bounds.width - margin);
    const maxY = Math.max(margin, window.innerHeight - bounds.height - margin);
    menu.style.left = Math.min(Math.max(margin, x), maxX) + 'px';
    menu.style.top = Math.min(Math.max(margin, y), maxY) + 'px';
    items[0]?.focus({ preventScroll: true });
  }

  function editable(target) {
    return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
  }

  function nativeMenu(target) {
    return target instanceof Element && Boolean(target.closest('a[href], img, video, audio, [download]'));
  }

  document.addEventListener('contextmenu', (event) => {
    if (event.defaultPrevented || editable(event.target) || nativeMenu(event.target) || !styled()) return;
    // Preserve the long-press and text-selection menus on touch devices.
    if (event.pointerType === 'touch' ||
        (window.matchMedia('(hover: none) and (pointer: coarse)').matches && event.button !== 2)) return;
    if (window.getSelection()?.toString().trim()) return;
    event.preventDefault();
    open(event.clientX, event.clientY);
  });

  document.addEventListener('keydown', (event) => {
    if ((event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) && !editable(event.target) && !nativeMenu(event.target) && styled()) {
      event.preventDefault();
      const focused = document.activeElement;
      const bounds = focused && focused !== document.body ? focused.getBoundingClientRect() : null;
      open(bounds ? bounds.left : window.innerWidth / 2, bounds ? bounds.bottom + 6 : window.innerHeight / 2);
      return;
    }
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'Tab') {
      close();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const index = items.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0
        : event.key === 'End' ? items.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus({ preventScroll: true });
    }
  });

  menu.addEventListener('click', (event) => {
    const action = event.target.closest('button[data-action]')?.dataset.action;
    if (!action) return;
    close(true);
    if (action === 'refresh') {
      window.location.reload();
    } else if (action === 'soon') {
      window.clearTimeout(toastTimer);
      toast.hidden = false;
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3500);
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!menu.hidden && !menu.contains(event.target)) close();
  });
  window.addEventListener('scroll', () => close(), { passive: true });
  window.addEventListener('resize', () => close());
  window.addEventListener('blur', () => close());
  document.addEventListener('visibilitychange', () => { if (document.hidden) close(); });
}
