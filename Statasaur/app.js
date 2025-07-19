document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');
    const dinoGrid = document.getElementById('dinoGrid');
    const dinoSearch = document.getElementById('dinoSearch');
    const clearSearch = document.getElementById('clearSearch');
    const dinoFilter = document.getElementById('dinoFilter');
    const dinoDietFilter = document.getElementById('dinoDietFilter');
    const dinoSort = document.getElementById('dinoSort');
    const noResults = document.getElementById('noResults');
    
    // State
    let dinosaurs = [];
    let filteredDinosaurs = [];
    
    // Initialize the application
    function init() {
        setupNavigation();
        setupEventListeners();
        loadDinosaurs();
    }
    
    // Set up navigation
    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                navButtons.forEach(btn => btn.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));
                this.classList.add('active');
                const targetId = this.id + 'Content';
                document.getElementById(targetId).classList.add('active');
            });
        });
        
        // Initialize the first content section as active if none is active
        if (!document.querySelector('.content-section.active')) {
            contentSections[0].classList.add('active');
            navButtons[0].classList.add('active');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Play Now button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', function() {
                alert('Game starting soon! This feature is coming in the next update.');
            });
        }
        
        // Search and filter event listeners
        dinoSearch.addEventListener('input', filterAndRenderDinosaurs);
        clearSearch.addEventListener('click', () => {
            dinoSearch.value = '';
            filterAndRenderDinosaurs();
        });
        dinoFilter.addEventListener('change', filterAndRenderDinosaurs);
        dinoDietFilter.addEventListener('change', filterAndRenderDinosaurs);
        dinoSort.addEventListener('change', filterAndRenderDinosaurs);
    }
    
    // Load dinosaur data
    function loadDinosaurs() {
        fetch('dinosaur-info.json')
            .then(response => response.json())
            .then(data => {
                dinosaurs = data;
                filterAndRenderDinosaurs();
            })
            .catch(error => {
                console.error('Error loading dinosaur data:', error);
                dinoGrid.innerHTML = '<div class="error">Failed to load dinosaur data. Please try again later.</div>';
            });
    }
    
    // Filter and sort dinosaurs based on current filters and search term
    function filterAndRenderDinosaurs() {
        const searchTerm = dinoSearch.value.toLowerCase();
        const filterValue = dinoFilter.value;
        const dietFilterValue = dinoDietFilter.value;
        const sortValue = dinoSort.value;
        
        // Filter dinosaurs
        filteredDinosaurs = dinosaurs.filter(dino => {
            const matchesSearch = dino.name.toLowerCase().includes(searchTerm) ||
                               dino.passive.name.toLowerCase().includes(searchTerm) ||
                               dino.passive.description.toLowerCase().includes(searchTerm);
            
            const matchesFilter = filterValue === 'all' || 
                                dino.special.toLowerCase().includes(filterValue);
            
            const matchesDiet = dietFilterValue === 'all' || 
                              dino.diet === dietFilterValue;
            
            return matchesSearch && matchesFilter && matchesDiet;
        });
        
        // Sort dinosaurs
        if (sortValue) {
            const [sortBy, sortOrder] = sortValue.split('-');
            
            filteredDinosaurs.sort((a, b) => {
                let comparison = 0;
                
                // Helper function to calculate average attack damage
                const getAverageAttack = (dino) => {
                    if (!dino.attacks || dino.attacks.length === 0) return 0;
                    const allAttacks = dino.attacks.flat();
                    const sum = allAttacks.reduce((total, damage) => total + damage, 0);
                    return sum / allAttacks.length;
                };

                switch (sortBy) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case 'health':
                        comparison = a.health - b.health; 
                        break;
                    case 'speed':
                        comparison = a.sprintSpeed - b.sprintSpeed; 
                        break;
                    case 'price':
                        const priceA = a.price?.amount || 0;
                        const priceB = b.price?.amount || 0;
                        comparison = priceA - priceB;
                        break;
                    case 'attack':
                        const avgAttackA = getAverageAttack(a);
                        const avgAttackB = getAverageAttack(b);
                        comparison = avgAttackA - avgAttackB;
                        break;
                }    
                
                return sortOrder === 'desc' ? -comparison : comparison;
            });
        }
        
        // Render dinosaurs
        renderDinosaurs();
    }
    
    // Render dinosaurs to the grid
    function renderDinosaurs() {
        if (filteredDinosaurs.length === 0) {
            dinoGrid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }
        
        dinoGrid.style.display = 'grid';
        noResults.style.display = 'none';
        
        dinoGrid.innerHTML = filteredDinosaurs.map(dino => `
            <div class="dino-card">
                <div class="dino-card-header">
                    <h3>${dino.name}</h3>
                    <div class="dino-header-right">
                        <span class="dino-diet" title="${dino.diet}">
                            <i class="${dino.diet === 'carnivore' ? 'fas fa-drumstick-bite' : 'fas fa-leaf'}"></i>
                        </span>
                        <span class="dino-special" data-special="${dino.special}">${dino.special}</span>
                    </div>
                </div>
                <div class="dino-card-body">
                    <div class="dino-stats">
                        <div class="stat">
                            <div class="stat-value">${dino.health}</div>
                            <div class="stat-label">Health</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${dino.walkSpeed}/${dino.sprintSpeed}</div>
                            <div class="stat-label">Walk/Sprint Speed</div>
                        </div>
                    </div>
                    
                    <div class="dino-attacks">
                        <h4>Attacks</h4>
                        <ul class="attack-list">
                            <li>
                                <span class="attack-name">Primary</span>
                                <span class="attack-damage">${dino.attacks[0].length > 1 ? dino.attacks[0].join(' or ') : dino.attacks[0][0]}</span>
                            </li>
                            <li>
                                <span class="attack-name">Secondary</span>
                                <span class="attack-damage">${dino.attacks[1].length > 1 ? dino.attacks[1].join(' or ') : dino.attacks[1][0]}</span>
                            </li>
                            <li>
                                <span class="attack-name">Special</span>
                                <span class="attack-damage">${dino.attacks[2].length > 1 ? dino.attacks[2].join(' or ') : dino.attacks[2][0]}</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="dino-passive">
                        <h4>Passive Ability</h4>
                        <div class="passive-ability">
                            <div class="passive-name">${dino.passive.name}</div>
                            <p>${dino.passive.description}</p>
                        </div>
                    </div>
                    
                    <div class="dino-price">
                        ${getPriceDisplay(dino.price)}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Helper function to format price display
    function getPriceDisplay(price) {
        if (price.type === 'FREE') return 'FREE';
        if (price.type === 'GAMEPASS') return 'Gamepass';
        if (price.limited) return `Limited: ${price.amount} ${price.currency}`;
        return `${price.amount} ${price.currency}`;
    }
    
    // Initialize the compare tool
    function initCompareTool() {
        const compareDino1 = document.getElementById('compareDino1');
        const compareDino2 = document.getElementById('compareDino2');
        const clearComparisonBtn = document.getElementById('clearComparison');
        const comparisonResults = document.getElementById('comparisonResults');
        const noComparison = document.getElementById('noComparison');
        
        // Populate dropdowns with dinosaur options
        function populateDinoDropdowns() {
            const sortedDinosaurs = [...dinosaurs].sort((a, b) => a.name.localeCompare(b.name));
            
            sortedDinosaurs.forEach(dino => {
                const option1 = document.createElement('option');
                option1.value = dino.name;
                option1.textContent = dino.name;
                
                const option2 = option1.cloneNode(true);
                
                compareDino1.appendChild(option1);
                compareDino2.appendChild(option2);
            });
            
            // Add event listeners after populating
            compareDino1.addEventListener('change', updateComparison);
            compareDino2.addEventListener('change', updateComparison);
            clearComparisonBtn.addEventListener('click', clearComparison);
        }
        
        // Update the comparison when dinosaurs are selected
        function updateComparison() {
            const dino1Name = compareDino1.value;
            const dino2Name = compareDino2.value;
            
            if (!dino1Name || !dino2Name) {
                comparisonResults.style.display = 'none';
                noComparison.style.display = 'block';
                return;
            }
            
            const dino1 = dinosaurs.find(d => d.name === dino1Name);
            const dino2 = dinosaurs.find(d => d.name === dino2Name);
            
            if (!dino1 || !dino2) return;
            
            // Update previews
            updateDinoPreview('dino1Preview', dino1);
            updateDinoPreview('dino2Preview', dino2);
            
            // Update comparison table
            updateComparisonTable(dino1, dino2);
            
            // Show results
            comparisonResults.style.display = 'block';
            noComparison.style.display = 'none';
        }
        
        // Update a dinosaur preview card
        function updateDinoPreview(previewId, dino) {
            const preview = document.getElementById(previewId);
            if (!preview) return;
            
            preview.innerHTML = `
                <h3>${dino.name}</h3>
                <div class="dino-type">${dino.special}</div>
                <div class="dino-stats">
                    <div class="stat">
                        <div class="stat-value">${dino.health}</div>
                        <div class="stat-label">Health</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${dino.sprintSpeed}</div>
                        <div class="stat-label">Sprint Speed</div>
                    </div>
                </div>
                <div class="dino-passive">
                    <div class="passive-name">${dino.passive.name}</div>
                    <div class="passive-desc">${dino.passive.description}</div>
                </div>
            `;
        }
        
        // Update the comparison table with dinosaur stats
        function updateComparisonTable(dino1, dino2) {
            // Update names
            document.getElementById('dino1Name').textContent = dino1.name;
            document.getElementById('dino2Name').textContent = dino2.name;
            
            // Helper function to highlight higher/lower values
            function highlightValue(value1, value2, element1, element2) {
                // Reset classes
                element1.className = 'dino-stat';
                element2.className = 'dino-stat';
                
                // Compare numeric values
                const num1 = typeof value1 === 'string' ? parseFloat(value1) : value1;
                const num2 = typeof value2 === 'string' ? parseFloat(value2) : value2;
                
                if (num1 > num2) {
                    element1.classList.add('higher');
                    element2.classList.add('lower');
                } else if (num1 < num2) {
                    element1.classList.add('lower');
                    element2.classList.add('higher');
                } else {
                    element1.classList.add('equal');
                    element2.classList.add('equal');
                }
            }
            
            // Update stats with highlighting and set values
            const dino1Health = document.getElementById('dino1Health');
            const dino2Health = document.getElementById('dino2Health');
            dino1Health.textContent = dino1.health;
            dino2Health.textContent = dino2.health;
            highlightValue(dino1.health, dino2.health, dino1Health, dino2Health);
            
            const dino1WalkSpeed = document.getElementById('dino1WalkSpeed');
            const dino2WalkSpeed = document.getElementById('dino2WalkSpeed');
            dino1WalkSpeed.textContent = dino1.walkSpeed;
            dino2WalkSpeed.textContent = dino2.walkSpeed;
            highlightValue(dino1.walkSpeed, dino2.walkSpeed, dino1WalkSpeed, dino2WalkSpeed);
            
            const dino1SprintSpeed = document.getElementById('dino1SprintSpeed');
            const dino2SprintSpeed = document.getElementById('dino2SprintSpeed');
            dino1SprintSpeed.textContent = dino1.sprintSpeed;
            dino2SprintSpeed.textContent = dino2.sprintSpeed;
            highlightValue(dino1.sprintSpeed, dino2.sprintSpeed, dino1SprintSpeed, dino2SprintSpeed);
            
            // Helper function to calculate total attack damage
            function calculateAttackDamage(attackArray) {
                return attackArray.reduce((total, damage) => total + parseInt(damage), 0);
            }
            
            // Update attacks with highlighting
            function updateAttackComparison(attackIndex, dino1, dino2) {
                const attackTypes = ['Primary', 'Secondary', 'Third Attack'];
                const dino1Attack = dino1.attacks[attackIndex];
                const dino2Attack = dino2.attacks[attackIndex];
                
                const dino1Element = document.getElementById(`dino1${attackTypes[attackIndex]}`);
                const dino2Element = document.getElementById(`dino2${attackTypes[attackIndex]}`);
                
                // Reset classes but keep the dino-stat class for alignment
                dino1Element.className = 'dino-stat';
                dino2Element.className = 'dino-stat';
                
                // Calculate total damage for each attack
                const dino1Damage = calculateAttackDamage(dino1Attack);
                const dino2Damage = calculateAttackDamage(dino2Attack);
                
                // Set text content with 'or' between multiple damage values
                dino1Element.textContent = dino1Attack.length > 1 ? dino1Attack.join(' or ') : dino1Attack[0];
                dino2Element.textContent = dino2Attack.length > 1 ? dino2Attack.join(' or ') : dino2Attack[0];
                
                // Apply highlighting - only if attacks are not empty
                if (dino1Attack.length > 0 && dino2Attack.length > 0) {
                    if (dino1Damage > dino2Damage) {
                        dino1Element.classList.add('higher');
                        dino2Element.classList.add('lower');
                    } else if (dino1Damage < dino2Damage) {
                        dino1Element.classList.add('lower');
                        dino2Element.classList.add('higher');
                    } else if (dino1Damage === dino2Damage && dino1Damage > 0) {
                        dino1Element.classList.add('equal');
                        dino2Element.classList.add('equal');
                    }
                }
            }
            
            // Update all attack comparisons
            updateAttackComparison(0, dino1, dino2); // Primary
            updateAttackComparison(1, dino1, dino2); // Secondary
            updateAttackComparison(2, dino1, dino2); // Special
            
            // Update passive abilities with consistent styling and better text handling
            function formatPassiveAbility(passive) {
                const name = passive.name || 'No Passive';
                const description = passive.description || '';
                // Split long words and add word breaks to prevent overflow
                const formattedDesc = description
                    .replace(/([^\s]{20,})/g, (match) => {
                        return match.split('').join('<wbr>');
                    });
                
                return `
                    <div class="passive-ability">
                        <div class="passive-name">${name}</div>
                        <p>${formattedDesc}</p>
                    </div>
                `;
            }
            
            document.getElementById('dino1Passive').innerHTML = formatPassiveAbility(dino1.passive);
            document.getElementById('dino2Passive').innerHTML = formatPassiveAbility(dino2.passive);
            
            // Update prices
            document.getElementById('dino1Price').textContent = getPriceDisplay(dino1.price);
            document.getElementById('dino2Price').textContent = getPriceDisplay(dino2.price);
        }
        
        // Clear the comparison
        function clearComparison() {
            compareDino1.value = '';
            compareDino2.value = '';
            comparisonResults.style.display = 'none';
            noComparison.style.display = 'block';
            
            // Reset previews
            document.getElementById('dino1Preview').innerHTML = '<div class="dino-placeholder">Select a dinosaur</div>';
            document.getElementById('dino2Preview').innerHTML = '<div class="dino-placeholder">Select a dinosaur</div>';
        }
        
        // Initialize the compare tool after dinosaurs are loaded
        if (dinosaurs.length > 0) {
            populateDinoDropdowns();
        } else {
            // If dinosaurs aren't loaded yet, wait for them
            const checkDinosaurs = setInterval(() => {
                if (dinosaurs.length > 0) {
                    clearInterval(checkDinosaurs);
                    populateDinoDropdowns();
                }
            }, 100);
        }
    }
    
    // Initialize the app and compare tool
    init();
    initCompareTool();
});