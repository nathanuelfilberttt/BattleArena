/**
 * ColorAdaptiveController - Mengubah warna elemen navbar secara dinamis
 * berdasarkan warna background di belakangnya untuk menghindari clash warna
 */
class ColorAdaptiveController {
    constructor() {
        this.elements = {
            logo: null,
            discord: null,
            userName: null,
            userIcon: null
        };
        this.checkInterval = null;
        this.init();
    }

    init() {
        // Tunggu DOM siap
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Ambil elemen-elemen yang perlu diubah
        this.elements.logo = document.querySelector('.nav-logo-icon');
        this.elements.discord = document.querySelector('.nav-discord-icon');
        this.elements.userName = document.getElementById('navUserName');
        this.elements.userIcon = document.querySelector('.nav-user-icon');

        if (!this.elements.logo && !this.elements.discord && !this.elements.userName) {
            return; // Elemen tidak ditemukan
        }

        // Update warna saat scroll dan resize
        this.updateColors();
        window.addEventListener('scroll', () => this.updateColors());
        window.addEventListener('resize', () => this.updateColors());

        // Update secara berkala untuk menangani perubahan background
        this.checkInterval = setInterval(() => this.updateColors(), 500);
    }

    /**
     * Mendapatkan warna background di belakang elemen
     */
    getBackgroundColor(element) {
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Cek apakah elemen berada di atas nav-menu (yang putih)
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const menuRect = navMenu.getBoundingClientRect();
            // Jika elemen berada di area nav-menu, gunakan warna putih
            if (centerX >= menuRect.left && centerX <= menuRect.right &&
                centerY >= menuRect.top && centerY <= menuRect.bottom) {
                return { r: 255, g: 255, b: 255 }; // Nav menu putih
            }
        }

        // Coba ambil warna dari elemen di belakang
        const elementBelow = document.elementFromPoint(centerX, centerY);
        
        if (!elementBelow) {
            // Cek apakah ada background image
            const bodyStyle = window.getComputedStyle(document.body);
            const bgImage = bodyStyle.backgroundImage;
            if (bgImage && bgImage !== 'none') {
                // Ada background image, asumsikan gelap
                return { r: 10, g: 10, b: 15 };
            }
            return { r: 255, g: 255, b: 255 }; // Default putih
        }

        // Skip jika element adalah elemen itu sendiri atau child-nya
        if (element.contains(elementBelow) || elementBelow.contains(element)) {
            // Cek parent
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
                const parentStyle = window.getComputedStyle(parent);
                const parentBg = parentStyle.backgroundColor;
                if (parentBg && parentBg !== 'transparent' && parentBg !== 'rgba(0, 0, 0, 0)') {
                    const rgb = this.parseRGB(parentBg);
                    if (rgb) return rgb;
                }
                parent = parent.parentElement;
            }
        }

        // Ambil computed style
        const style = window.getComputedStyle(elementBelow);
        const bgColor = style.backgroundColor;

        // Parse RGB
        if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
            const rgb = this.parseRGB(bgColor);
            if (rgb) return rgb;
        }

        // Jika tidak ada background color, cek parent
        let parent = elementBelow.parentElement;
        while (parent && parent !== document.body) {
            const parentStyle = window.getComputedStyle(parent);
            const parentBg = parentStyle.backgroundColor;
            if (parentBg && parentBg !== 'transparent' && parentBg !== 'rgba(0, 0, 0, 0)') {
                const rgb = this.parseRGB(parentBg);
                if (rgb) return rgb;
            }
            parent = parent.parentElement;
        }

        // Default: cek body background
        const bodyStyle = window.getComputedStyle(document.body);
        const bodyBg = bodyStyle.backgroundColor;
        const bodyBgImage = bodyStyle.backgroundImage;
        
        if (bodyBgImage && bodyBgImage !== 'none') {
            // Ada background image, asumsikan gelap
            return { r: 10, g: 10, b: 15 };
        }
        
        const rgb = this.parseRGB(bodyBg);
        return rgb || { r: 10, g: 10, b: 15 }; // Default dark
    }

    /**
     * Parse RGB dari string CSS color
     */
    parseRGB(color) {
        if (!color) return null;

        // Format: rgb(r, g, b) atau rgba(r, g, b, a)
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }

        // Format hex: #RRGGBB
        const hexMatch = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        if (hexMatch) {
            return {
                r: parseInt(hexMatch[1], 16),
                g: parseInt(hexMatch[2], 16),
                b: parseInt(hexMatch[3], 16)
            };
        }

        return null;
    }

    /**
     * Menghitung kecerahan (luminance) warna
     */
    getLuminance(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        // Relative luminance formula
        const [rs, gs, bs] = [r, g, b].map(val => {
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    /**
     * Menentukan warna yang kontras dengan background
     */
    getContrastColor(backgroundColor) {
        const luminance = this.getLuminance(backgroundColor);
        
        // Jika background terang (luminance > 0.5), gunakan warna gelap
        // Jika background gelap (luminance <= 0.5), gunakan warna terang
        if (luminance > 0.5) {
            // Background terang, gunakan warna gelap
            return { r: 0, g: 0, b: 0 }; // Hitam
        } else {
            // Background gelap, gunakan warna terang
            return { r: 255, g: 255, b: 255 }; // Putih
        }
    }

    /**
     * Mengubah filter CSS untuk gambar (logo dan discord)
     */
    applyImageFilter(element, targetColor) {
        if (!element) return;

        // Untuk gambar putih, kita bisa menggunakan filter invert dan brightness
        // Jika target hitam (background terang), invert menjadi hitam
        // Jika target putih (background gelap), tetap putih (tidak perlu filter)

        if (targetColor.r === 0 && targetColor.g === 0 && targetColor.b === 0) {
            // Target hitam - invert gambar putih menjadi hitam
            element.style.filter = 'invert(1) brightness(0)';
        } else {
            // Target putih - gambar tetap putih (default)
            element.style.filter = 'invert(0) brightness(1)';
        }
    }

    /**
     * Mengubah warna text
     */
    applyTextColor(element, targetColor) {
        if (!element) return;

        const colorString = `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`;
        element.style.color = colorString;
    }

    /**
     * Update semua warna elemen
     */
    updateColors() {
        // Update logo (di kiri navbar, biasanya di atas background gelap)
        if (this.elements.logo) {
            const logoBg = this.getBackgroundColor(this.elements.logo);
            if (logoBg) {
                const logoColor = this.getContrastColor(logoBg);
                this.applyImageFilter(this.elements.logo, logoColor);
            }
        }

        // Update discord (di kiri navbar, biasanya di atas background gelap)
        if (this.elements.discord) {
            const discordBg = this.getBackgroundColor(this.elements.discord);
            if (discordBg) {
                const discordColor = this.getContrastColor(discordBg);
                this.applyImageFilter(this.elements.discord, discordColor);
            }
        }

        // Update user name (di kanan navbar, bisa di atas background gelap atau terang)
        if (this.elements.userName) {
            const userNameBg = this.getBackgroundColor(this.elements.userName);
            if (userNameBg) {
                const userNameColor = this.getContrastColor(userNameBg);
                this.applyTextColor(this.elements.userName, userNameColor);
            }
        }

        // Update user icon (emoji) - ubah filter juga
        if (this.elements.userIcon) {
            const userIconBg = this.getBackgroundColor(this.elements.userIcon);
            if (userIconBg) {
                const userIconColor = this.getContrastColor(userIconBg);
                // Untuk emoji, kita bisa menggunakan filter atau mengubah font color
                this.elements.userIcon.style.filter = userIconColor.r === 0 
                    ? 'invert(1) brightness(0)' 
                    : 'invert(0) brightness(1)';
            }
        }
    }

    /**
     * Cleanup saat tidak digunakan lagi
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        window.removeEventListener('scroll', this.updateColors);
        window.removeEventListener('resize', this.updateColors);
    }
}

// Inisialisasi otomatis
const colorAdaptiveController = new ColorAdaptiveController();

