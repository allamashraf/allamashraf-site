// Copy button for the public email. Confirmation goes through an aria-live region.
export {};
for (const root of document.querySelectorAll<HTMLElement>('[data-copy-email]')) {
  const button = root.querySelector<HTMLButtonElement>('[data-copy-button]');
  const status = root.querySelector<HTMLElement>('[data-copy-status]');
  const email = root.dataset['email'];
  if (!button || !status || !email) continue;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = root.dataset['copied'] ?? 'Copied';
    } catch {
      status.textContent = `Copy failed. The address is ${email}.`;
    }
  });
}
