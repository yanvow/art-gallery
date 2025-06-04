let currentLang = 'en';
let currentPieceId = '0001';

async function loadTranslations(lang, pieceId) {
  try {
    const response = await fetch(`/art-gallery/lang/${lang}.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const translations = await response.json();
    
    // Find the piece by ID
    const piece = translations.pieces.find(p => p.piece_id === pieceId);
    if (!piece) throw new Error(`Piece ${pieceId} not found`);
    
    // Update text elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = translations[key] || piece[key] || 'Translation missing';
    });
    
    // Update image and audio sources
    document.getElementById('art-image').src = `/art-gallery/images/${pieceId}.jpg`;
    const audioSource = document.getElementById('audio-source');
    audioSource.src = piece.audio;
    const audio = audioSource.parentElement;
    audio.load(); // Reload audio to apply new source
    
    // Update document title
    document.title = piece.page_title;
    
    currentLang = lang;
    currentPieceId = pieceId;
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

function switchLanguage() {
  const newLang = currentLang === 'en' ? 'fr' : 'en';
  window.location.href = `/art-gallery/${newLang}/${currentPieceId}`;
}

// Ensure DOM is fully loaded before parsing URL and loading translations
document.addEventListener('DOMContentLoaded', () => {
  // Remove base path and trailing slash, then split
  const path = window.location.pathname.split('/'); //
  const lang = path[-2] || 'en'; // Default to 'en' if no language
  const pieceId = path[-1] || '0001'; // Default to '0001' if no piece ID
  loadTranslations(lang, pieceId);
});