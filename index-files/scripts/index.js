// ========================================================================
// PLIK: index-files/scripts/index.js (WERSJA OSTATECZNA - WSZYSTKO DZIAŁA)
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {

    const _modalFix = document.getElementById('no-import-modal');
if (_modalFix && _modalFix.parentElement?.id === 'settings-modal-overlay') {
  document.body.appendChild(_modalFix);
}
    // --- ZMIENNE GŁÓWNE ---
    const splashContainer = document.getElementById('splash-container');
    const plasmaVideo = document.getElementById('plasma-video');
    const splashJimbo = document.getElementById('splash-jimbo');
    const jimboText = document.getElementById('jimbo-text');
    const jimbotxt1 = document.getElementById('jimbotxt1');
    const jimbotxt2 = document.getElementById('jimbotxt2');
    const mainContent = document.querySelector('.main-screen');
    const DISINTEGRATION_TIME_MS = 2500;

    // --- LOGIKA STARTOWA ---
    const SPLASH_DISABLED = localStorage.getItem('splash_disabled') === 'true';
    const MUSIC_DISABLED = localStorage.getItem('music_disabled') === 'true';

    // --- CENTRALNY OBIEKT AUDIO ---
    const bgMusic = new Audio('assets/bg-music.mp3');
    bgMusic.volume = 0.3;
    bgMusic.loop = true;

    if (SPLASH_DISABLED) {
        splashContainer.style.display = 'none';
        mainContent.style.visibility = 'visible';
        if (!MUSIC_DISABLED) {
            bgMusic.play().catch(e => {
                document.body.addEventListener('click', () => {
                    if (bgMusic.paused) bgMusic.play();
                }, { once: true });
            });
        }
    } else {
        mainContent.style.visibility = 'hidden';
    }

    if (plasmaVideo) plasmaVideo.volume = 0;

    const SOUND_FILES = ['voice2.mp3', 'voice3.mp3', 'voice6.mp3', 'voice7.mp3'];
    let audioPool = [];
    SOUND_FILES.forEach(file => {
        const audio = new Audio('assets/' + file);
        audio.volume = 0.5;
        audioPool.push(audio);
    });

    let jimboTextBlinkInterval = null;

    // --- FUNKCJE DLA EKRANU STARTOWEGO ---
    function playSingleSound(audio) {
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.warn(`Błąd odtwarzania dźwięku (${audio.src}):`, e));
        }
    }
    
    function playRandomSoundFromPool() {
        if (audioPool.length === 0) return;
        const randomAudio = audioPool[Math.floor(Math.random() * audioPool.length)];
        playSingleSound(randomAudio);
    }

    function startJimboTextBlink() {
        if (jimboTextBlinkInterval) clearInterval(jimboTextBlinkInterval);
        let isBlinkOn = true;
        jimboTextBlinkInterval = setInterval(() => {
            jimbotxt1.style.opacity = isBlinkOn ? '0' : '1';
            jimbotxt2.style.opacity = isBlinkOn ? '1' : '0';
            isBlinkOn = !isBlinkOn;
        }, 300);
    }

    function stopJimboTextBlink() {
        if (jimboTextBlinkInterval) clearInterval(jimboTextBlinkInterval);
        jimboTextBlinkInterval = null;
    }

    function goToMainScreen() {
        splashJimbo.removeEventListener('click', goToMainScreen);
        splashJimbo.removeEventListener('mouseenter', playRandomSoundFromPool);
        stopJimboTextBlink();
        playRandomSoundFromPool();

        splashJimbo.style.opacity = '0';
        jimboText.style.opacity = '0';

        if (localStorage.getItem('music_disabled') !== 'true' && bgMusic.paused) {
            bgMusic.play().catch(e => console.warn("Błąd odtwarzania muzyki tła:", e));
        }

        anime({
            targets: plasmaVideo,
            filter: [
                { value: 'blur(5px) brightness(0.6)', duration: 500 },
                { value: 'blur(30px) brightness(5)', duration: DISINTEGRATION_TIME_MS, easing: 'easeOutSine' }
            ],
            opacity: 0,
            duration: DISINTEGRATION_TIME_MS,
            easing: 'easeOutSine',
            complete: () => {
                splashContainer.style.display = 'none';
                mainContent.style.visibility = 'visible';
            }
        });
    }

    function activateSite() {
        playSingleSound(audioPool[0]);

        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                bgMusic.pause();
            }).catch(error => {
                console.warn("Nie udało się odblokować muzyki w tle przy pierwszym kliknięciu.", error);
            });
        }
        
        splashJimbo.removeEventListener('click', activateSite);
        startJimboTextBlink();
        splashJimbo.addEventListener('mouseenter', playRandomSoundFromPool);
        splashJimbo.addEventListener('click', goToMainScreen);
    }

    if (splashJimbo && !SPLASH_DISABLED) {
        setTimeout(() => splashJimbo.addEventListener('click', activateSite), 500);
    }

    // --- LOGIKA TILT I PARALAKSY ---
    const logoHeader = document.querySelector('.main-header');
    const cardWrappers = document.querySelectorAll('.main-card-wrapper');
    const jokerHelperBtn = document.getElementById('joker-helper-fixed-btn'); // Nowa zmienna

    window.addEventListener('mousemove', (e) => {
        const bodySensitivity = 5, jimboParallaxSensitivity = 1, videoParallaxSensitivity = 3, tiltFactor = 5;
        const centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
        const normalizedX = (e.clientX - centerX) / centerX, normalizedY = (e.clientY - centerY) / centerY;
        
        document.body.style.backgroundPosition = `calc(50% + ${normalizedX * bodySensitivity}px) calc(50% + ${normalizedY * bodySensitivity}px)`;

        if (splashContainer.style.display !== 'none') {
            splashJimbo.style.transform = `translate(-50%, -50%) scale(0.4) translateX(${normalizedX * -jimboParallaxSensitivity}px) translateY(${normalizedY * -jimboParallaxSensitivity}px) rotateX(${normalizedY * tiltFactor}deg) rotateY(${normalizedX * -tiltFactor}deg)`;
            plasmaVideo.style.transform = `translate(-50%, -50%) translateX(${normalizedX * -videoParallaxSensitivity}px) translateY(${normalizedY * -videoParallaxSensitivity}px)`;
        }
    });

    function handleTilt(e, element, maxRotate) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
        const rotateX = (e.clientY - centerY) / (rect.height / 2) * -maxRotate;
        const rotateY = (e.clientX - centerX) / (rect.width / 2) * maxRotate;
        return { rotateX, rotateY };
    }
    
    if (logoHeader) {
        logoHeader.addEventListener('mousemove', (e) => {
            const { rotateX, rotateY } = handleTilt(e, logoHeader, 6);
            e.currentTarget.querySelector('.app-logo').style.transform = `scale(1.05) translateZ(40px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        logoHeader.addEventListener('mouseleave', (e) => e.currentTarget.querySelector('.app-logo').style.transform = '');
    }
    
    cardWrappers.forEach(element => {
        element.addEventListener('mouseenter', playRandomSoundFromPool);
        element.addEventListener('mousemove', (e) => {
            const { rotateX, rotateY } = handleTilt(e, element, 12);
            element.style.transform = `scale(1.07) translateZ(40px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            const topLayer = element.querySelector('.card-layer-top');
            if (topLayer) topLayer.style.transform = `translateY(-10px) scale(1.1)`;
        });
        element.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = '';
            const topLayer = e.currentTarget.querySelector('.card-layer-top');
            if(topLayer) topLayer.style.transform = '';
        });
    });

    // ### NOWY KOD - DŹWIĘK DLA JOKERA POMOCNIKA ###
    if (jokerHelperBtn) {
        jokerHelperBtn.addEventListener('mouseenter', playRandomSoundFromPool);
    }
    
    // --- LOGIKA MODALA USTAWIEŃ ---
    const settingsBtn = document.getElementById('joker-helper-fixed-btn');
    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
    const closeSettingsBtn = document.getElementById('close-settings-modal-btn');
    const toggleMusicBtn = document.getElementById('toggle-music-btn');
    const toggleSplashBtn = document.getElementById('disable-splash-btn');
    const returnToSplashBtn = document.getElementById('return-to-splash-btn');

    const updateMusicButtonText = () => {
        if (toggleMusicBtn) toggleMusicBtn.textContent = `Wyłącz Muzykę (Obecnie: ${bgMusic.paused ? 'OFF' : 'ON'})`;
    };
    const updateSplashButtonText = () => {
        if (toggleSplashBtn) toggleSplashBtn.textContent = localStorage.getItem('splash_disabled') === 'true' ? 'Włącz Menu Startowe' : 'Wyłącz Menu Startowe';
    };

    if (settingsBtn) {
        settingsBtn.addEventListener('click', (event) => {
            event.preventDefault();
            settingsModalOverlay.style.display = 'block';
            updateMusicButtonText();
            updateSplashButtonText();
        });
    }
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModalOverlay.style.display = 'none');
    if (settingsModalOverlay) settingsModalOverlay.addEventListener('click', (e) => { if (e.target === settingsModalOverlay) settingsModalOverlay.style.display = 'none'; });
    
    if (toggleMusicBtn) {
        toggleMusicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                localStorage.removeItem('music_disabled');
                bgMusic.play();
            } else {
                localStorage.setItem('music_disabled', 'true');
                bgMusic.pause();
            }
            updateMusicButtonText();
        });
    }

    if (toggleSplashBtn) {
        toggleSplashBtn.addEventListener('click', () => {
            if (localStorage.getItem('splash_disabled') === 'true') {
                localStorage.removeItem('splash_disabled');
                alert('Menu startowe WŁĄCZONE. Zmiana będzie widoczna po odświeżeniu strony.');
            } else {
                localStorage.setItem('splash_disabled', 'true');
                alert('Menu startowe WYŁĄCZONE.');
            }
            updateSplashButtonText();
        });
    }

    if (returnToSplashBtn) {
        returnToSplashBtn.addEventListener('click', () => {
            localStorage.removeItem('splash_disabled');
            window.location.reload();
        });
    }


  });