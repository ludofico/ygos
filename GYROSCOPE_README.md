# TiltedCard Mobile Gyroscope Setup

## Problemi risolti

1. **Permessi iOS 13+**: Aggiunta gestione esplicita dei permessi per DeviceOrientationEvent
2. **Rilevamento supporto**: Controllo dinamico se il dispositivo supporta il giroscopio
3. **Fallback touch**: Se il giroscopio non è disponibile, usa touch events
4. **Normalizzazione valori**: Limita i valori del giroscopio per evitare rotazioni eccessive

## Come testare

### Su dispositivi iOS (Safari/Chrome)

1. Aprire la app in Safari o Chrome
2. Toccare la card per attivare il rilevamento
3. Se richiesto, premere "Abilita Giroscopio"
4. Dare il permesso quando richiesto dal browser
5. Inclinare il dispositivo per vedere l'effetto

### Su dispositivi Android (Chrome/Firefox)

1. Aprire la app nel browser
2. Il giroscopio dovrebbe funzionare automaticamente
3. Inclinare il dispositivo per l'effetto

### Requisiti tecnici

- HTTPS: Il DeviceOrientationEvent richiede una connessione sicura
- Interazione utente: iOS richiede un'azione dell'utente prima di richiedere i permessi
- Browser supportati: Safari 13+, Chrome 67+, Firefox 79+

## Debug

Aprire la console del browser per vedere i log dei valori del giroscopio durante lo sviluppo.

## Fallback

Se il giroscopio non è disponibile:

1. Su mobile: usa touch events per il tilt
2. Su desktop: usa mouse events
3. Animazione automatica come ultima risorsa
