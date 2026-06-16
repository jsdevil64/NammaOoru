// TOP-LA INTHA LINE-A ADD PANNUNGA (Unga Web App URL-a inga podunga)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwMmTweux2sZChYAGtTglWXtcgs4EQEXTuQfz9vlZVkTjY0vVFG8TS-503rBcAIcCbG/exec';

const expertGrid = document.getElementById('experts-grid');
const openFormBtn = document.getElementById('open-form-btn');
const registerModal = document.getElementById('register-modal');
const closeRegBtn = document.getElementById('close-reg-btn');
const closeRevBtn = document.getElementById('close-rev-btn');
const expertForm = document.getElementById('expert-form');
const resultsCount = document.getElementById('results-count');

const reviewModal = document.getElementById('review-modal');
const reviewForm = document.getElementById('review-form');
const modalReviewsList = document.getElementById('modal-reviews-list');
const modalReviewCount = document.getElementById('modal-review-count');

const searchBtn = document.getElementById('search-btn');
const areaSearch = document.getElementById('area-search');
const serviceFilter = document.getElementById('service-filter');
const chips = document.querySelectorAll('.chip');

let experts = [];
let activeExpertId = null; 

// GOOGLE SHEET-LA IRUNTHU DATA-VA FETCH PANNUM FUNCTION (சுத்தப்படுத்தப்பட்ட ஒரே ஒரு ஃபங்ஷன்)
async function loadExpertsFromSheet() {
    expertGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1;"><p>விபரங்கள் லோடு ஆகிறது...</p></div>';
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET", redirect: "follow" });
        experts = await response.json();
        
        if (experts.error) {
            console.error("Apps Script Error:", experts.error);
            expertGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>Apps Script-la error ullathu!</p></div>';
        } else {
            handleSearch();
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        expertGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>டேட்டா லோடு செய்வதில் பிழை ஏற்பட்டுள்ளது!</p></div>';
    }
}

// PREMIUM RANKING ENGINE (Premium First -> Then Rating Sorting High to Low)
function sortExpertsData(array) {
    return array.sort((a, b) => {
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        return parseFloat(b.rating) - parseFloat(a.rating);
    });
}

// Function to render profiles
function renderExperts(dataToRender = experts) {
    expertGrid.innerHTML = '';
    
    const sortedData = sortExpertsData([...dataToRender]);
    resultsCount.textContent = `${sortedData.length} பதிவுகள் உள்ளன`;

    if(sortedData.length === 0) {
        expertGrid.innerHTML = `
            <div style="text-align:center; padding:40px; color:#64748B; grid-column: 1/-1;">
                <i class="fa-solid fa-store-slash" style="font-size:40px; margin-bottom:10px; color:#cbd5e1;"></i>
                <p>இந்த ஏரியாவில் விபரங்கள் எதுவும் இல்லை! முதல் ஆளாகப் பதிவு செய்யுங்கள்.</p>
            </div>`;
        return;
    }

    sortedData.forEach(expert => {
        const card = document.createElement('div');
        card.classList.add('expert-card');
        
        if (expert.isPremium) {
            card.classList.add('premium-active');
        }
        
        let avatarHTML = '';
        if (expert.image) {
            avatarHTML = `<img src="${expert.image}" alt="${expert.name}" class="avatar-image">`;
        } else {
            let iconClass = 'fa-bed';
            if (expert.prof === 'food') iconClass = 'fa-utensils';
            if (expert.prof === 'health') iconClass = 'fa-heart-pulse';
            avatarHTML = `<div class="avatar-container"><i class="fa-solid ${iconClass}"></i></div>`;
        }
        
        let tagHTML = '';
        if (expert.isPremium) {
            tagHTML = `<span class="premium-tag"><i class="fa-solid fa-crown"></i> Premium</span>`;
        }
        
        card.innerHTML = `
            ${tagHTML}
            <div class="card-left" onclick="openReviewSystem('${expert.id}')">
                ${avatarHTML}
                <div class="expert-info">
                    <span class="badge">${getProfTamil(expert.prof)}</span>
                    <h4>${expert.name}</h4>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${expert.location}</p>
                    <div class="rating-badge"><i class="fa-solid fa-star"></i> <span>${expert.rating}</span></div>
                </div>
            </div>
            <div class="card-right-actions">
                <div class="action-buttons-row">
                    <a href="tel:${expert.phone}" class="call-btn-link">
                        <i class="fa-solid fa-phone"></i>
                    </a>
                </div>
            </div>
        `;
        expertGrid.appendChild(card);
    });
}

function getProfTamil(prof) {
    if(prof === 'pg') return 'Rooms & PG';
    if(prof === 'food') return 'உணவகம் & மெஸ்';
    if(prof === 'health') return 'கிளினிக் / ஹாஸ்பிட்டல்';
    return prof;
}

// Open Review Modal System
window.openReviewSystem = function(id) {
    const expert = experts.find(e => e.id === id);
    if (!expert) return;

    activeExpertId = id;
    document.getElementById('modal-expert-name').textContent = expert.name;
    document.getElementById('modal-expert-prof').textContent = getProfTamil(expert.prof);
    document.getElementById('modal-expert-loc').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${expert.location}`;
    
    const avatarDiv = document.getElementById('modal-expert-avatar');
    if (expert.image) {
        avatarDiv.innerHTML = `<img src="${expert.image}" class="avatar-image">`;
    } else {
        let iconClass = 'fa-bed';
        if (expert.prof === 'food') iconClass = 'fa-utensils';
        if (expert.prof === 'health') iconClass = 'fa-heart-pulse';
        avatarDiv.innerHTML = `<div class="avatar-container" style="margin-bottom:0;"><i class="fa-solid ${iconClass}"></i></div>`;
    }

    renderReviewsList(expert);
    reviewModal.style.display = 'flex';
}

function renderReviewsList(expert) {
    modalReviewsList.innerHTML = '';
    modalReviewCount.textContent = expert.reviews.length;

    if (expert.reviews.length === 0) {
        modalReviewsList.innerHTML = `<p style="font-size:12px; color:#64748B; text-align:center; padding:10px;">மதிப்புரைகள் எதுவும் இல்லை.</p>`;
        return;
    }

    expert.reviews.forEach(rev => {
        const revCard = document.createElement('div');
        revCard.classList.add('single-review-card');
        let stars = '⭐'.repeat(rev.stars);
        revCard.innerHTML = `
            <div class="review-stars">${stars}</div>
            <p class="review-comment">${rev.text}</p>
        `;
        modalReviewsList.appendChild(revCard);
    });
}

reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ratingSelect = document.getElementById('review-rating').value;
    const reviewText = document.getElementById('review-text').value;

    const expert = experts.find(e => e.id === activeExpertId);
    if (expert) {
        expert.reviews.unshift({ stars: parseInt(ratingSelect), text: reviewText });
        const totalStars = expert.reviews.reduce((sum, r) => sum + r.stars, 0);
        expert.rating = (totalStars / expert.reviews.length).toFixed(1);
        renderReviewsList(expert);
        handleSearch();
        reviewForm.reset();
    }
});

// SEARCH FILTER WITH LIVE SORTING
function handleSearch() {
    const searchText = areaSearch.value.toLowerCase().trim();
    const selectedService = serviceFilter.value;

    const filtered = experts.filter(expert => {
        const matchesLocation = expert.location.toLowerCase().includes(searchText);
        const matchesService = (selectedService === 'all') || (expert.prof === selectedService);
        return matchesLocation && matchesService;
    });

    renderExperts(filtered);
}

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filterValue = chip.getAttribute('data-filter');
        serviceFilter.value = filterValue;
        handleSearch();
    });
});

searchBtn.addEventListener('click', handleSearch);
areaSearch.addEventListener('keyup', (e) => { if(e.key === 'Enter') handleSearch(); });

// MODAL OPEN / CLOSE EVENTS (இப்போது கச்சிதமாக வேலை செய்யும்)
openFormBtn.addEventListener('click', () => { registerModal.style.display = 'flex'; });
closeRegBtn.addEventListener('click', () => { registerModal.style.display = 'none'; });
closeRevBtn.addEventListener('click', () => { reviewModal.style.display = 'none'; });

// FORM SUBMIT ACTION
expertForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('profile-pic');
    const file = fileInput.files[0];
    
    const saveExpert = async (imageSrc = null) => {
        const newExpertData = {
            id: Date.now().toString(),
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            prof: document.getElementById('prof').value,
            location: document.getElementById('location').value,
            rating: "5.0",
            image: imageSrc,
            isPremium: false,
            reviews: []
        };

        experts.unshift(newExpertData);
        handleSearch(); 
        
        registerModal.style.display = 'none';
        expertForm.reset();

        const sheetPayload = {
            action: "create",
            ...newExpertData
        };
        delete sheetPayload.reviews; 

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sheetPayload)
            });
            console.log("Data saved to Google Sheet!");
        } catch (error) {
            console.error("Sheet save error:", error);
        }
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) { 
            saveExpert(event.target.result); 
        };
        reader.readAsDataURL(file);
    } else {
        saveExpert(null);
    }
});

// App Initialization
loadExpertsFromSheet();
