(function () {
    const activeFarmerKey = 'agrinex-active-farmer';
    const readings = {
        kumar: { moisture: 68, temperature: 31, humidity: 74, ph: 7.4 },
        ravi: { moisture: 18, temperature: 36, humidity: 34, ph: 5.2 }
    };

    function getFarmReadings() {
        return readings[sessionStorage.getItem(activeFarmerKey)] || readings.kumar;
    }

    function getReply(question) {
        const text = question.toLowerCase();
        const farm = getFarmReadings();
        const has = (words) => words.some((word) => text.includes(word));

        if (text.trim() === 'hi' || has(['hello', 'hi ', 'hey', 'hai', 'vanakkam', 'vanakam', 'வணக்கம்', 'ஹாய்'])) {
            return 'Hello! Ask me about your soil moisture, watering, paddy care, sensor readings, or leaf analysis.';
        }
        if (has(['soil', 'moisture', 'soil water', 'mannu', 'man eeram', 'mannila eeram', 'mannin eeram', 'மண்ணின் ஈரம்', 'மண் ஈரம்', 'ஈரப்பதம்'])) {
            return `Soil moisture is ${farm.moisture}%. ${farm.moisture < 30 ? 'It is low. Water the field gradually and check the soil again; avoid flooding.' : 'It is in the optimal range. Keep checking the soil and avoid overwatering.'}`;
        }
        if (has(['water', 'watering', 'irrigat', 'thanni', 'tanni', 'thanneer', 'neer paay', 'pasanam', 'thanni oothu', 'thanni vidu', 'thanni vida', 'thanni eppo', 'தண்ணீர்', 'நீர் பாய', 'பாசனம்'])) {
            return farm.moisture < 30
                ? 'Soil moisture is low. Water the paddy gradually, then check the soil again. Avoid flooding and follow local agricultural guidance.'
                : 'Soil moisture is in the optimal range. Keep the soil moist, but avoid excess water. Check the field before watering.';
        }
        if (has(['temperature', 'hot', 'veppam', 'veppanilai', 'soodu', 'veyil', 'வெப்ப', 'சூடு'])) {
            return `Temperature is ${farm.temperature}°C. Check the field during cooler hours and follow local weather guidance.`;
        }
        if (has(['humidity', 'kaatru eeram', 'kaatru eerappatham', 'ஈரத்தன்மை'])) {
            return `Humidity is ${farm.humidity}%. Check your plants and local conditions before changing irrigation.`;
        }
        if (has(['ph', 'soil acidity', 'mann ph', 'mannoda ph', 'mann acidity', 'மண் ph', 'மண்ணின் ph'])) {
            return `Soil pH is ${farm.ph}. pH needs crop and soil context; do not add lime or other amendments based only on this value. Ask a local agriculture expert for a soil-test-based plan.`;
        }
        if (has(['sensor', 'reading', 'sensors', 'sensor alavu', 'sensor reading', 'alaveedu', 'alavugal', 'சென்சார்', 'அளவீடு'])) {
            return `Soil moisture is ${farm.moisture}%, temperature is ${farm.temperature}°C, humidity is ${farm.humidity}%, and pH is ${farm.ph}.`;
        }
        if (has(['leaf', 'disease', 'spot', 'blight', 'ilai', 'ilaila pulli', 'ilai noi', 'noi', 'karai', 'pulli', 'இலை', 'நோய்'])) {
            return 'To check a leaf, choose “Capture or choose a leaf” and run the on-device model. Review the crop and condition it identifies, and confirm with an agriculture expert before treatment.';
        }
        if (has(['fertiliz', 'manure', 'nutrient', 'uram', 'uram podu', 'eruv', 'ஊட்டச்சத்து', 'உரம்'])) {
            return 'Use well-decomposed organic manure where appropriate, and choose fertilizer amounts from a soil test and local agricultural advice. Avoid applying an unknown dose.';
        }
        if (has(['paddy', 'rice', 'crop', 'nel', 'nell', 'nel payir', 'payir', 'vivasayam', 'விவசாயம்', 'நெல்', 'பயிர்'])) {
            return 'For paddy, keep the soil appropriately moist, avoid excess water, and check plants regularly for pests or disease. Follow advice suited to your crop stage and local conditions.';
        }
        if (has(['weather', 'mazhai', 'malai', 'vaanilai', 'kaalanilai', 'மழை', 'வானிலை'])) {
            return 'Check the weather forecast before planning field work.';
        }
        if (has(['help', 'udhavi', 'uthavi', 'உதவி'])) {
            return 'I can answer common questions about soil moisture, watering, paddy care, sensor readings, fertilizer basics, weather information, and leaf analysis.';
        }

        return 'Try asking about soil moisture (man eeram), watering (thanni), paddy (nel), sensor readings, fertilizer (uram), weather (vaanilai), or leaf disease (ilai noi).';
    }

    function appendMessage(list, text, isUser) {
        const message = document.createElement('div');
        message.className = isUser ? 'chat-bubble user' : 'chat-bubble';
        message.textContent = text;
        list.appendChild(message);
        message.scrollIntoView({ block: 'nearest' });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const list = document.getElementById('chat-list');
        if (!form || !input || !list) return;

        const farmerName = document.getElementById('chat-farmer-name');
        if (farmerName) {
            farmerName.textContent = sessionStorage.getItem(activeFarmerKey) === 'ravi' ? 'Ravi' : 'Kumar';
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const question = input.value.trim();
            if (!question) return;

            appendMessage(list, question, true);
            appendMessage(list, getReply(question), false);
            input.value = '';
            input.focus();
        });
    });
})();
