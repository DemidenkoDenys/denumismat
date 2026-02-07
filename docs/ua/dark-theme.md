# Темна Тема

Дата: 2026-02-07

Коротко
- Додано SCSS-файл темної теми, який містить перевизначення CSS-змінних та стилі для компонентів.

Змінені/додані файли
- `src/styles/themes/dark.scss` (новий)
- `src/styles/styles.scss` (імпорт теми)

Опис
- Темна тема активується при наявності класу `theme-dark` на елементі `body`. Файл встановлює змінні кольорів (primary, background, surface, border, текст) та містить локальні перевизначення для header, filters, coin cards та footer.

Як увімкнути
```js
// увімкнути темну тему
document.body.classList.add('theme-dark');

// вимкнути темну тему
document.body.classList.remove('theme-dark');
```

Примітки
- Погруження лише у CSS; перемикання теми можна робити через клас DOM, компонент або збережену налаштування користувача.

Відкат
- Видаліть рядок `@use 'themes/dark'` з `src/styles/styles.scss` та видаліть `src/styles/themes/dark.scss`.
