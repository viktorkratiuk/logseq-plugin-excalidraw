import type { I18N } from '.'

const de: I18N = {
  settings: {
    langCode: {
      title: 'Sprache',
      description: 'Plugin- und Excalidraw-Sprache, starten Sie Logseq neu, um die Änderungen zu übernehmen',
    },
    HandDrawn: {
      title: 'Handschrift',
      description: 'Benutzerdefinierte Handschrift, starten Sie Logseq neu, um die Änderungen zu übernehmen',
    },
    Normal: {
      title: 'Normale Schrift',
      description: 'Benutzerdefinierte normale Schrift, starten Sie Logseq neu, um die Änderungen zu übernehmen',
    },
    Code: {
      title: 'Code-Schrift',
      description: 'Benutzerdefinierte Code-Schrift, starten Sie Logseq neu, um die Änderungen zu übernehmen',
    },
  },
  preview: {
    deleteButton: 'Vorschau und Zeichnungsdatei löschen',
    refreshButton: 'Vorschau aktualisieren',
    editButton: 'Zeichnung bearbeiten',
    fullScreenButton: 'Vollbild',
  },
  editor: {
    slidesMode: 'Folien-Modus',
    exitButton: 'Speichern und beenden',
    slidesPreview: 'Folienvorschau',
    slidesOverview: 'Folienübersicht',
    slidesPrev: 'Zurück',
    slidesNext: 'Weiter',
    frameNotFound: 'Frame nicht gefunden',
    saveToast: {
      title: 'Speichern...',
      description: 'Wenn die Zeichnung viele Elemente oder Bilder enthält, kann das Speichern einige Zeit dauern.',
    },
  },
  createDrawing: {
    tag: '🎨 Excalidraw: Neue Zeichnung erstellen',
    errorMsg: 'Fehler beim Erstellen der Excalidraw-Zeichnung',
  },
  common: {
    pageNotFound: 'Die zur Zeichnung gehörende Seite wurde nicht gefunden',
  },
}

export default de
