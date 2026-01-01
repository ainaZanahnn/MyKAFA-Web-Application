
import clickSound from '../assets/music/click sound.mp3';

// Create a single audio instance to avoid browser autoplay issues
let clickAudio: HTMLAudioElement | null = null;

// Initialize audio on first user interaction
const initializeAudio = () => {
  if (!clickAudio) {
    clickAudio = new Audio(clickSound);
    clickAudio.volume = 0.3; // Set reasonable volume
  }
};

// Play sound using web audio API with better error handling
export const playClickSound = async () => {
  try {
    // Initialize audio if not already done
    initializeAudio();

    if (clickAudio) {
      // Reset to beginning and play
      clickAudio.currentTime = 0;
      await clickAudio.play();
    }
  } catch (error) {
    console.error('Error playing click sound:', error);
    // Silently fail - don't show errors to user as this is just UI feedback
  }
};
