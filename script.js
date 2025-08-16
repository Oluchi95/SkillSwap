// DOM Elements
const sections = {
  home: document.getElementById('home-section'),
  login: document.getElementById('login-modal'),
  register: document.getElementById('register-modal'),
  profile: document.getElementById('profile-section'),
  chat: document.getElementById('chat-section'),
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
  ctaSignup: document.getElementById('cta-signup-btn')
};

const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addSkillForm = document.getElementById('add-skill-form');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

const featuredGrid = document.getElementById('featured-grid');

const profileName = document.getElementById('profile-name');
const profileMatric = document.getElementById('profile-matric');
const profilePic = document.getElementById('profile-pic');
const skillsList = document.getElementById('skills-list');
const messageBadge = document.getElementById('message-badge');
const conversationsList = document.getElementById('conversations-list');

const chatWithLabel = document.getElementById('chat-with-label');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const backToProfileBtn = document.getElementById('back-to-profile');
const addMediaBtn = document.getElementById('add-media-btn');
const attachmentDropdown = document.getElementById('attachment-dropdown');

// State
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let services = JSON.parse(localStorage.getItem('services')) || [];
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let currentChat = null;

// Initialize the app
function init() {
  const loggedInUser = localStorage.getItem('currentUser');
  if (loggedInUser) {
    currentUser = JSON.parse(loggedInUser);
    updateNavForLoggedInUser();
  } else {
    showHome();
  }
  
  if (users.length === 0) {
    loadSampleData();
  }
  
  setupEventListeners();
  renderFeaturedServices();
  updateMessageBadge();
}

function showHome() {
  // Hide all main sections and show the default home content
  document.querySelectorAll('.main-section').forEach(section => {
    section.style.display = 'none';
  });
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'block';
  });
  // Ensure we are at the top of the page
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupEventListeners() {
  // Modal controls
  authButtons.login.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('login-modal');
  });
  
  authButtons.register.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('register-modal');
  });
  
  authButtons.ctaSignup.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('register-modal');
  });
  
  closeModalButtons.forEach(button => {
    button.addEventListener('click', hideModals);
  });
  
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    hideModals();
    showModal('register-modal');
  });
  
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    hideModals();
    showModal('login-modal');
  });

  // Forms
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (addSkillForm) addSkillForm.addEventListener('submit', handleAddSkill);

  // Search
  searchInput.addEventListener('input', renderFeaturedServices);
  categoryFilter.addEventListener('change', renderFeaturedServices);

  // Chat
  if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    messageInput.addEventListener('input', autoResizeTextarea);
  }
  if (backToProfileBtn) backToProfileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showProfileSection();
  });
  if (addMediaBtn) addMediaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    attachmentDropdown.classList.toggle('active');
  });
}

function autoResizeTextarea() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
}

function showModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideModals() {
  document.querySelectorAll('.modal.active').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
}

function handleLogin(e) {
  e.preventDefault();
  const emailOrMatric = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const user = users.find(u => (u.email === emailOrMatric || u.matric === emailOrMatric) && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateNavForLoggedInUser();
    hideModals();
    showProfileSection();
    loginForm.reset();
  } else {
    alert('Invalid credentials');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const matric = document.getElementById('reg-matric').value;
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }
  
  if (users.some(u => u.email === email || u.matric === matric)) {
    alert('User with this email or matric number already exists');
    return;
  }
  
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
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  updateNavForLoggedInUser();
  hideModals();
  showProfileSection();
  registerForm.reset();
}

function handleAddSkill(e) {
  e.preventDefault();
  if (!currentUser) return;

  const skillName = document.getElementById('skill-name').value;
  const skillDesc = document.getElementById('skill-desc').value;
  const skillPrice = document.getElementById('skill-price').value;

  const newSkill = {
    id: generateId(),
    name: skillName,
    description: skillDesc,
    price: skillPrice || '₦0',
    userId: currentUser.id,
    category: 'other' // Placeholder
  };
  
  currentUser.skills.push(newSkill);
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  users[userIndex] = currentUser;

  services.push({ ...newSkill, providerName: currentUser.name, providerMatric: currentUser.matric, providerPic: currentUser.profilePic });

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('services', JSON.stringify(services));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  renderUserSkills();
  renderFeaturedServices();
  addSkillForm.reset();
}

function updateNavForLoggedInUser() {
  if (!currentUser) {
    location.reload(); // Fallback
    return;
  }
  const headerButtons = document.getElementById('header-buttons');
  headerButtons.innerHTML = `
    <a href="#" class="btn btn-outline" id="profile-btn">Profile</a>
    <a href="#" class="btn btn-accent" id="logout-btn">Log Out</a>
  `;
  document.getElementById('profile-btn').addEventListener('click', (e) => {
    e.preventDefault();
    showProfileSection();
  });
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
  });
}

function renderUserSkills() {
  if (!currentUser) return;
  skillsList.innerHTML = '';
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
  document.querySelectorAll('.delete-skill').forEach(button => {
    button.addEventListener('click', function() {
      if (confirm('Are you sure?')) {
        currentUser.skills = currentUser.skills.filter(s => s.id !== this.dataset.id);
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex].skills = currentUser.skills;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        renderUserSkills();
      }
    });
  });
}

function renderFeaturedServices() {
  if (!featuredGrid) return;
  
  featuredGrid.innerHTML = '';
  const searchTerm = searchInput.value.toLowerCase();
  const categoryTerm = categoryFilter.value.toLowerCase();
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm) || service.providerName.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryTerm === '' || service.category.toLowerCase() === categoryTerm;
    return matchesSearch && matchesCategory;
  });
  
  if (filteredServices.length === 0) {
    featuredGrid.innerHTML = '<p class="no-results">No services match your criteria. Try another search!</p>';
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
        <a href="#" class="contact-btn" data-id="${service.userId}" data-name="${service.providerName}">Contact</a>
      </div>
    `;
    featuredGrid.appendChild(serviceCard);
  });
  
  document.querySelectorAll('.contact-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      if (!currentUser) {
        showModal('login-modal');
        return;
      }
      const providerId = this.getAttribute('data-id');
      const providerName = this.getAttribute('data-name');
      let conversation = conversations.find(conv => (conv.user1 === currentUser.id && conv.user2 === providerId) || (conv.user1 === providerId && conv.user2 === currentUser.id));
      if (!conversation) {
        conversation = {
          id: generateId(), user1: currentUser.id, user2: providerId, userName1: currentUser.name, userName2: providerName, messages: []
        };
        conversations.push(conversation);
        localStorage.setItem('conversations', JSON.stringify(conversations));
      }
      currentChat = conversation.id;
      showChatSection(providerName);
    });
  });
}

function showProfileSection() {
  document.querySelectorAll('section').forEach(section => section.style.display = 'none');
  sections.profile.style.display = 'block';
  if (currentUser) {
    profileName.textContent = currentUser.name;
    profileMatric.textContent = currentUser.matric;
    profilePic.src = currentUser.profilePic;
    renderUserSkills();
    renderConversations();
  }
}

function showChatSection(recipientName) {
  document.querySelectorAll('section').forEach(section => section.style.display = 'none');
  sections.chat.style.display = 'block';
  chatWithLabel.textContent = `Chat with ${recipientName}`;
  renderMessages();
}

function renderConversations() {
  if (!currentUser || !conversationsList) return;
  conversationsList.innerHTML = '';
  let unreadCount = 0;
  const userConversations = conversations.filter(conv => conv.user1 === currentUser.id || conv.user2 === currentUser.id);
  userConversations.forEach(conv => {
    const otherUserId = conv.user1 === currentUser.id ? conv.user2 : conv.user1;
    const otherUserName = conv.user1 === currentUser.id ? conv.userName2 : conv.userName1;
    const lastMessage = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : 'No messages yet';
    const conversationItem = document.createElement('div');
    conversationItem.className = 'conversation-item';
    conversationItem.innerHTML = `<h4>${otherUserName}</h4><p>${lastMessage.substring(0, 30)}${lastMessage.length > 30 ? '...' : ''}</p>`;
    conversationItem.addEventListener('click', () => {
      currentChat = conv.id;
      showChatSection(otherUserName);
    });
    conversationsList.appendChild(conversationItem);
    // Count unread messages (basic implementation)
    const unread = conv.messages.filter(msg => !msg.read && msg.senderId !== currentUser.id).length;
    unreadCount += unread;
  });
  messageBadge.textContent = unreadCount;
  if (unreadCount === 0) {
    messageBadge.style.display = 'none';
  } else {
    messageBadge.style.display = 'inline-block';
  }
}

function renderMessages() {
  if (!currentChat || !chatMessages) return;
  chatMessages.innerHTML = '';
  const conversation = conversations.find(conv => conv.id === currentChat);
  if (!conversation) return;
  conversation.messages.forEach(msg => {
    const isSent = msg.senderId === currentUser.id;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `<div class="text">${msg.text}</div>`;
    chatMessages.appendChild(messageDiv);
    // Mark as read
    if (!isSent) msg.read = true;
  });
  localStorage.setItem('conversations', JSON.stringify(conversations));
  updateMessageBadge();
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  if (!currentUser || !currentChat || !messageInput.value.trim()) return;
  const conversationIndex = conversations.findIndex(conv => conv.id === currentChat);
  if (conversationIndex === -1) return;
  const newMessage = {
    senderId: currentUser.id,
    text: messageInput.value.trim(),
    timestamp: new Date().getTime(),
    read: false
  };
  conversations[conversationIndex].messages.push(newMessage);
  localStorage.setItem('conversations', JSON.stringify(conversations));
  renderMessages();
  messageInput.value = '';
  autoResizeTextarea.call(messageInput);
}

// Helper functions
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function loadSampleData() {
  const sampleUsers = [
    { id: 'user1', name: 'Ikeri Priscilla Oluchukwu', email: 'priscilla@example.com', matric: '130310014', password: 'password1', profilePic: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80', skills: [{ id: 'skill1', name: 'Graphic Design', description: 'Professional logo and branding design', price: '₦5000 per design', userId: 'user1', category: 'design' }] },
    { id: 'user2', name: 'Ajayi Oladotun Temitope', email: 'temitope@example.com', matric: '249074195', password: 'password2', profilePic: 'https://randomuser.me/api/portraits/men/1.jpg', skills: [{ id: 'skill3', name: 'Math Tutoring', description: 'Calculus and Algebra tutoring for undergraduates', price: '₦2000 per hour', userId: 'user2', category: 'tutoring' }] },
    { id: 'user3', name: 'Gezawa Umar Sulaiman', email: 'umar@example.com', matric: '249074295', password: 'password3', profilePic: 'https://randomuser.me/api/portraits/men/2.jpg', skills: [{ id: 'skill4', name: 'Web Development', description: 'Basic HTML, CSS, JavaScript websites', price: '₦15000 per project', userId: 'user3', category: 'programming' }] },
    { id: 'user4', name: 'Oshodi Nasirudeen Oladipupo', email: 'nasir@example.com', matric: '249074197', password: 'password4', profilePic: 'https://randomuser.me/api/portraits/men/3.jpg', skills: [{ id: 'skill5', name: 'Essay Writing', description: 'Academic writing and proofreading services', price: '₦2500 per page', userId: 'user4', category: 'writing' }] },
    { id: 'user5', name: 'Ukaegbu Chidinma Glory', email: 'chidinma@example.com', matric: '249074248', password: 'password5', profilePic: 'https://randomuser.me/api/portraits/women/2.jpg', skills: [{ id: 'skill6', name: 'French Tutoring', description: 'Beginner to intermediate French lessons', price: '₦1500 per hour', userId: 'user5', category: 'language' }] },
  ];
  users = sampleUsers;
  services = sampleUsers.flatMap(user => user.skills.map(skill => ({ ...skill, providerName: user.name, providerMatric: user.matric, providerPic: user.profilePic })));
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('services', JSON.stringify(services));
}

init();