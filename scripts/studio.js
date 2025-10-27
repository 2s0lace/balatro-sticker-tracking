// ========================================================================
// PLIK: scripts/studio.js (WERSJA Z ADAPTACYJNĄ SIATKĄ I POPRAWKAMI)
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('joker-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imageUploader = document.getElementById('image-uploader');
    const gridToggle = document.getElementById('grid-toggle');
    const pixelateToggle = document.getElementById('pixelate-toggle');
    const stretchToggle = document.getElementById('stretch-toggle');
    const downloadBtn = document.getElementById('download-creation-btn');

    const JOKER_WIDTH = 138;
    const JOKER_HEIGHT = 186;
    const PIXEL_SIZE = 8;

    let userImage = null;
    let showGrid = false;
    let enablePixelation = false;
    let enableStretch = false;

    const filters = {
        lock: { active: false, tint: '#C0C0C0', opacity: 1.0, image: new Image() },
        text: { active: false, tint: '#FFFFFF', opacity: 1.0, image: new Image() }
    };

    filters.lock.image.src = 'assets/filtr1.png'; // Używam 'assets/' jako prefiksu
    filters.text.image.src = 'assets/filtr2.png'; // Używam 'assets/' jako prefiksu
    Object.values(filters).forEach(f => f.image.onload = () => redrawCanvas());

    // --- NOWA FUNKCJA: Analiza jasności obrazka ---
    function getAverageBrightness(imgElement) {
        if (!imgElement || !imgElement.complete || imgElement.naturalWidth === 0) return 0;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 10;
        tempCanvas.height = 10;
        
        // Rysujemy obrazek na małym płótnie
        tempCtx.drawImage(imgElement, 0, 0, tempCanvas.width, tempCanvas.height);
        const data = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
        
        let colorSum = 0;
        const totalPixels = tempCanvas.width * tempCanvas.height;

        for (let i = 0; i < data.length; i += 4) {
            // Obliczamy jasność (luminancję)
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Formuła luminancji (ważona średnia)
            const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            colorSum += brightness;
        }

        // Zwracamy średnią jasność (0-255)
        return colorSum / totalPixels;
    }
    // --- KONIEC NOWEJ FUNKCJI ---


    function redrawCanvas() {
        ctx.clearRect(0, 0, JOKER_WIDTH, JOKER_HEIGHT);
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, JOKER_WIDTH, JOKER_HEIGHT);
        
        // Sprawdź, czy obrazek jest jasny
        const avgBrightness = userImage ? getAverageBrightness(userImage) : 0;
        const isImageLight = avgBrightness > 127; // 127 to połowa skali 0-255

        // Ustaw kolor siatki na podstawie jasności obrazka
        let gridColor = isImageLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';


        // --- Rysowanie Obrazka ---
        if (userImage && userImage.complete && userImage.naturalWidth > 0) {
            const originalCanvas = document.createElement('canvas');
            originalCanvas.width = JOKER_WIDTH;
            originalCanvas.height = JOKER_HEIGHT;
            const originalCtx = originalCanvas.getContext('2d');

            if (enableStretch) {
                originalCtx.drawImage(userImage, 0, 0, JOKER_WIDTH, JOKER_HEIGHT);
            } else {
                const hRatio = JOKER_WIDTH / userImage.width, vRatio = JOKER_HEIGHT / userImage.height, ratio = Math.min(hRatio, vRatio);
                const x = (JOKER_WIDTH - userImage.width * ratio) / 2, y = (JOKER_HEIGHT - userImage.height * ratio) / 2;
                originalCtx.drawImage(userImage, 0, 0, userImage.width, userImage.height, x, y, userImage.width * ratio, userImage.height * ratio);
            }

            if (enablePixelation) {
                const scaledCanvas = document.createElement('canvas');
                scaledCanvas.width = JOKER_WIDTH / PIXEL_SIZE;
                scaledCanvas.height = JOKER_HEIGHT / PIXEL_SIZE;
                const scaledCtx = scaledCanvas.getContext('2d');
                scaledCtx.imageSmoothingEnabled = false;
                scaledCtx.drawImage(originalCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(scaledCanvas, 0, 0, JOKER_WIDTH, JOKER_HEIGHT);
            } else {
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(originalCanvas, 0, 0);
            }
        }
        // --- Koniec Rysowania Obrazka ---

        // --- Rysowanie Filtrów ---
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = JOKER_WIDTH;
        tempCanvas.height = JOKER_HEIGHT;
        const tempCtx = tempCanvas.getContext('2d');
        const drawOrder = ['text', 'lock']; 

        for (const filterName of drawOrder) {
            const f = filters[filterName];
            if (f.active && f.image.complete && f.image.naturalWidth > 0) {
                tempCtx.clearRect(0, 0, JOKER_WIDTH, JOKER_HEIGHT); 
                tempCtx.drawImage(f.image, 0, 0, JOKER_WIDTH, JOKER_HEIGHT);
                tempCtx.globalCompositeOperation = 'source-in';
                tempCtx.fillStyle = f.tint;
                tempCtx.fillRect(0, 0, JOKER_WIDTH, JOKER_HEIGHT);
                tempCtx.globalCompositeOperation = 'source-over';
                
                ctx.globalAlpha = f.opacity;
                ctx.drawImage(tempCanvas, 0, 0);
                ctx.globalAlpha = 1.0;
            }
        }
        // --- Koniec Rysowania Filtrów ---

        // --- Rysowanie Siatki (używa adaptacyjnego koloru) ---
        if (showGrid) {
            ctx.strokeStyle = gridColor; // Użycie adaptacyjnego koloru
            ctx.lineWidth = 0.5;
            for (let x = 0; x <= JOKER_WIDTH; x += PIXEL_SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, JOKER_HEIGHT); ctx.stroke(); }
            for (let y = 0; y <= JOKER_HEIGHT; y += PIXEL_SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(JOKER_WIDTH, y); ctx.stroke(); }
        }
    }

    // Event Listeners (bez zmian)
    imageUploader.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = res => { 
                userImage = new Image(); 
                userImage.onload = () => redrawCanvas();
                userImage.onerror = () => { userImage = null; alert('Błąd ładowania obrazka.'); redrawCanvas(); };
                userImage.src = res.target.result; 
            };
            reader.readAsDataURL(file);
        }
    });
    gridToggle.addEventListener('change', () => { showGrid = gridToggle.checked; redrawCanvas(); });
    pixelateToggle.addEventListener('change', () => { enablePixelation = pixelateToggle.checked; redrawCanvas(); });
    stretchToggle.addEventListener('change', () => { enableStretch = stretchToggle.checked; redrawCanvas(); });
    document.querySelectorAll('.filter-toggle').forEach(el => el.addEventListener('change', e => {
        filters[e.target.dataset.filter].active = e.target.checked;
        redrawCanvas();
    }));
    document.querySelectorAll('.filter-tint').forEach(el => el.addEventListener('input', e => {
        filters[e.target.dataset.filter].tint = e.target.value;
        redrawCanvas();
    }));
    document.querySelectorAll('.filter-opacity').forEach(el => el.addEventListener('input', e => {
        filters[e.target.dataset.filter].opacity = e.target.value;
        redrawCanvas();
    }));
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'my_joker_preview.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    
    redrawCanvas();
});