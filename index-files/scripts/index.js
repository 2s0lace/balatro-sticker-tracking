// ========================================================================
// PLIK: index-files/scripts/index.js (FINALNA WERSJA - CZYSTA LOGIKA SPLASH SCREEN)
// ========================================================================
 
 document.addEventListener('DOMContentLoaded', () => {
            const splashContainer = document.getElementById('splash-container'); 
            const plasmaVideo = document.getElementById('plasma-video'); 
            const splashJimbo = document.getElementById('splash-jimbo'); 
            const jimboText = document.getElementById('jimbo-text');
            const jimbotxt1 = document.getElementById('jimbotxt1');
            const jimbotxt2 = document.getElementById('jimbotxt2');
            const mainContent = document.querySelector('.main-screen');
            
            // 🔥 Zwiększony czas do 15 sekund 🔥
            const DISINTEGRATION_TIME_MS = 2500; 
            
            // 🔥 LOGIKA STARTOWA: Natychmiastowe przejście, jeśli zapisano stan 'disabled' 🔥
            const SPLASH_DISABLED = localStorage.getItem('splash_disabled') === 'true';
            const MUSIC_DISABLED = localStorage.getItem('music_disabled') === 'true';
            
            if (SPLASH_DISABLED) {
                 splashContainer.style.display = 'none';
                 mainContent.style.visibility = 'visible';
                 // Kontynuuj inicjalizację audio (poniżej)
            } else {
                 mainContent.style.visibility = 'hidden'; 
            }

            plasmaVideo.volume = 0; 
            
            const SOUND_FILES = ['voice2.ogg', 'voice3.ogg', 'voice6.ogg', 'voice7.ogg'];
            let audioPool = []; 
            let jimboTextBlinkInterval = null;

            // 🔥 NOWY ELEMENT AUDIO DLA MUZYKI TŁOWEJ (bg-music.mp3) 🔥
            const bgMusic = new Audio('assets/bg-music.mp3');
            bgMusic.volume = 0.3; 
            bgMusic.loop = true;
            
            // 🔥 GLOBALNE UDOSTĘPNIENIE KONTROLI AUDIO DLA main.js 🔥
            window.toggleBgMusic = function() {
                if (bgMusic.paused) {
                    // Jeśli wznawiamy, a nie jest wyłączona trwale, graj
                    if (localStorage.getItem('music_disabled') !== 'true') {
                         bgMusic.play().catch(e => console.error("Błąd play muzyki:", e));
                    }
                } else {
                    bgMusic.pause();
                }
            };
            window.isBgMusicPaused = function() {
                return bgMusic.paused;
            };
            window.playRandomSound = playRandomSound; // Udostępniamy funkcję dźwięków Jokerowi Pomocnikowi
            
            // Jeśli SPLASH_DISABLED jest aktywne, ale muzyka nie jest trwale wyłączona, graj natychmiast
            if (SPLASH_DISABLED && !MUSIC_DISABLED) {
                bgMusic.play().catch(e => console.warn("Błąd play muzyki na skipie:", e));
            }
            // ------------------------------------------

            // Wstępne ładowanie i tworzenie puli obiektów Audio
            SOUND_FILES.forEach(file => {
                const audio = new Audio('assets/' + file);
                audio.volume = 0.5;
                audioPool.push(audio);
            });
            
            // --- MIGAJĄCY TEKST (funkcja startująca) ---
            function startJimboTextBlink() {
                let isBlinkOn = true;
                if (jimboTextBlinkInterval) clearInterval(jimboTextBlinkInterval);
                
                jimboTextBlinkInterval = setInterval(() => {
                    if (isBlinkOn) {
                        jimbotxt1.style.opacity = '0';
                        jimbotxt2.style.opacity = '1';
                    } else {
                        jimbotxt1.style.opacity = '1';
                        jimbotxt2.style.opacity = '0';
                    }
                    isBlinkOn = !isBlinkOn;
                }, 300); // Powolne miganie (300ms)
            }

            // --- MIGAJĄCY TEKST (funkcja zatrzymująca) ---
            function stopJimboTextBlink() {
                if (jimboTextBlinkInterval) {
                    clearInterval(jimboTextBlinkInterval);
                    jimboTextBlinkInterval = null;
                }
                jimbotxt1.style.opacity = '1';
                jimbotxt2.style.opacity = '0';
            }


            // --- ODTWARZANIE LOSOWEGO DŹWIĘKU (dwa na raz) ---
            function playRandomSound() {
                if (audioPool.length === 0) return;
                
                // Losuj dwa unikalne indeksy
                const indices = [];
                while (indices.length < 2 && indices.length < audioPool.length) {
                    const randomIndex = Math.floor(Math.random() * audioPool.length);
                    if (!indices.includes(randomIndex)) {
                        indices.push(randomIndex);
                    }
                }
                
                // 1. Pierwszy dźwięk (natychmiast)
                if (indices[0] !== undefined) {
                    const audio1 = audioPool[indices[0]];
                    playSingleSound(audio1);
                }
                
                // 2. Drugi dźwięk (opóźniony)
                if (indices[1] !== undefined) {
                    const audio2 = audioPool[indices[1]];
                    // Zapobiegawcze opóźnienie
                    setTimeout(() => {
                         playSingleSound(audio2);
                    }, 100); 
                }
            }
            
            // Funkcja pomocnicza do bezpiecznego odtwarzania
            function playSingleSound(audio) {
                 if (audio) {
                    audio.currentTime = 0; 
                    audio.play().catch(e => {
                        console.warn("Błąd odtwarzania dźwięku:", e);
                    });
                }
            }

            // --- OBSŁUGA ZDARZEŃ HOVER ---
            function handleJimboHover() {
                playRandomSound();
            }

            // --- FUNKCJA PRZECHODZĄCA DO GŁÓWNEGO EKRANU (Rozpad Plazmy) ---
            function goToMainScreen() {
                // Usuń event listenery
                splashJimbo.removeEventListener('click', goToMainScreen);
                splashJimbo.removeEventListener('mouseenter', handleJimboHover);
                stopJimboTextBlink(); // Zatrzymanie migania
                
                // Ostatnia próba odtworzenia dźwięku, po kliknięciu
                playRandomSound(); 

                // Natychmiastowe ukrycie Jimbo i Dymku
                splashJimbo.style.opacity = '0';
                jimboText.style.opacity = '0';
                
                // MUZYKA URUCHAMIANA TUTAJ (DRUGIE KLIKNIĘCIE) 
                if (localStorage.getItem('music_disabled') !== 'true') {
                    bgMusic.play().catch(e => {
                        console.warn("Błąd odtwarzania muzyki tła:", e);
                    });
                }

                // 1. ANIMACJA ROZMYCIA I ROZJAŚNIENIA DLA WIDEO PLAZMY (3 sekundy)
                anime({
                    targets: plasmaVideo,
                    filter: [
                        { value: 'blur(5px) brightness(0.6)', duration: 500 }, 
                        { value: 'blur(30px) brightness(5)', duration: DISINTEGRATION_TIME_MS, easing: 'easeOutSine' } 
                    ],
                    opacity: 0, 
                    duration: DISINTEGRATION_TIME_MS, 
                    easing: 'easeOutSine',
                });

                // 2. KONTENER ZNIKA CAŁKOWICIE
                setTimeout(() => {
                    splashContainer.style.display = 'none'; 
                    mainContent.style.visibility = 'visible'; 
                }, DISINTEGRATION_TIME_MS);
            }
            
            // 🔥 FUNKCJA AKTYWUJĄCA STRONĘ (POCZĄTKOWE KLIKNIĘCIE) 🔥
            function activateSite(event) {
                // Usuwamy pierwszy listener (aktywacji)
                splashJimbo.removeEventListener('click', activateSite);
                
                // 1. Zaczynamy miganie tekstu
                startJimboTextBlink();
                
                // 2. Jimbo staje się w pełni interaktywny (dźwięki na hoverze)
                splashJimbo.addEventListener('mouseenter', handleJimboHover);
                
                // 3. Kolejne kliknięcie przenosi na stronę
                splashJimbo.addEventListener('click', goToMainScreen);
                
                // Muzyka NIE jest uruchamiana tutaj!
                
                // Odtwarzamy pierwszy dźwięk (kluczowe do odblokowania AudioContext)
                playSingleSound(audioPool[0]);
            }

            // 🔥 OBSŁUGA STARTOWA 🔥
            setTimeout(() => {
                if (splashJimbo && !SPLASH_DISABLED) {
                    // Jimbo jest klikalny od razu, pierwsze kliknięcie aktywuje miganie i dźwięk
                    splashJimbo.addEventListener('click', activateSite);
                }
            }, 500);

            // --------------------------------------------------------------------------------------
            // --- Logika TILT i PARALAKSY ---
            // --------------------------------------------------------------------------------------
            
            const logoHeader = document.querySelector('.main-header'); 
            const cardWrappers = document.querySelectorAll('.main-card-wrapper');
            const importCard = document.getElementById('import-card-wrapper');
            const fileInput = document.getElementById('hidden-save-importer');

            // Logika obracania tła (Paralaksa)
            window.addEventListener('mousemove', (e) => {
                
                // Ustawienia czułości
                const bodySensitivity = 5; 
                const jimboParallaxSensitivity = 1; 
                const videoParallaxSensitivity = 3; 
                const tiltFactor = 5;

                // 1. Oblicz pozycję myszy względem centrum ekranu (-1 do 1)
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const normalizedX = (e.clientX - centerX) / centerX;
                const normalizedY = (e.clientY - centerY) / centerY;
                
                // PARALAKSA TŁA BODY (balatro-bg-gray.png)
                const moveX = (normalizedX) * bodySensitivity; 
                const moveY = (normalizedY) * bodySensitivity;
                document.body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`; 
                
                
                if (splashContainer.style.display !== 'none') {
                    
                    // Przesunięcia (przeciwne do ruchu myszy, dla złudzenia głębi)
                    const jimboOffsetX = normalizedX * jimboParallaxSensitivity * -1;
                    const jimboOffsetY = normalizedY * jimboParallaxSensitivity * -1;
                    const videoOffsetX = normalizedX * videoParallaxSensitivity * -1;
                    const videoOffsetY = normalizedY * videoParallaxSensitivity * -1;
                    
                    // Jimbo (tilt/obrót + minimalne przesunięcie)
                    splashJimbo.style.transform = `
                        translate(-50%, -50%) 
                        scale(0.4) 
                        translateX(${jimboOffsetX}px) 
                        translateY(${jimboOffsetY}px)
                        rotateX(${normalizedY * tiltFactor}deg) 
                        rotateY(${normalizedX * -tiltFactor}deg)
                    `;

                    // WIDEO (Paralaksa)
                    plasmaVideo.style.transform = `
                        translate(-50%, -50%)
                        translateX(${videoOffsetX}px) 
                        translateY(${videoOffsetY}px)
                    `;
                    
                    // Dymek: pozostaje statyczny 
                    jimboText.style.transform = `translate(-50%, -50%)`; 
                }
            });
            // 🔥 KONIEC LOGIKI PARALAKSY 🔥

            // Logika Tilt Logo
            function handleLogoTilt(e) {
                const element = e.currentTarget;
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const rotateX = (mouseY - centerY) / (rect.height / 2); 
                const rotateY = (mouseX - centerX) / (rect.width / 2);   
                const maxRotate = 12; 
                const finalRotateX = rotateX * maxRotate * -0.5; 
                const finalRotateY = rotateY * maxRotate * 0.5;  
                element.querySelector('.app-logo').style.transform = `
                    scale(1.05) 
                    translateZ(40px) 
                    rotateX(${finalRotateX}deg) 
                    rotateY(${finalRotateY}deg)
                `;
            }
            function resetLogoTilt(e) {
                e.currentTarget.querySelector('.app-logo').style.transform = '';
            }
            logoHeader.addEventListener('mousemove', handleLogoTilt);
            logoHeader.addEventListener('mouseleave', resetLogoTilt);

            // Logika Tilt Kart
            function handleCardTilt(e) {
                const element = e.currentTarget;
                const isImportCard = element.id === 'import-card-wrapper';
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const rotateX = (mouseY - centerY) / (rect.height / 2); 
                const rotateY = (mouseX - centerX) / (rect.width / 2);   
                const maxRotate = 12; 
                const maxTranslateZ = 40; 
                const finalRotateX = rotateX * maxRotate * -1; 
                const finalRotateY = rotateY * maxRotate; 
                if (!isImportCard) {
                    element.style.transform = `
                        scale(1.07) 
                        translateZ(${maxTranslateZ}px) 
                        rotateX(${finalRotateX}deg) 
                        rotateY(${finalRotateY}deg) 
                    `;
                } else {
                    element.style.transform = `scale(1.07) translateZ(${maxTranslateZ * 2}px)`; 
                }
                const topLayer = element.querySelector('.card-layer-top');
                if (topLayer) {
                    const liftY = isImportCard ? 20 : 10; 
                    topLayer.style.transform = `translateY(-${liftY}px) scale(1.1)`;
                }
            }
            function resetCardTilt(e) {
                e.currentTarget.style.transform = '';
            }
            cardWrappers.forEach(element => {
                element.addEventListener('mousemove', handleCardTilt);
                element.addEventListener('mouseleave', resetCardTilt);
                element.addEventListener('click', () => {
                    console.log(`Karta kliknięta: ${element.dataset.cardType || element.id}`);
                });
            });

        });