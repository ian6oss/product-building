
class LottoDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .lotto-numbers {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .number-circle {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background-color: var(--secondary-color, #f5a623);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                    animation: pop-in 0.5s ease forwards;
                }

                @keyframes pop-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            </style>
            <div class="lotto-numbers">
                <p>Click the button to generate numbers!</p>
            </div>
        `;
    }

    displayNumbers(numbers) {
        const container = this.shadowRoot.querySelector('.lotto-numbers');
        container.innerHTML = '';
        numbers.forEach((number, index) => {
            const circle = document.createElement('div');
            circle.classList.add('number-circle');
            circle.textContent = number;
            circle.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(circle);
        });
    }
}

customElements.define('lotto-display', LottoDisplay);

const THEME_STORAGE_KEY = 'theme';
const themeToggleBtn = document.getElementById('theme-toggle-btn');

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeToggleBtn.textContent = theme === 'dark' ? 'White Mode' : 'Dark Mode';
}

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});

document.getElementById('generate-btn').addEventListener('click', () => {
    const lottoDisplay = document.querySelector('lotto-display');
    const numbers = generateUniqueNumbers();
    lottoDisplay.displayNumbers(numbers);
});

function generateUniqueNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}
