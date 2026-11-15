// The content and source links remain usable without JavaScript.
document.querySelectorAll('.code-block').forEach(block => {
  const code = block.querySelector('pre code');
  if (!code || !navigator.clipboard) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.textContent = 'Copy';
  button.setAttribute('aria-label', 'Copy code');
  const status = document.createElement('span');
  status.className = 'copy-status';
  status.setAttribute('role', 'status');
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Copied';
      status.textContent = 'Code copied.';
    } catch {
      status.textContent = 'Could not copy. Select the code and copy it manually.';
    }
    window.setTimeout(() => { button.textContent = 'Copy'; status.textContent = ''; }, 3000);
  });
  block.append(button, status);
});

document.querySelectorAll('.prose table').forEach(table => {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Scrollable table');
  table.before(wrapper);
  wrapper.append(table);
});

const viewer = document.querySelector('#image-viewer');
if (viewer && typeof viewer.showModal === 'function') {
  document.querySelectorAll('.image-link').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const image = link.querySelector('img');
      const expanded = viewer.querySelector('img');
      expanded.src = link.href;
      expanded.alt = image.alt;
      viewer.showModal();
    });
  });
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    const rect = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) viewer.close();
  });
}
