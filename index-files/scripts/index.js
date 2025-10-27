
 
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
            
            mainContent.style.visibility = 'hidden'; 
            plasmaVideo.volume = 0; 
            
            const SOUND_FILES = ['voice2.ogg', 'voice3.ogg', 'voice6.ogg', 'voice7.ogg'];
            let audioPool = []; 
            let jimboTextBlinkInterval = null;

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
                
                // 1. Pierwszy dźwięk
                const audio1 = audioPool[Math.floor(Math.random() * audioPool.length)];
                playSingleSound(audio1);
                
                // 2. Drugi dźwięk (opóźniony)
                if (audioPool.length > 1) {
                    let index1 = audioPool.indexOf(audio1); 
                    let index2;
                    let audio2;
                    
                    // Losuj drugi indeks, dopóki nie będzie inny
                    do {
                        index2 = Math.floor(Math.random() * audioPool.length);
                    } while (index2 === index1);
                    
                    audio2 = audioPool[index2];
                    
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
                
                // Odtwarzamy pierwszy dźwięk (kluczowe do odblokowania AudioContext)
                playSingleSound(audioPool[0]);
            }

            // 🔥 OBSŁUGA STARTOWA 🔥
            setTimeout(() => {
                if (splashJimbo) {
                    // Jimbo jest klikalny od razu, pierwsze kliknięcie aktywuje miganie i dźwięk
                    splashJimbo.addEventListener('click', activateSite);
                }
            }, 500);

            // --------------------------------------------------------------------------------------
            // --- Logika TILT dla UI (Bez zmian) ---
            // --------------------------------------------------------------------------------------
            
            const logoHeader = document.querySelector('.main-header'); 
            const cardWrappers = document.querySelectorAll('.main-card-wrapper');
            const importCard = document.getElementById('import-card-wrapper');
            const fileInput = document.getElementById('hidden-save-importer');

            // Logika obracania tła (Paralaksa)
            window.addEventListener('mousemove', (e) => {
                const sensitivity = 5; 
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                const moveX = (x - 0.5) * sensitivity; 
                const moveY = (y - 0.5) * sensitivity;
                document.body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
            });

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