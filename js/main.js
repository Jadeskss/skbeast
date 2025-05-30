document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality (existing code)
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('nav');
    
    if (hamburgerMenu) {
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        
        // Toggle menu function
        function toggleMenu() {
            hamburgerMenu.classList.toggle('active');
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Prevent body scrolling when menu is open
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        hamburgerMenu.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        
        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (nav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
        
        // Close menu on window resize (if desktop view)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && nav.classList.contains('active')) {
                toggleMenu();
            }
        });
    }
    
    // Registration form functionality
    const registrationForm = document.getElementById('registration-form');
    const tournamentSelect = document.getElementById('tournamentId');
    const addMemberBtn = document.getElementById('add-member');
    const teamMembersContainer = document.getElementById('team-members-container');
    
    // Load tournaments into the dropdown
    if (tournamentSelect) {
        loadTournamentOptions();
    }
    
    // Add team member functionality
    if (addMemberBtn) {
        let memberCount = 2; // Already have 2 members in the HTML
        
        addMemberBtn.addEventListener('click', function() {
            memberCount++;
            
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-member';
            memberDiv.innerHTML = `
                <h4>Team Member #${memberCount}</h4>
                <div class="form-group">
                    <label for="member${memberCount}Name">Full Name:</label>
                    <input type="text" id="member${memberCount}Name" name="member${memberCount}Name" placeholder="Team member's name">
                </div>
                <div class="form-group">
                    <label for="member${memberCount}Gamertag">In-game Name/Tag:</label>
                    <input type="text" id="member${memberCount}Gamertag" name="member${memberCount}Gamertag" placeholder="Team member's in-game name">
                </div>
                <button type="button" class="btn-secondary remove-member">Remove</button>
            `;
            
            teamMembersContainer.appendChild(memberDiv);
            
            // Add event listener to the remove button
            const removeBtn = memberDiv.querySelector('.remove-member');
            removeBtn.addEventListener('click', function() {
                memberDiv.remove();
            });
        });
    }
    
    // Formspree form submission
    if (registrationForm) {
        // Update form action to Formspree endpoint
        registrationForm.action = "https://formspree.io/f/xvgaejzk";
        
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Create status message container if it doesn't exist
            let statusContainer = document.querySelector('.form-status');
            if (!statusContainer) {
                statusContainer = document.createElement('div');
                statusContainer.className = 'form-status';
                registrationForm.insertAdjacentElement('beforebegin', statusContainer);
            }
            
            // Display sending message
            statusContainer.innerHTML = `
                <div class="sending-message">
                    <p>Sending your registration... Please wait.</p>
                </div>
            `;
            statusContainer.style.display = 'block';
            
            // Scroll to status message
            statusContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Get form data
            const formData = new FormData(registrationForm);
            
            // Create structured team data for better email readability
            let teamData = {
                teamName: formData.get('teamName'),
                members: []
            };
            
            // Add captain (first member)
            teamData.members.push({
                role: "Captain",
                name: formData.get('name'),
                gamertag: formData.get('gamertag')
            });
            
            // Get all team members
            const teamMembers = document.querySelectorAll('.team-member');
            for (let i = 1; i < teamMembers.length; i++) {
                const nameInput = teamMembers[i].querySelector('input[id$="Name"]');
                const gamertagInput = teamMembers[i].querySelector('input[id$="Gamertag"]');
                
                if (nameInput && gamertagInput && (nameInput.value || gamertagInput.value)) {
                    teamData.members.push({
                        role: `Member #${i+1}`,
                        name: nameInput.value || "Not provided",
                        gamertag: gamertagInput.value || "Not provided"
                    });
                }
            }
            
            // Add structured team data
            formData.append('teamData', JSON.stringify(teamData));
            
            // Send data to Formspree
            fetch(registrationForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                // Success message
                statusContainer.innerHTML = `
                    <div class="success-message">
                        <h3>Registration Successful!</h3>
                        <p>Thank you for registering. We've received your information and will contact you soon with further details.</p>
                        <p>A confirmation email has been sent to your email address.</p>
                    </div>
                `;
                
                // Reset the form
                registrationForm.reset();
                
                // Remove additional team members (keep the first two)
                const teamMembers = document.querySelectorAll('.team-member');
                for (let i = 2; i < teamMembers.length; i++) {
                    teamMembers[i].remove();
                }
            })
            .catch(error => {
                // Error message
                statusContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Submission Error</h3>
                        <p>Sorry, there was a problem submitting your registration. Please try again or contact us directly.</p>
                        <p>Error details: ${error.message}</p>
                    </div>
                `;
            });
        });
    }
    
    const tournamentLinks = document.querySelectorAll('.tournament-link');
    tournamentLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tournamentId = this.dataset.tournamentId;
            // Logic to display tournament details can be added here
            console.log('Tournament ID:', tournamentId);
        });
    });

    // Only run on pages that have the tournaments container
    const tournamentsContainer = document.querySelector('.tournaments-container');
    if (tournamentsContainer) {
        fetchTournaments();
    }
});

// Scroll Animation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Options for the Intersection Observer
    const options = {
        root: null, // Use the viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when at least 10% of the element is visible
    };

    // Create the observer
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, options);

    // Get all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right, .zoom-in, .pulse');
    
    // Start observing each element
    animatedElements.forEach(element => {
        observer.observe(element);
    });
});

const tournamentData = {
  "tournaments": [
    {
      "id": 1,
      "name": "Mobile Legends Tournament Season 2",
      "date": "N/A",
      "registrationDeadline": "June 10, 2025",
      "venue": "Batchelor East Plaza",
      "description": "5v5 Mobile Legends tournament for youth residents of Batchelor East. Compete for cash prizes and bragging rights!",
      "gameType": "Mobile",
      "entryFee": "₱150 per team",
      "prizes": "1st Place: ₱3,000, 2nd Place: ₱2,000, 3rd Place: ₱1,000",
      "status": "open",
      "maxTeams": 16,
      "currentTeams": 0,
      "image": "assets/images/ml.png"
    },
    {
      "id": 2,
      "name": "Basketball Tournament",
      "date": "N/A",
      "registrationDeadline": "N/A",
      "venue": "N/A",
      "description": "N/A",
      "gameType": "N/A",
      "entryFee": "N/A",
      "prizes": "N/A",
      "status": "coming-soon",
      "maxTeams": 0,
      "currentTeams": 0,
      "image": "assets/images/bask.jpg"
    },
    {
      "id": 3,
      "name": "Volleyball Tournament",
      "date": "N/A",
      "registrationDeadline": "N/A",
      "venue": "N/A",
      "description": "N/A",
      "gameType": "N/A",
      "entryFee": "N/A",
      "prizes": "N/A",
      "status": "coming-soon",
      "maxTeams": 0,
      "currentTeams": 0,
      "image": "assets/images/voley.jpg"
    }
  ]
};

function fetchTournaments() {
    const tournamentsContainer = document.querySelector('.tournaments-container');
    const loadingElement = document.querySelector('.loading');
    
    // Use the inline data instead of fetching
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Display tournaments
    displayTournaments(tournamentData.tournaments);
}

function displayTournaments(tournaments) {
    const container = document.querySelector('.tournaments-container');
    
    if (tournaments.length === 0) {
        container.innerHTML = `
            <div class="no-tournaments">
                <p>No tournaments are currently scheduled. Please check back later!</p>
            </div>
        `;
        return;
    }
    
    const tournamentsHTML = tournaments.map(tournament => {
        const slotPercentage = (tournament.currentTeams / tournament.maxTeams) * 100;
        
        let statusClass = '';
        let statusText = '';
        
        switch(tournament.status) {
            case 'open':
                statusClass = 'status-open';
                statusText = 'Registration Open';
                break;
            case 'coming-soon':
                statusClass = 'status-coming-soon';
                statusText = 'Coming Soon';
                break;
            case 'closed':
                statusClass = 'status-closed';
                statusText = 'Registration Closed';
                break;
            default:
                statusClass = 'status-unknown';
                statusText = 'Unknown Status';
        }
        
        return `
            <div class="tournament-card">
                <div class="tournament-card-image">
                    <img src="${tournament.image}" alt="${tournament.name}">
                    <div class="tournament-status ${statusClass}">${statusText}</div>
                    <div class="tournament-badge">${tournament.gameType}</div>
                </div>
                <div class="tournament-card-content">
                    <h3>${tournament.name}</h3>
                    <div class="tournament-date">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${tournament.date}
                    </div>
                    <p class="tournament-description">${tournament.description}</p>
                    <div class="tournament-meta">
                        <div class="venue">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${tournament.venue}
                        </div>
                        <div class="fee">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            ${tournament.entryFee}
                        </div>
                    </div>
                    <div class="tournament-slots">
                        <div>Slots: ${tournament.currentTeams}/${tournament.maxTeams} teams</div>
                        <div class="slots-bar">
                            <div class="slots-progress" style="width: ${slotPercentage}%"></div>
                        </div>
                    </div>
                    ${tournament.status === 'open' ? 
                        `<a href="/pages/registration.html?tournament=${tournament.id}" class="btn">Register Now</a>` : 
                        tournament.status === 'coming-soon' ? 
                        `<button class="btn" style="background-color: #555; cursor: not-allowed;">Coming Soon</button>` :
                        `<button class="btn" style="background-color: #555; cursor: not-allowed;">Registration Closed</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = tournamentsHTML;
}

function loadTournamentOptions() {
    // Try to fetch from JSON file first
    fetch('/data/tournaments.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tournamentSelect = document.getElementById('tournamentId');
            
            // Add tournament options from the JSON data
            data.tournaments.forEach(tournament => {
                // Only show tournaments with 'open' status
                if (tournament.status === 'open') {
                    const option = document.createElement('option');
                    option.value = tournament.name;
                    option.textContent = tournament.name;
                    tournamentSelect.appendChild(option);
                }
            });
            
            // Check if there are no open tournaments
            if (tournamentSelect.options.length === 1) {
                // Fall back to hardcoded options
                addHardcodedTournamentOptions(tournamentSelect);
            }
            
            // If there's a tournament ID in the URL query params, select it
            const urlParams = new URLSearchParams(window.location.search);
            const tournamentId = urlParams.get('tournament');
            if (tournamentId) {
                const options = Array.from(tournamentSelect.options);
                const matchingOption = options.find(option => 
                    option.value === tournamentId || option.textContent === tournamentId
                );
                
                if (matchingOption) {
                    tournamentSelect.value = matchingOption.value;
                }
            }
        })
        .catch(error => {
            console.error('Error fetching tournaments:', error);
            // Fall back to hardcoded options
            const tournamentSelect = document.getElementById('tournamentId');
            addHardcodedTournamentOptions(tournamentSelect);
        });
}

function addHardcodedTournamentOptions(selectElement) {
    const tournaments = [
        { name: "Mobile Legends Season 2" },
        { name: "Basketball" },
        { name: "Volleyball" },
        
    ];
    
    tournaments.forEach(tournament => {
        const option = document.createElement('option');
        option.value = tournament.name;
        option.textContent = tournament.name;
        selectElement.appendChild(option);
    });
}

// Add CSS for form status messages
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .form-status {
            margin-bottom: 1.5rem;
            padding: 1rem;
            border-radius: 4px;
            display: none;
        }
        
        .sending-message {
            background-color: rgba(30, 144, 255, 0.1);
            border: 1px solid var(--secondary-color);
            color: var(--light-text);
        }
        
        .success-message {
            background-color: rgba(46, 204, 113, 0.1);
            border: 1px solid #2ecc71;
            color: #2ecc71;
        }
        
        .error-message {
            background-color: rgba(231, 76, 60, 0.1);
            border: 1px solid #e74c3c;
            color: #e74c3c;
        }
        
        .form-status h3 {
            margin-top: 0;
            margin-bottom: 0.5rem;
        }
        
        .form-status p {
            margin-bottom: 0.5rem;
        }
        
        .form-status p:last-child {
            margin-bottom: 0;
        }
    `;
    document.head.appendChild(style);
});