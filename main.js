
const MODEL_URL_BASE = 'https://teachablemachine.withgoogle.com/models/1fxBTDvAK/';

let model;
let labelContainer;
let maxPredictions = 0;
let isModelReady = false;

const startBtn = document.getElementById('start-btn');
const testPanel = document.getElementById('test-panel');
const photoInput = document.getElementById('photo-input');
const previewImage = document.getElementById('preview-image');
const animalResult = document.getElementById('animal-result');
const confidenceBar = document.getElementById('confidence-bar');

startBtn.addEventListener('click', () => {
    if (isModelReady) {
        return;
    }
    init().catch(handleError);
});

photoInput.addEventListener('change', () => {
    predictFromUpload().catch(handleError);
});

async function init() {
    startBtn.disabled = true;
    startBtn.textContent = '모델 준비 중...';

    const modelURL = `${MODEL_URL_BASE}model.json`;
    const metadataURL = `${MODEL_URL_BASE}metadata.json`;
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    isModelReady = true;

    testPanel.classList.remove('hidden');
    photoInput.value = '';
    previewImage.removeAttribute('src');

    labelContainer = document.getElementById('label-container');
    labelContainer.innerHTML = '';
    for (let i = 0; i < maxPredictions; i += 1) {
        labelContainer.appendChild(document.createElement('div'));
    }

    startBtn.textContent = '준비 완료';
    animalResult.textContent = '사진을 업로드하면 바로 분석합니다.';
}

async function predictFromUpload() {
    if (!isModelReady) {
        return;
    }

    const file = photoInput.files && photoInput.files[0];
    if (!file) {
        return;
    }

    animalResult.textContent = '사진 분석 중...';
    const objectUrl = URL.createObjectURL(file);
    try {
        await loadPreviewImage(objectUrl);
        await predict(previewImage);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function loadPreviewImage(src) {
    await new Promise((resolve, reject) => {
        previewImage.onload = resolve;
        previewImage.onerror = reject;
        previewImage.src = src;
    });
}

async function predict(imageElement) {
    const prediction = await model.predict(imageElement);
    const topPrediction = prediction.reduce((best, current) => (
        current.probability > best.probability ? current : best
    ));

    const percentage = Math.round(topPrediction.probability * 100);
    animalResult.textContent = formatResultMessage(topPrediction.className, percentage);
    confidenceBar.style.width = `${percentage}%`;

    for (let i = 0; i < maxPredictions; i += 1) {
        const current = prediction[i];
        labelContainer.childNodes[i].textContent = `${current.className}: ${(current.probability * 100).toFixed(1)}%`;
    }
}

function formatResultMessage(className, percentage) {
    if (className.includes('dog') || className.includes('강아지')) {
        return `당신은 ${percentage}% 확률로 강아지상입니다.`;
    }
    if (className.includes('cat') || className.includes('고양이')) {
        return `당신은 ${percentage}% 확률로 고양이상입니다.`;
    }
    return `가장 가까운 동물상은 ${className} (${percentage}%)`;
}

function handleError(error) {
    console.error(error);
    startBtn.disabled = false;
    startBtn.textContent = '다시 시도';
    animalResult.textContent = '모델 로딩 또는 이미지 분석에 실패했습니다.';
}
