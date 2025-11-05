// ==========================================================
// PLIK: index-files/scripts/modals.js
// Obsługa wszystkich modali (tracker + import)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("💾 modals.js załadowany!");

  // === TRACKER MODAL (NO IMPORT DATA) ===
  const noImportModal = document.getElementById("no-import-modal");
  const trackerCard = document.getElementById("gstakes-card");

  const readImportData = () =>
    localStorage.getItem("saveData") || localStorage.getItem("importData");

  if (noImportModal && trackerCard) {
    trackerCard.addEventListener("click", (e) => {
      const data = readImportData();
      console.log("Kliknięto w tracker, importData:", data);
      if (!data || data.length === 0) {
        noImportModal.style.display = "flex";
        e.stopPropagation();
      }
    });

    noImportModal.addEventListener("click", (ev) => {
      if (ev.target === noImportModal) {
        noImportModal.style.display = "none";
      }
    });

    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && noImportModal.style.display !== "none") {
        noImportModal.style.display = "none";
      }
    });
  }

  // === IMPORT MODAL (TRZECIA KARTA) ===
  const importCard = document.getElementById("import-card-wrapper");
  const importModal = document.getElementById("save-modal");
  const okBtn = importModal ? importModal.querySelector(".modal-ok") : null;

  if (importCard && importModal && okBtn) {
    importCard.addEventListener("click", (e) => {
      console.log("✅ Kliknięto w trzecią kartę (Import)");
      importModal.style.display = "flex";
      e.stopPropagation();
    });

    okBtn.addEventListener("click", () => {
      console.log("✅ Kliknięto OK — zamykam modal");
      importModal.style.display = "none";
    });

    importModal.addEventListener("click", (ev) => {
      if (ev.target === importModal) {
        importModal.style.display = "none";
      }
    });

    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && importModal.style.display !== "none") {
        importModal.style.display = "none";
      }
    });
  } else {
    console.warn("❌ Nie znaleziono elementów dla modala importu.");
  }

  // === NO DATA BANNER ===
  checkLocalStorageData();
  setTimeout(checkLocalStorageData, 150);
});

function checkLocalStorageData() {
  const saveData = localStorage.getItem("saveData");
  const importData = localStorage.getItem("importData");
  const hasData = saveData || importData;
  const noDataBanner = document.getElementById("no-data-banner");

  if (!noDataBanner) {
    console.warn("⚠️ Brak elementu #no-data-banner w DOM!");
    return;
  }

  // Wyczyść zawartość banera
  noDataBanner.innerHTML = "";

  // Utwórz <img> z odpowiednim źródłem
  const img = document.createElement("img");
  img.style.imageRendering = "pixelated";
  img.style.display = "block";
  img.style.margin = "0 auto";

  if (!hasData || hasData.length === 0) {
    console.log("🚫 Brak danych — pokazuję nodata.png");
    img.src = "assets/nodata.png";
    img.alt = "No data";
  } else {
    console.log("✅ Dane znalezione — pokazuję data.png");
    img.src = "assets/data.png"; // ← Upewnij się, że ten plik istnieje w /assets/
    img.alt = "Data present";
  }

  noDataBanner.appendChild(img);
  noDataBanner.style.display = "block";
}
