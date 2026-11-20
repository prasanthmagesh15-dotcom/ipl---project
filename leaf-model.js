(function () {
    const resultKey = 'agrismart-leaf-analysis';
    const imageSize = 160;
    const classLabels = [
        { crop: 'Pepper', condition: 'Bacterial Spot' },
        { crop: 'Pepper', condition: 'Healthy' },
        { crop: 'Potato', condition: 'Early Blight' },
        { crop: 'Potato', condition: 'Late Blight' },
        { crop: 'Potato', condition: 'Healthy' },
        { crop: 'Tomato', condition: 'Bacterial Spot' },
        { crop: 'Tomato', condition: 'Early Blight' },
        { crop: 'Tomato', condition: 'Late Blight' },
        { crop: 'Tomato', condition: 'Leaf Mold' },
        { crop: 'Tomato', condition: 'Septoria Leaf Spot' },
        { crop: 'Tomato', condition: 'Spider Mites (Two-Spotted Spider Mite)' },
        { crop: 'Tomato', condition: 'Target Spot' },
        { crop: 'Tomato', condition: 'Tomato Yellow Leaf Curl Virus' },
        { crop: 'Tomato', condition: 'Tomato Mosaic Virus' },
        { crop: 'Tomato', condition: 'Healthy' }
    ];

    function showLatestResult() {
        const heading = document.getElementById('analysis-class');
        if (!heading) return;

        const scoreText = document.getElementById('analysis-score');
        const imageText = document.getElementById('analysis-image');
        let result;
        try {
            result = JSON.parse(sessionStorage.getItem(resultKey) || 'null');
        } catch (error) {
            console.error('Could not read the previous leaf analysis.', error);
        }

        if (!result || !Number.isInteger(result.classIndex) ||
            result.classIndex < 0 || result.classIndex >= 15) {
            return;
        }

        const label = classLabels[result.classIndex];
        heading.textContent = `${label.crop}: ${label.condition}`;
        scoreText.textContent = result.isProbability
            ? `Model score: ${(result.score * 100).toFixed(1)}%`
            : `Model score: ${result.score.toFixed(4)}`;
        imageText.textContent = `Image: ${result.imageName}`;
        imageText.hidden = false;
    }

    function initializeAnalyzer() {
        const input = document.getElementById('leaf-image');
        if (!input) return;

        const preview = document.getElementById('leaf-preview');
        const analyzeButton = document.getElementById('analyze-image');
        const status = document.getElementById('analysis-status');
        let imageUrl = '';
        let modelPromise;

        input.addEventListener('change', () => {
            const file = input.files && input.files[0];
            analyzeButton.disabled = !file;
            if (imageUrl) URL.revokeObjectURL(imageUrl);
            imageUrl = '';
            preview.hidden = true;
            status.textContent = '';

            if (!file) return;
            if (!file.type.startsWith('image/')) {
                status.textContent = 'Please choose a valid image file.';
                analyzeButton.disabled = true;
                return;
            }

            imageUrl = URL.createObjectURL(file);
            preview.onload = () => {
                preview.hidden = false;
                status.textContent = 'Image ready. Tap Analyze Image to run the offline model.';
            };
            preview.onerror = () => {
                status.textContent = 'This image could not be opened. Please choose another image.';
                analyzeButton.disabled = true;
            };
            preview.src = imageUrl;
        });

        analyzeButton.addEventListener('click', async () => {
            const file = input.files && input.files[0];
            if (!file || !preview.naturalWidth) {
                status.textContent = 'Choose a valid leaf image before analyzing.';
                return;
            }

            analyzeButton.disabled = true;
            input.disabled = true;
            try {
                status.textContent = 'Loading the offline AI model...';
                if (!window.tf || !window.tflite) {
                    throw new Error('The local AI runtime did not load. Reopen the app after it has been installed.');
                }
                if (!modelPromise) {
                    modelPromise = (async () => {
                        tflite.setWasmPath('./vendor/tfjs-tflite/wasm/');
                        await tf.setBackend('cpu');
                        await tf.ready();
                        return tflite.loadTFLiteModel('./AgriNex_AI.tflite', { numThreads: 1 });
                    })();
                }
                const model = await modelPromise;

                status.textContent = 'Analyzing the image on this device...';
                const canvas = document.createElement('canvas');
                canvas.width = imageSize;
                canvas.height = imageSize;
                const context = canvas.getContext('2d', { willReadFrequently: true });
                if (!context) throw new Error('This browser cannot prepare the selected image.');
                context.drawImage(preview, 0, 0, imageSize, imageSize);

                const pixels = context.getImageData(0, 0, imageSize, imageSize).data;
                const values = new Float32Array(imageSize * imageSize * 3);
                for (let source = 0, target = 0; target < values.length; source += 4, target += 3) {
                    values[target] = pixels[source] / 127.5 - 1;
                    values[target + 1] = pixels[source + 1] / 127.5 - 1;
                    values[target + 2] = pixels[source + 2] / 127.5 - 1;
                }

                const inputTensor = tf.tensor4d(values, [1, imageSize, imageSize, 3]);
                let outputTensor;
                try {
                    outputTensor = model.predict(inputTensor);
                    const scores = Array.from(await outputTensor.data());
                    if (scores.length !== 15 || scores.some((score) => !Number.isFinite(score))) {
                        throw new Error('The model returned an unexpected result. Expected 15 finite class scores.');
                    }

                    let classIndex = 0;
                    for (let index = 1; index < scores.length; index += 1) {
                        if (scores[index] > scores[classIndex]) classIndex = index;
                    }
                    const sum = scores.reduce((total, score) => total + score, 0);
                    const isProbability = scores.every((score) => score >= 0 && score <= 1) &&
                        Math.abs(sum - 1) < 0.05;
                    const result = {
                        classIndex,
                        crop: classLabels[classIndex].crop,
                        condition: classLabels[classIndex].condition,
                        score: scores[classIndex],
                        isProbability,
                        imageName: file.name,
                        analyzedAt: new Date().toISOString()
                    };
                    sessionStorage.setItem(resultKey, JSON.stringify(result));
                    location.href = 'ai.html';
                } finally {
                    inputTensor.dispose();
                    if (outputTensor && typeof outputTensor.dispose === 'function') {
                        outputTensor.dispose();
                    }
                }
            } catch (error) {
                console.error('Leaf image analysis failed.', error);
                status.textContent = `Analysis failed: ${error.message}`;
                analyzeButton.disabled = false;
                input.disabled = false;
                modelPromise = undefined;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        showLatestResult();
        initializeAnalyzer();
    });
})();
