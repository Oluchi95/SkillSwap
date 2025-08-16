// DOM Elements
const sections = {
    home: document.getElementById('home-section'),
    login: document.getElementById('login-modal'),
    register: document.getElementById('register-modal'),
    profile: document.getElementById('profile-section'),
    services: document.getElementById('services-section'),
    chat: document.getElementById('chat-section'),
    featured: document.getElementById('featured-section')
};

const navLinks = {
    home: document.getElementById('home-logo'),
    about: document.querySelector('a[href="#about-section"]'),
    browse: document.querySelector('a[href="#featured-section"]'),
    categories: document.querySelector('a[href="#categories-section"]'),
    howItWorks: document.querySelector('a[href="#how-it-works"]')
};

const authButtons = {
    login: document.getElementById('login-btn'),
    register: document.getElementById('register-btn'),
    offerSkill: document.getElementById('offer-skill-btn'),
    heroSignup: document.getElementById('hero-signup-btn'),
    ctaSignup: document.getElementById('cta-signup-btn')
};

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addSkillForm = document.getElementById('add-skill-form');
const skillsList = document.getElementById('skills-list');
const servicesList = document.getElementById('services-list');
const featuredGrid = document.getElementById('featured-grid');
const serviceSearch = document.getElementById('service-search');
const serviceCategory = document.getElementById('service-category');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const conversationsList = document.getElementById('conversations-list');
const chatWithLabel = document.getElementById('chat-with');

// Modal elements
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

// State
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let services = JSON.parse(localStorage.getItem('services')) || [];
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let currentChat = null;

// Initialize
function init() {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        updateNavForLoggedInUser();
    }
    
    // Load sample data if none exists
    if (users.length === 0) {
        loadSampleData();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial content
    renderFeaturedServices();
}

// Set up event listeners
function setupEventListeners() {
    // Auth buttons
    authButtons.login.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('login');
    });
    
    authButtons.register.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('register');
    });
    
    authButtons.offerSkill.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            showModal('register');
        } else {
            showSection('profile');
        }
    });
    
    authButtons.heroSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('register');
    });
    
    authButtons.ctaSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('register');
    });
    
    // Modal controls
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            hideAllModals();
        });
    });
    
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllModals();
        showModal('register');
    });
    
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllModals();
        showModal('login');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideAllModals();
        }
    });
    
    // Forms
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', handleAddSkill);
    }
    
    // Search and filter
    if (serviceSearch) {
        serviceSearch.addEventListener('input', renderServices);
    }
    
    if (serviceCategory) {
        serviceCategory.addEventListener('change', renderServices);
    }
    
    // Chat
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Show modal
function showModal(modalName) {
    hideAllModals();
    if (modalName === 'login') {
        loginModal.style.display = 'flex';
    } else if (modalName === 'register') {
        registerModal.style.display = 'flex';
    }
}

// Hide all modals
function hideAllModals() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Find user
    const user = users.find(u => (u.email === email || u.matric === email) && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateNavForLoggedInUser();
        hideAllModals();
        loginForm.reset();
        renderFeaturedServices();
    } else {
        alert('Invalid credentials');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const matric = document.getElementById('reg-matric').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    // Validation
    if (!name || !email || !matric || !password || !confirm) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    // Check if user already exists
    if (users.some(u => u.email === email || u.matric === matric)) {
        alert('User with this email or matric number already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        name,
        email,
        matric,
        password,
        skills: [],
        profilePic: 'https://randomuser.me/api/portraits/' + (Math.random() > 0.5 ? 'men' : 'women') + '/' + Math.floor(Math.random() * 50) + '.jpg'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateNavForLoggedInUser();
    hideAllModals();
    registerForm.reset();
    renderFeaturedServices();
}

// Handle adding a new skill
function handleAddSkill(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    const skillName = document.getElementById('skill-name').value;
    const skillDesc = document.getElementById('skill-desc').value;
    const skillPrice = document.getElementById('skill-price').value;
    
    if (!skillName) {
        alert('Please enter a skill/service name');
        return;
    }
    
    const newSkill = {
        id: generateId(),
        name: skillName,
        description: skillDesc,
        price: skillPrice || 'Free',
        userId: currentUser.id,
        category: 'other' // Default category
    };
    
    // Add to current user
    currentUser.skills.push(newSkill);
    
    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Add to services
    services.push({
        ...newSkill,
        providerName: currentUser.name,
        providerMatric: currentUser.matric,
        providerPic: currentUser.profilePic
    });
    localStorage.setItem('services', JSON.stringify(services));
    
    // Update UI
    renderUserSkills();
    renderFeaturedServices();
    addSkillForm.reset();
}

// Update navigation for logged in user
function updateNavForLoggedInUser() {
    if (!currentUser) return;
    
    // Update auth buttons
    const headerButtons = document.getElementById('header-buttons');
    headerButtons.innerHTML = `
        <a href="#" class="btn btn-outline" id="profile-btn">Profile</a>
        <a href="#" class="btn btn-accent" id="logout-btn">Log Out</a>
    `;
    
    // Add event listeners to new buttons
    document.getElementById('profile-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('profile');
    });
    
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        currentUser = null;
        localStorage.removeItem('currentUser');
        location.reload(); // Refresh to show logged out state
    });
}

// Render user skills in profile
function renderUserSkills() {
    if (!currentUser) return;
    
    skillsList.innerHTML = '';
    
    if (currentUser.skills.length === 0) {
        skillsList.innerHTML = '<p>No skills/services added yet.</p>';
        return;
    }
    
    currentUser.skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `
            <h4>${skill.name}</h4>
            <p>${skill.description || 'No description provided'}</p>
            <p class="price">${skill.price}</p>
            <button class="delete-skill" data-id="${skill.id}">×</button>
        `;
        skillsList.appendChild(skillItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-skill').forEach(button => {
        button.addEventListener('click', function() {
            const skillId = this.getAttribute('data-id');
            deleteSkill(skillId);
        });
    });
}

// Delete a skill
function deleteSkill(skillId) {
    if (!confirm('Are you sure you want to delete this skill/service?')) return;
    
    // Remove from current user
    currentUser.skills = currentUser.skills.filter(skill => skill.id !== skillId);
    
    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    
    // Remove from services
    services = services.filter(service => service.id !== skillId);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('services', JSON.stringify(services));
    
    // Update UI
    renderUserSkills();
    renderFeaturedServices();
}

// Render featured services
function renderFeaturedServices() {
    if (!featuredGrid) return;
    
    featuredGrid.innerHTML = '';
    
    // Get random 8 services (or all if less than 8)
    const featuredServices = services.length <= 8 ? 
        [...services] : 
        [...services].sort(() => 0.5 - Math.random()).slice(0, 8);
    
    if (featuredServices.length === 0) {
        featuredGrid.innerHTML = '<p>No services available yet. Be the first to offer a skill!</p>';
        return;
    }
    
    featuredServices.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <img src="${service.providerPic || 'https://via.placeholder.com/300x180'}" alt="${service.name}">
            <div class="service-content">
                <span class="category-pill">${service.category || 'Other'}</span>
                <h3>${service.name}</h3>
                <p class="provider">${service.providerName} (${service.providerMatric})</p>
                <p class="price">${service.price}</p>
                <a href="#" class="contact-btn" data-id="${service.userId}" data-name="${service.providerName}">Contact</a>
            </div>
        `;
        featuredGrid.appendChild(serviceCard);
    });
    
    // Add event listeners to contact buttons
    document.querySelectorAll('.contact-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (!currentUser) {
                showModal('login');
                return;
            }
            
            const providerId = this.getAttribute('data-id');
            const providerName = this.getAttribute('data-name');
            
            // Check if conversation already exists
            let conversation = conversations.find(conv => 
                (conv.user1 === currentUser.id && conv.user2 === providerId) ||
                (conv.user1 === providerId && conv.user2 === currentUser.id));
            
            if (!conversation) {
                // Create new conversation
                conversation = {
                    id: generateId(),
                    user1: currentUser.id,
                    user2: providerId,
                    userName1: currentUser.name,
                    userName2: providerName,
                    messages: []
                };
                conversations.push(conversation);
                localStorage.setItem('conversations', JSON.stringify(conversations));
            }
            
            // Show chat section with this conversation
            currentChat = conversation.id;
            showSection('chat');
            renderMessages();
            chatWithLabel.textContent = `Chat with ${providerName}`;
        });
    });
}

// Render services in services section
function renderServices() {
    if (!servicesList) return;
    
    servicesList.innerHTML = '';
    
    if (services.length === 0) {
        servicesList.innerHTML = '<p>No services available yet.</p>';
        return;
    }
    
    const searchTerm = serviceSearch ? serviceSearch.value.toLowerCase() : '';
    const categoryFilter = serviceCategory ? serviceCategory.value : '';
    
    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm) || 
                             service.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || 
                              service.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    if (filteredServices.length === 0) {
        servicesList.innerHTML = '<p>No services match your search criteria.</p>';
        return;
    }
    
    filteredServices.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <img src="${service.providerPic || 'https://via.placeholder.com/300x180'}" alt="${service.name}">
            <div class="service-content">
                <span class="category-pill">${service.category || 'Other'}</span>
                <h3>${service.name}</h3>
                <p class="provider">${service.providerName} (${service.providerMatric})</p>
                <p class="price">${service.price}</p>
                <p>${service.description || 'No description provided'}</p>
                <a href="#" class="contact-btn" data-id="${service.userId}" data-name="${service.providerName}">Contact</a>
            </div>
        `;
        servicesList.appendChild(serviceCard);
    });
    
    // Add event listeners to contact buttons
    document.querySelectorAll('.contact-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (!currentUser) {
                showModal('login');
                return;
            }
            
            const providerId = this.getAttribute('data-id');
            const providerName = this.getAttribute('data-name');
            
            // Check if conversation already exists
            let conversation = conversations.find(conv => 
                (conv.user1 === currentUser.id && conv.user2 === providerId) ||
                (conv.user1 === providerId && conv.user2 === currentUser.id));
            
            if (!conversation) {
                // Create new conversation
                conversation = {
                    id: generateId(),
                    user1: currentUser.id,
                    user2: providerId,
                    userName1: currentUser.name,
                    userName2: providerName,
                    messages: []
                };
                conversations.push(conversation);
                localStorage.setItem('conversations', JSON.stringify(conversations));
            }
            
            // Show chat section with this conversation
            currentChat = conversation.id;
            showSection('chat');
            renderMessages();
            chatWithLabel.textContent = `Chat with ${providerName}`;
        });
    });
}

// Render conversations
function renderConversations() {
    if (!currentUser || !conversationsList) return;
    
    conversationsList.innerHTML = '';
    
    const userConversations = conversations.filter(conv => 
        conv.user1 === currentUser.id || conv.user2 === currentUser.id);
    
    if (userConversations.length === 0) {
        conversationsList.innerHTML = '<p>No conversations yet.</p>';
        return;
    }
    
    userConversations.forEach(conv => {
        const otherUserId = conv.user1 === currentUser.id ? conv.user2 : conv.user1;
        const otherUserName = conv.user1 === currentUser.id ? conv.userName2 : conv.userName1;
        
        const lastMessage = conv.messages.length > 0 ? 
            conv.messages[conv.messages.length - 1].text : 'No messages yet';
        
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        conversationItem.innerHTML = `
            <h4>${otherUserName}</h4>
            <p>${lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage}</p>
        `;
        conversationItem.addEventListener('click', () => {
            currentChat = conv.id;
            chatWithLabel.textContent = `Chat with ${otherUserName}`;
            renderMessages();
        });
        conversationsList.appendChild(conversationItem);
    });
}

// Render messages
function renderMessages() {
    if (!currentChat || !chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    const conversation = conversations.find(conv => conv.id === currentChat);
    if (!conversation) return;
    
    const otherUserId = conversation.user1 === currentUser.id ? conversation.user2 : conversation.user1;
    const otherUserName = conversation.user1 === currentUser.id ? conversation.userName2 : conversation.userName1;
    
    if (conversation.messages.length === 0) {
        chatMessages.innerHTML = `<p>No messages yet. Start a conversation with ${otherUserName}!</p>`;
        return;
    }
    
    conversation.messages.forEach(msg => {
        const isSent = msg.senderId === currentUser.id;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        messageDiv.innerHTML = `
            <div class="sender">${isSent ? 'You' : otherUserName}</div>
            <div class="text">${msg.text}</div>
            <div class="time">${formatTime(msg.timestamp)}</div>
        `;
        chatMessages.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
function sendMessage() {
    if (!currentUser || !currentChat || !messageInput || !messageInput.value.trim()) return;
    
    const conversationIndex = conversations.findIndex(conv => conv.id === currentChat);
    if (conversationIndex === -1) return;
    
    const newMessage = {
        senderId: currentUser.id,
        text: messageInput.value.trim(),
        timestamp: new Date().getTime()
    };
    
    conversations[conversationIndex].messages.push(newMessage);
    localStorage.setItem('conversations', JSON.stringify(conversations));
    
    // Update UI
    renderMessages();
    renderConversations();
    
    // Clear input
    messageInput.value = '';
}

// Helper functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showSection(sectionName) {
    // For now, just scroll to the section
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Sample data
function loadSampleData() {
    const sampleUsers = [
        {
            id: 'user1',
            name: 'Ikeri Priscilla Oluchukwu',
            email: 'priscilla@example.com',
            matric: '130310014',
            password: 'password1',
            profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
            skills: [
                {
                    id: 'skill1',
                    name: 'Graphic Design',
                    description: 'Professional logo and branding design',
                    price: '₦5000 per design',
                    userId: 'user1',
                    category: 'design'
                },
                {
                    id: 'skill2',
                    name: 'Photo Editing',
                    description: 'Advanced Photoshop editing services',
                    price: '₦3000 per photo',
                    userId: 'user1',
                    category: 'design'
                }
            ]
        },
        {
            id: 'user2',
            name: 'Ajayi Oladotun Temitope',
            email: 'temitope@example.com',
            matric: '249074195',
            password: 'password2',
            profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
            skills: [
                {
                    id: 'skill3',
                    name: 'Math Tutoring',
                    description: 'Calculus and Algebra tutoring for undergraduates',
                    price: '₦2000 per hour',
                    userId: 'user2',
                    category: 'tutoring'
                }
            ]
        },
        {
            id: 'user3',
            name: 'Gezawa Umar Sulaiman',
            email: 'umar@example.com',
            matric: '249074295',
            password: 'password3',
            profilePic: 'https://randomuser.me/api/portraits/men/2.jpg',
            skills: [
                {
                    id: 'skill4',
                    name: 'Web Development',
                    description: 'Basic HTML, CSS, JavaScript websites',
                    price: '₦15000 per project',
                    userId: 'user3',
                    category: 'programming'
                }
            ]
        },
        {
            id: 'user4',
            name: 'Oshodi Nasirudeen Oladipupo',
            email: 'nasir@example.com',
            matric: '249074197',
            password: 'password4',
            profilePic: 'https://randomuser.me/api/portraits/men/3.jpg',
            skills: [
                {
                    id: 'skill5',
                    name: 'Essay Writing',
                    description: 'Academic writing and proofreading services',
                    price: '₦2500 per page',
                    userId: 'user4',
                    category: 'writing'
                }
            ]
        },
        {
            id: 'user5',
            name: 'Ukaegbu Chidinma Glory',
            email: 'chidinma@example.com',
            matric: '249074248',
            password: 'password5',
            profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
            skills: [
                {
                    id: 'skill6',
                    name: 'French Tutoring',
                    description: 'Beginner to intermediate French lessons',
                    price: '₦1500 per hour',
                    userId: 'user5',
                    category: 'language'
                }
            ]
        }
    ];
    
    const sampleServices = [];
    sampleUsers.forEach(user => {
        user.skills.forEach(skill => {
            sampleServices.push({
                ...skill,
                providerName: user.name,
                providerMatric: user.matric,
                providerPic: user.profilePic
            });
        });
    });
    
    users = sampleUsers;
    services = sampleServices;
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('services', JSON.stringify(services));
}

// Initialize the app
init();