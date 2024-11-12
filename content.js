// Fetch rating
async function fetchProfessorRating(profName) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['ratingsData'], (result) => {
            const ratingsData = result.ratingsData;
            resolve(ratingsData?.[profName] || "No rating found");
        });
    });
}

// Add rating in website
async function injectRating() {
    const instructorElements = document.querySelectorAll('.instructor-detail');

    for (const instructorElement of instructorElements) {
        const nameElement = instructorElement.querySelector('.instructor-name');

        if (nameElement && !nameElement.querySelector('.rmp-rating')) { 
            const profName = nameElement.innerText.trim();
            const rating = await fetchProfessorRating(profName);

            const ratingElement = document.createElement('span');
            ratingElement.classList.add('rmp-rating'); 
            ratingElement.innerText = ` | RMP Rating: ${rating}`;
            ratingElement.style.fontWeight = 'bold';
            ratingElement.style.marginLeft = '5px';

            // Color Ratings
            if (rating === "No rating found") {
                ratingElement.style.color = 'gray';
            } else {
                const ratingValue = Number.parseFloat(rating);
                if (ratingValue >= 4.0) {
                    ratingElement.style.color = 'green';
                } else if (ratingValue > 3.5) {
                    ratingElement.style.color = 'orange';
                } else {
                    ratingElement.style.color = 'red';
                }
            }

            nameElement.appendChild(ratingElement);
        }
    }
}

function observeCourseDetails() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver((mutationsList) => {
        let shouldInject = false;

        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const instructorSection = document.querySelector('.instructor-detail');
                if (instructorSection) {
                    shouldInject = true;
                    break;
                }
            }
        }

        if (shouldInject) {
            observer.disconnect(); 
            injectRating().then(() => observer.observe(targetNode, config)); 
        }
    });

    observer.observe(targetNode, config);
}

observeCourseDetails();
