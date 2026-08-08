// ===== CHAPIDU - Modal Component =====

export function showModal({ title, message, content, onConfirm, confirmText = 'Aceptar', cancelText = 'Cancelar', showCancel = true }) {
  const existing = document.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h2>${title}</h2>
      ${message ? `<p>${message}</p>` : ''}
      <div class="modal-content">${content || ''}</div>
      <div class="modal-actions">
        ${showCancel ? `<button class="btn btn-outline btn-sm modal-cancel">${cancelText}</button>` : ''}
        <button class="btn btn-secondary btn-sm modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('active'));

  const close = () => {
    backdrop.classList.remove('active');
    setTimeout(() => backdrop.remove(), 300);
  };

  backdrop.querySelector('.modal-cancel')?.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('.modal-confirm').addEventListener('click', () => {
    if (onConfirm) onConfirm(backdrop);
    close();
  });

  return { close, element: backdrop };
}
