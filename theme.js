(() => {
  const preferenceKey = 'nido-del-cuervo-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let manualTheme = readPreference();
  let button;

  function readPreference() {
    try {
      const value = window.localStorage.getItem(preferenceKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  function updateButton(theme) {
    if (!button) return;
    const destination = theme === 'dark' ? 'light' : 'dark';
    button.querySelector('[data-theme-label]').textContent = destination === 'light' ? 'Tema claro' : 'Tema oscuro';
    button.querySelector('[data-theme-icon="light"]').toggleAttribute('hidden', theme !== 'light');
    button.querySelector('[data-theme-icon="dark"]').toggleAttribute('hidden', theme !== 'dark');
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#16161d' : '#f3f4f7';
    updateButton(theme);
  }

  function toggleTheme() {
    manualTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(manualTheme);
    try {
      window.localStorage.setItem(preferenceKey, manualTheme);
    } catch {
      return;
    }
  }

  applyTheme(manualTheme ?? (systemTheme.matches ? 'dark' : 'light'));
  systemTheme.addEventListener('change', event => {
    if (!manualTheme) applyTheme(event.matches ? 'dark' : 'light');
  });
  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('#theme-toggle');
    updateButton(document.documentElement.dataset.theme);
    button.hidden = false;
    button.addEventListener('click', toggleTheme);
  });
})();
