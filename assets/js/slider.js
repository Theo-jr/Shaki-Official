/**
 * Shaki - Image Slider/Carousel Component
 * 
 * This script handles all slider/carousel functionality across the Shaki website
 * Features include:
 * - Responsive image sliders
 * - Touch-enabled for mobile
 * - Auto-play functionality with pause on hover
 * - Custom navigation and indicators
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all sliders on the page
  initSliders();
});

/**
 * Initialize all sliders found on the page
 */
function initSliders() {
  const sliders = document.querySelectorAll('.shaki-slider');
  
  sliders.forEach(slider => {
    // Setup individual slider based on data attributes
    const autoplay = slider.dataset.autoplay === 'true';
    const interval = parseInt(slider.dataset.interval || 5000);
    const slideShow = new Slider(slider, {
      autoplay: autoplay,
      interval: interval
    });
    
    // Initialize the slider
    slideShow.init();
  });
}

/**
 * Slider Class
 * Creates and controls a slider component
 */
class Slider {
  constructor(element, options = {}) {
    // Slider element and options
    this.slider = element;
    this.options = {
      autoplay: options.autoplay || false,
      interval: options.interval || 5000
    };
    
    // Slider components
    this.slides = this.slider.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.currentSlide = 0;
    this.isPlaying = false;
    this.slideInterval = null;
    
    // Navigation elements
    this.prevBtn = this.slider.querySelector('.prev-slide');
    this.nextBtn = this.slider.querySelector('.next-slide');
    
    // Create indicators if they don't exist
    this.createIndicators();
  }
  
  /**
   * Initialize the slider functionality
   */
  init() {
    if (this.totalSlides <= 1) return; // Don't initialize if only one slide
    
    // Set up initial state
    this.slides[0].classList.add('active');
    this.updateIndicators();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start autoplay if enabled
    if (this.options.autoplay) {
      this.play();
      
      // Pause on hover
      this.slider.addEventListener('mouseenter', () => this.pause());
      this.slider.addEventListener('mouseleave', () => this.play());
    }
  }
  
  /**
   * Create indicator dots for the slider
   */
  createIndicators() {
    let indicators = this.slider.querySelector('.slider-indicators');
    
    // Create indicators container if it doesn't exist
    if (!indicators) {
      indicators = document.createElement('div');
      indicators.className = 'slider-indicators';
      this.slider.appendChild(indicators);
    }
    
    // Clear existing indicators
    indicators.innerHTML = '';
    
    // Create new indicators
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('span');
      dot.className = 'indicator';
      dot.dataset.index = i;
      indicators.appendChild(dot);
      
      // Add click event to indicator
      dot.addEventListener('click', () => {
        this.goToSlide(i);
      });
    }
    
    this.indicators = indicators.querySelectorAll('.indicator');
  }
  
  /**
   * Setup event listeners for navigation
   */
  setupEventListeners() {
    // Next and Previous buttons
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextSlide();
      });
    }
    
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevSlide();
      });
    }
    
    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        this.nextSlide(); // Swipe left
      } else if (touchEndX - touchStartX > 50) {
        this.prevSlide(); // Swipe right
      }
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Only respond if the slider is in the viewport
      const rect = this.slider.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
      
      if (isInViewport) {
        if (e.key === 'ArrowRight') {
          this.nextSlide();
        } else if (e.key === 'ArrowLeft') {
          this.prevSlide();
        }
      }
    });
  }
  
  /**
   * Go to the next slide
   */
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(this.currentSlide);
  }
  
  /**
   * Go to the previous slide
   */
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(this.currentSlide);
  }
  
  /**
   * Go to a specific slide
   */
  goToSlide(index) {
    // Remove active class from all slides
    this.slides.forEach(slide => slide.classList.remove('active'));
    
    // Add active class to target slide
    this.slides[index].classList.add('active');
    
    // Update the current slide index
    this.currentSlide = index;
    
    // Update indicators
    this.updateIndicators();
    
    // Reset the interval if autoplay is enabled
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }
  
  /**
   * Update the active state of indicators
   */
  updateIndicators() {
    if (this.indicators) {
      this.indicators.forEach((indicator, index) => {
        if (index === this.currentSlide) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * Start auto-playing the slider
   */
  play() {
    if (!this.isPlaying && this.options.autoplay) {
      this.isPlaying = true;
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, this.options.interval);
    }
  }
  
  /**
   * Pause the auto-play
   */
  pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      clearInterval(this.slideInterval);
    }
  }
}

// Export the Slider class for use in other modules
export default Slider;