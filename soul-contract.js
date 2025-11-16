// Soul Contract Letter-to-Number mapping
// Based on Hebrew alphabet correspondence
const letterValues = {
    'A': 1, 'J': 1, 'S': 1,
    'B': 2, 'K': 2, 'T': 2,
    'C': 3, 'L': 3, 'U': 3,
    'D': 4, 'M': 4, 'V': 4,
    'E': 5, 'N': 5, 'W': 5,
    'F': 6, 'O': 6, 'X': 6,
    'G': 7, 'P': 7, 'Y': 7,
    'H': 8, 'Q': 8, 'Z': 8,
    'I': 9, 'R': 9
};

const numberMeanings = {
    1: "Leadership, independence, new beginnings, pioneering spirit",
    2: "Partnership, diplomacy, cooperation, balance",
    3: "Creativity, self-expression, joy, communication",
    4: "Stability, foundation, hard work, practicality",
    5: "Freedom, change, adventure, versatility",
    6: "Love, nurturing, responsibility, harmony",
    7: "Spirituality, introspection, wisdom, analysis",
    8: "Power, abundance, material success, authority",
    9: "Completion, humanitarianism, compassion, universal love",
    11: "Master number - Intuition, inspiration, spiritual insight",
    22: "Master number - Master builder, vision manifested into reality",
    33: "Master number - Master teacher, compassion and healing"
};

function convertLetterToNumber(letter) {
    return letterValues[letter.toUpperCase()] || 0;
}

function reduceToSingleDigit(number, keepMasterNumbers = true) {
    if (keepMasterNumbers && (number === 11 || number === 22 || number === 33)) {
        return number;
    }

    while (number > 9 && number !== 11 && number !== 22 && number !== 33) {
        number = String(number).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    return number;
}

function isVowel(letter) {
    return 'AEIOU'.includes(letter.toUpperCase());
}

function calculateSoulContract() {
    const fullName = document.getElementById('fullName').value.trim();

    if (!fullName) {
        alert('Please enter a name');
        return;
    }

    const names = fullName.split(' ').filter(n => n.length > 0);
    let vowelSum = 0;
    let consonantSum = 0;
    let totalSum = 0;
    let breakdown = [];

    names.forEach(name => {
        let nameVowels = 0;
        let nameConsonants = 0;
        let letterBreakdown = '';

        for (let letter of name) {
            if (/[a-zA-Z]/.test(letter)) {
                const value = convertLetterToNumber(letter);
                totalSum += value;

                if (isVowel(letter)) {
                    vowelSum += value;
                    nameVowels += value;
                    letterBreakdown += `<span style="color: var(--primary-color); font-weight: bold;">${letter}(${value})</span> `;
                } else {
                    consonantSum += value;
                    nameConsonants += value;
                    letterBreakdown += `<span style="color: var(--text-light);">${letter}(${value})</span> `;
                }
            }
        }

        breakdown.push({
            name: name,
            letters: letterBreakdown,
            vowels: nameVowels,
            consonants: nameConsonants,
            total: nameVowels + nameConsonants
        });
    });

    // Calculate key numbers
    const soulDestiny = reduceToSingleDigit(totalSum);
    const spiritualGoal = reduceToSingleDigit(vowelSum);
    const physicalGoal = reduceToSingleDigit(consonantSum);
    const talents = reduceToSingleDigit(vowelSum + consonantSum);

    // Display results
    displayResults(breakdown, {
        soulDestiny,
        spiritualGoal,
        physicalGoal,
        talents
    });

    // Save to session for export
    sessionStorage.setItem('lastReading', JSON.stringify({
        name: fullName,
        breakdown,
        numbers: { soulDestiny, spiritualGoal, physicalGoal, talents },
        timestamp: new Date().toISOString()
    }));
}

function displayResults(breakdown, numbers) {
    // Show results section
    document.getElementById('results').style.display = 'block';

    // Display name breakdown
    let breakdownHTML = '<div>';
    breakdown.forEach(item => {
        breakdownHTML += `
            <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 8px;">
                <h4 style="color: var(--primary-color);">${item.name}</h4>
                <p style="line-height: 2; margin: 0.5rem 0;">${item.letters}</p>
                <p style="font-size: 0.9rem; color: var(--text-light);">
                    Vowels: ${item.vowels} | Consonants: ${item.consonants} | Total: ${item.total}
                </p>
            </div>
        `;
    });
    breakdownHTML += '</div>';
    document.getElementById('nameBreakdown').innerHTML = breakdownHTML;

    // Display numbers
    document.getElementById('soulDestiny').textContent = numbers.soulDestiny;
    document.getElementById('spiritualGoal').textContent = numbers.spiritualGoal;
    document.getElementById('physicalGoal').textContent = numbers.physicalGoal;
    document.getElementById('talents').textContent = numbers.talents;

    // Display interpretation
    const interpretation = `
        <div style="line-height: 1.8;">
            <p><strong>Soul Destiny (${numbers.soulDestiny}):</strong> ${numberMeanings[numbers.soulDestiny] || 'Custom interpretation needed'}</p>
            <p>Your soul's ultimate purpose and the path you're meant to walk in this lifetime.</p>

            <p style="margin-top: 1rem;"><strong>Spiritual Goal (${numbers.spiritualGoal}):</strong> ${numberMeanings[numbers.spiritualGoal] || 'Custom interpretation needed'}</p>
            <p>What your soul desires to experience and express spiritually.</p>

            <p style="margin-top: 1rem;"><strong>Physical Goal (${numbers.physicalGoal}):</strong> ${numberMeanings[numbers.physicalGoal] || 'Custom interpretation needed'}</p>
            <p>How you're meant to manifest and take action in the physical world.</p>

            <p style="margin-top: 1rem;"><strong>Talents (${numbers.talents}):</strong> ${numberMeanings[numbers.talents] || 'Custom interpretation needed'}</p>
            <p>The natural gifts and abilities you bring into this lifetime.</p>
        </div>
    `;
    document.getElementById('interpretation').innerHTML = interpretation;

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function clearResults() {
    document.getElementById('fullName').value = '';
    document.getElementById('results').style.display = 'none';
    sessionStorage.removeItem('lastReading');
}

function exportReading() {
    const reading = JSON.parse(sessionStorage.getItem('lastReading'));

    if (!reading) {
        alert('No reading to export. Please calculate first.');
        return;
    }

    // Create text version for download
    let text = `SOUL CONTRACT READING\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Name: ${reading.name}\n`;
    text += `Date: ${new Date(reading.timestamp).toLocaleDateString()}\n\n`;
    text += `KEY NUMBERS:\n`;
    text += `Soul Destiny: ${reading.numbers.soulDestiny}\n`;
    text += `Spiritual Goal: ${reading.numbers.spiritualGoal}\n`;
    text += `Physical Goal: ${reading.numbers.physicalGoal}\n`;
    text += `Talents: ${reading.numbers.talents}\n\n`;
    text += `INTERPRETATION:\n\n`;
    text += `Soul Destiny (${reading.numbers.soulDestiny}):\n`;
    text += `${numberMeanings[reading.numbers.soulDestiny]}\n\n`;
    text += `Spiritual Goal (${reading.numbers.spiritualGoal}):\n`;
    text += `${numberMeanings[reading.numbers.spiritualGoal]}\n\n`;
    text += `Physical Goal (${reading.numbers.physicalGoal}):\n`;
    text += `${numberMeanings[reading.numbers.physicalGoal]}\n\n`;
    text += `Talents (${reading.numbers.talents}):\n`;
    text += `${numberMeanings[reading.numbers.talents]}\n\n`;
    text += `${'='.repeat(50)}\n`;
    text += `This reading is for personal guidance only.\n`;

    // Download as text file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soul-contract-${reading.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function copyToClipboard() {
    const reading = JSON.parse(sessionStorage.getItem('lastReading'));

    if (!reading) {
        alert('No reading to copy. Please calculate first.');
        return;
    }

    const text = `Soul Contract Reading for ${reading.name}\n` +
                 `Soul Destiny: ${reading.numbers.soulDestiny} | ` +
                 `Spiritual Goal: ${reading.numbers.spiritualGoal} | ` +
                 `Physical Goal: ${reading.numbers.physicalGoal} | ` +
                 `Talents: ${reading.numbers.talents}`;

    navigator.clipboard.writeText(text).then(() => {
        alert('Reading copied to clipboard!');
    });
}
