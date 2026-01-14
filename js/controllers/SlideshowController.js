/**
 * Slideshow Controller
 */
class SlideshowController {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.init();
    }

    init() {
        if (this.slides.length > 0) {
            this.showSlide(this.currentSlide);
            // Auto-play slideshow
            setInterval(() => {
                this.nextSlide();
            }, 5000);
        }
    }

    showSlide(index) {
        if (this.slides.length === 0) return;

        // Hide all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));

        // Show current slide
        if (index >= this.slides.length) {
            this.currentSlide = 0;
        } else if (index < 0) {
            this.currentSlide = this.slides.length - 1;
        } else {
            this.currentSlide = index;
        }

        this.slides[this.currentSlide].classList.add('active');
        if (this.indicators[this.currentSlide]) {
            this.indicators[this.currentSlide].classList.add('active');
        }
    }

    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }

    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }

    goToSlide(index) {
        this.showSlide(index);
    }
}

const slideshowController = new SlideshowController();

