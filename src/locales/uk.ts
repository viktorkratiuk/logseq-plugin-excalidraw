import type { I18N } from '.'

const uk: I18N = {
  settings: {
    langCode: {
      title: 'Мова',
      description: 'Мова плагіну та Excalidraw, перезапустіть Logseq для застосування',
    },
    HandDrawn: {
      title: 'Рукописний шрифт',
      description: 'Користувацький рукописний шрифт, перезапустіть Logseq для застосування',
    },
    Normal: {
      title: 'Звичайний шрифт',
      description: 'Користувацький звичайний шрифт, перезапустіть Logseq для застосування',
    },
    Code: {
      title: 'Шрифт для коду',
      description: 'Користувацький шрифт для коду, перезапустіть Logseq для застосування',
    },
  },
  preview: {
    deleteButton: 'Видалити попередній перегляд та файл малюнка',
    refreshButton: 'Оновити попередній перегляд',
    editButton: 'Редагувати малюнок',
    fullScreenButton: 'Повний екран',
  },
  editor: {
    slidesMode: 'Режим слайдів',
    exitButton: 'Зберегти та вийти',
    slidesPreview: 'Попередній перегляд слайдів',
    slidesOverview: 'Огляд слайдів',
    slidesPrev: 'Попередній слайд',
    slidesNext: 'Наступний слайд',
    frameNotFound: 'Фрейм не знайдено',
    saveToast: {
      title: 'Збереження...',
      description: 'Якщо малюнок містить багато елементів або зображень, збереження може зайняти деякий час.',
    },
  },
  createDrawing: {
    tag: '🎨 Excalidraw: Створити новий малюнок',
    errorMsg: 'Помилка створення малюнка Excalidraw',
  },
  common: {
    pageNotFound: 'Сторінка, що відповідає малюнку, не знайдена',
  },
  pageSearch: {
    placeholder: 'Пошук сторінок Excalidraw...',
    resultsPlaceholder: 'Почніть вводити для пошуку...',
    closeHint: 'ESC - закрити',
    noResults: 'Нічого не знайдено',
    loading: 'Завантаження...',
    pageCount: (count: number) => `${count} сторін${count === 1 ? 'ка' : count < 5 ? 'ки' : 'ок'}`,
    noAlias: 'Нема аліаса',
  },
}

export default uk
