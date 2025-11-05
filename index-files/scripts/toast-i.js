// ==========================================================
// toast-i.js — absolutnie minimalna wersja testowa 💚
// ==========================================================
function showToast(message = "IMPORT SUCCESSFUL", isError = false) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message.toUpperCase();
  toast.style.position = "fixed";
  toast.style.bottom = "60px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = isError ? "#600" : "#111";
  toast.style.color = isError ? "#ff8080" : "#80ff80";
  toast.style.border = `2px solid ${isError ? "#ff4040" : "#00ff00"}`;
  toast.style.fontFamily = '"Press Start 2P", monospace';
  toast.style.fontSize = "12px";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "8px";
  toast.style.textShadow = isError ? "0 0 6px #ff4040" : "0 0 6px #00ff00";
  toast.style.opacity = "1";
  toast.style.zIndex = "9999";
  toast.style.transition = "opacity 0.4s ease";
  toast.style.imageRendering = "pixelated";

  setTimeout(() => (toast.style.opacity = "0"), 2200);
  setTimeout(() => toast.remove(), 2800);
}

console.log("🍞 toast-i.js minimal loaded ✅");

document.addEventListener("DOMContentLoaded", () => {
  const importCard = document.getElementById("import-card-wrapper");
  const importModal = document.getElementById("save-modal");
  const okBtn = importModal ? importModal.querySelector(".modal-ok") : null;
  const input = document.getElementById("save-input");

  if (!importCard || !importModal || !okBtn || !input) {
    console.warn("❌ Brakuje elementów modala importu!");
    return;
  }

  importCard.addEventListener("click", (e) => {
    console.log("✅ Kliknięto w trzecią kartę (Import)");
    importModal.style.display = "flex";
    e.stopPropagation();
  });

  okBtn.addEventListener("click", () => {
    const rawData = input.value.trim();

    if (rawData.length > 0) {
      localStorage.setItem("importData", rawData);
      importModal.style.display = "none";
      input.value = "";

      // 🎉 Pokaż pixelowy toast
      showToast("Import successful");

      // 🔄 Odśwież baner NO DATA, jeśli funkcja istnieje
      if (typeof checkLocalStorageData === "function") {
        checkLocalStorageData();
      }
    } else {
      showToast("Paste your data first!", true);
    }
  });
});

function checkLocalStorageData() {
  const saveData = localStorage.getItem("saveData");
  const importData = localStorage.getItem("importData");
  const hasData = saveData || importData;
  const banner = document.getElementById("no-data-banner");

  if (!banner) {
    console.warn("⚠️ Brak elementu #no-data-banner w DOM!");
    return;
  }

  const img = banner.querySelector("img");
  if (!img) return;

  if (!hasData || hasData.length === 0) {
    console.log("🚫 Brak danych — pokazuję nodata.png");
    img.src = "assets/nodata.png";
    img.alt = "No data";
  } else {
    console.log("✅ Dane znalezione — pokazuję data.png");
    img.src = "assets/data.png";
    img.alt = "Data present";
  }

  banner.style.display = "block";
}

document.addEventListener("DOMContentLoaded", checkLocalStorageData);

