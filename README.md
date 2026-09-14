# Próximo

App mobile para ver cuándo viene el próximo tren del ramal **Retiro–Tigre** (línea Mitre).

## Correrla

```bash
npm install
npx expo start
```

Después abrí Expo Go en el teléfono y escaneá el QR.

## Qué hay en el v1

- Estaciones del ramal Retiro–Tigre
- Próximos trenes hacia Tigre y hacia Retiro
- Horario programado (primer/último tren y frecuencia de Trenes Argentinos: ~15 min hábil, ~25 min finde)

No es tiempo real: si hay paro o demora, el reloj de la vía manda.

## Después

Sumar ramales en `src/schedule.ts` (`LINES`).
