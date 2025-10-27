// Plik: scripts/modal.js (WERSJA OSTATECZNA, KOMPLETNA I POPRAWNA)
document.addEventListener('DOMContentLoaded', () => {
    // Funkcja pomocnicza do obsługi modali
    const setupModal = (overlayId, closeBtnId) => {
        const modal = document.getElementById(overlayId);
        const closeBtn = document.getElementById(closeBtnId);
        if (modal && closeBtn) {
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
    };

    // Ustawienie wszystkich modali
    setupModal('guide-modal-overlay', 'close-guide-modal-btn');
    setupModal('joker-modal-overlay', 'close-joker-modal-btn');
    setupModal('personality-modal-overlay', 'close-personality-modal-btn');
    setupModal('todo-modal-overlay', 'close-todo-modal-btn');
    setupModal('forgotten-modal-overlay', 'close-forgotten-modal-btn');
});