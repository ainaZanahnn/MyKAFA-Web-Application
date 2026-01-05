
import clickSound from '../assets/music/click sound.mp3';
import playSound from '../assets/music/selectsound.wav';
import lossSound from '../assets/music/lose.wav';

import correctSound from '../assets/music/correct.wav';

import countdownSound from '../assets/music/countdown.mp3';



// Create audio instances to avoid browser autoplay issues
let clickAudio: HTMLAudioElement | null = null;
let selectAudio: HTMLAudioElement | null = null;
let loseAudio: HTMLAudioElement | null = null;
let countdownAudio: HTMLAudioElement | null = null;
let correctAudio: HTMLAudioElement | null = null;

// Initialize audio on first user interaction
const initializeAudio = () => {
  if (!clickAudio) {
    clickAudio = new Audio(clickSound);
    clickAudio.volume = 0.3; // Set reasonable volume
  }
  if (!selectAudio) {
    selectAudio = new Audio(playSound);
    selectAudio.volume = 0.5; // Set reasonable volume
  }
  if (!loseAudio) {
    loseAudio = new Audio(lossSound);
    loseAudio.volume = 0.5; // Set reasonable volume
  }
  if (!countdownAudio) {
    countdownAudio = new Audio(countdownSound);
    countdownAudio.volume = 0.5; // Set reasonable volume
  }
  if (!correctAudio) {
    correctAudio = new Audio(correctSound);
    correctAudio.volume = 0.5; // Set reasonable volume
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

// Play select sound when student clicks answer during quiz
export const playSelectSound = async () => {
  try {
    // Initialize audio if not already done
    initializeAudio();

    if (selectAudio) {
      // Reset to beginning and play
      selectAudio.currentTime = 0;
      await selectAudio.play();
    }
  } catch (error) {
    console.error('Error playing select sound:', error);
    // Silently fail - don't show errors to user as this is just UI feedback
  }
};

// Play lose sound when student gets wrong answer during feedback
export const playLoseSound = async () => {
  try {
    // Initialize audio if not already done
    initializeAudio();

    if (loseAudio) {
      // Reset to beginning and play
      loseAudio.currentTime = 0;
      await loseAudio.play();
    }
  } catch (error) {
    console.error('Error playing lose sound:', error);
    // Silently fail - don't show errors to user as this is just UI feedback
  }
};

// Play correct sound when student gets correct answer during feedback
export const playCorrectSound = async () => {
  try {
    // Initialize audio if not already done
    initializeAudio();

    if (correctAudio) {
      // Reset to beginning and play
      correctAudio.currentTime = 0;
      await correctAudio.play();
    }
  } catch (error) {
    console.error('Error playing correct sound:', error);
    // Silently fail - don't show errors to user as this is just UI feedback
  }
};

// Play countdown sound during countdown before quiz begins
export const playCountdownSound = async () => {
  try {
    // Initialize audio if not already done
    initializeAudio();

    if (countdownAudio) {
      // Reset to beginning and play
      countdownAudio.currentTime = 0;
      await countdownAudio.play();
    }
  } catch (error) {
    console.error('Error playing countdown sound:', error);
    // Silently fail - don't show errors to user as this is just UI feedback
  }
};
