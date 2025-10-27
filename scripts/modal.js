// Plik: scripts/modal.js
document.addEventListener('DOMContentLoaded', () => {
    // Modal poradnika
    const guideModal = document.getElementById('guide-modal-overlay');
    const openGuideBtn = document.getElementById('open-guide-btn');
    // 👇 POPRAWIONE ID PRZYCISKU ZAMYKANIA 👇
    const closeGuideBtn = document.getElementById('close-guide-modal-btn'); 
    
    if (guideModal && openGuideBtn && closeGuideBtn) {
        openGuideBtn.addEventListener('click', () => guideModal.style.display = 'block');
        closeGuideBtn.addEventListener('click', () => guideModal.style.display = 'none');
        guideModal.addEventListener('click', (e) => { if (e.target === guideModal) guideModal.style.display = 'none'; });
    }

    // Modal Jokera
    const jokerModal = document.getElementById('joker-modal-overlay');
    const closeJokerBtn = document.getElementById('close-joker-modal-btn');

    if (jokerModal && closeJokerBtn) {
        closeJokerBtn.addEventListener('click', () => jokerModal.style.display = 'none');
        jokerModal.addEventListener('click', (e) => { if (e.target === jokerModal) jokerModal.style.display = 'none'; });
    }
});