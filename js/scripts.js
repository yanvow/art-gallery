let currentLang = 'en';
let currentPieceId = '0001';

async function loadTranslations(lang, pieceId) {
  try {
    const response = await fetch(`/lang/${lang}.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const translations = await response.json();
    
    // Find the piece by ID
    const piece = translations.pieces.find(p => p.page_title.includes(pieceId));
    if (!piece) throw new Error(`Piece ${pieceId} not found`);
    
    // Update text elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = translations[key] || piece[key] || 'Translation missing';
    });
    
    // Update image and audio sources
    document.getElementById('art-image').src = `/images/${pieceId}.jpg`;
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
  window.location.href = `/${newLang}/${currentPieceId}`;
}

async function goToNextPiece() {
  try {
    const response = await fetch(`/lang/${currentLang}.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const translations = await response.json();
    
    // Get all piece IDs
    const pieceIds = translations.pieces.map(p => {
      const match = p.page_title.match(/\d+$/); // Extract number from page_title
      return match ? match[0] : null;
    }).filter(id => id !== null);
    
    // Find index of current piece
    const currentIndex = pieceIds.indexOf(currentPieceId);
    if (currentIndex === -1) throw new Error(`Current piece ${currentPieceId} not found`);
    
    // Get next piece ID (loop back to first if at the end)
    const nextIndex = (currentIndex + 1) % pieceIds.length;
    const nextPieceId = pieceIds[nextIndex];
    
    // Redirect to next piece
    window.location.href = `/${currentLang}/${nextPieceId}`;
  } catch (error) {
    console.error('Error navigating to next piece:', error);
  }
}

// Ensure DOM is fully loaded before parsing URL and loading translations
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/'); // e.g., ["", "en", "0001"]
  const lang = path[1] || 'en'; // Default to 'en' if no language in URL
  const pieceId = path[2] || '0001'; // Default to '0001' if no piece ID
  loadTranslations(lang, pieceId);
});