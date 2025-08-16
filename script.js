// DOM Elements
const sections = {
  home: document.getElementById('main-content'),
  profile: document.getElementById('profile-section'),
  chat: document.getElementById('chat-section'),
};

const authButtons = {
  login: document.getElementById('login-btn'),
  register: document.getElementById('register-btn'),
  ctaSignup: document.getElementById('cta-signup-btn'),
  mobileLogin: document.getElementById('mobile-login-btn'),
  mobileRegister: document.getElementById('mobile-register-btn')
};

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const editProfileModal = document.getElementById('edit-profile-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const editProfileForm = document.getElementById('edit-profile-form');
const addSkillForm = document.getElementById('add-skill-form');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const addSkillCategory = document.getElementById('add-skill-category'); // New element

const featuredGrid = document.getElementById('featured-grid');

const profileName = document.getElementById('profile-name');
const profileMatric = document.getElementById('profile-matric');
const profilePic = document.getElementById('profile-pic');
const editProfileBtn = document.getElementById('edit-profile-btn');
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
const chatRecipientProfileBtn = document.getElementById('chat-recipient-profile-btn');
const homeLogo = document.getElementById('home-logo');

// State
let currentUser = null;
let currentRecipientId = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let services = JSON.parse(localStorage.getItem('services')) || [];
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let currentChat = null;
let pendingContactId = null; // Store user ID for contact after login

// Initialize the app
function init() {
  const loggedInUser = localStorage.getItem('currentUser');
  if (loggedInUser) {
    currentUser = JSON.parse(loggedInUser);
    updateNavForLoggedInUser();
    showSection('profile');
    renderUserProfile();
  } else {
    showSection('home');
  }
  
  if (users.length === 0) {
    loadSampleData();
  }
  
  setupEventListeners();
  renderFeaturedServices();
  updateMessageBadge();
}

function showSection(sectionId) {
  document.querySelectorAll('section.main-section').forEach(s => s.style.display = 'none');
  
  const landingSections = ['hero', 'about-section', 'categories-section', 'featured-section', 'how-it-works', 'cta-section'];
  if (sectionId === 'home') {
    landingSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    landingSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.getElementById(sectionId + '-section').style.display = 'block';
  }
}

function setupEventListeners() {
  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });

  // Modal controls
  authButtons.login.addEventListener('click', (e) => { e.preventDefault(); showModal('login-modal'); });
  authButtons.register.addEventListener('click', (e) => { e.preventDefault(); showModal('register-modal'); });
  authButtons.ctaSignup.addEventListener('click', (e) => { e.preventDefault(); showModal('register-modal'); });
  if (authButtons.mobileLogin) authButtons.mobileLogin.addEventListener('click', (e) => { e.preventDefault(); mobileMenu.classList.remove('active'); showModal('login-modal'); });
  if (authButtons.mobileRegister) authButtons.mobileRegister.addEventListener('click', (e) => { e.preventDefault(); mobileMenu.classList.remove('active'); showModal('register-modal'); });

  closeModalButtons.forEach(button => { button.addEventListener('click', hideModals); });
  showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); hideModals(); showModal('register-modal'); });
  showLoginLink.addEventListener('click', (e) => { e.preventDefault(); hideModals(); showModal('login-modal'); });

  // Profile editing
  if (editProfileBtn) editProfileBtn.addEventListener('click', (e) => { e.preventDefault(); showModal('edit-profile-modal'); populateEditProfileForm(); });
  if (editProfileForm) editProfileForm.addEventListener('submit', handleProfileEdit);

  // Forms
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (addSkillForm) addSkillForm.addEventListener('submit', handleAddSkill);

  // Search
  searchInput.addEventListener('input', renderFeaturedServices);
  categoryFilter.addEventListener('change', renderFeaturedServices);
  homeLogo.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(currentUser ? 'profile' : 'home');
  });

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
  if (backToProfileBtn) backToProfileBtn.addEventListener('click', (e) => { e.preventDefault(); showSection('profile'); renderUserProfile(); });
  if (addMediaBtn) addMediaBtn.addEventListener('click', (e) => { e.preventDefault(); attachmentDropdown.classList.toggle('active'); });
  if (chatRecipientProfileBtn) chatRecipientProfileBtn.addEventListener('click', (e) => { e.preventDefault(); showRecipientProfile(); });

  // Category filter links
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const category = e.currentTarget.dataset.category;
      categoryFilter.value = category;
      renderFeaturedServices();
      window.scrollTo({ top: document.getElementById('featured-section').offsetTop, behavior: 'smooth' });
    });
  });

  // Smooth scrolling for nav
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
        }
    });
});
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
    toast.innerHTML = `<i class="toast-icon ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}


function showRecipientProfile() {
    const recipientUser = users.find(u => u.id === currentRecipientId);
    if (!recipientUser) {
        alert('User profile not found.');
        return;
    }

    const publicProfileSection = document.createElement('section');
    publicProfileSection.id = 'public-profile-section';
    publicProfileSection.className = 'main-section';
    publicProfileSection.innerHTML = `
        <div class="container profile-container">
          <div class="profile-header">
            <div class="profile-pic-container">
              <img src="${recipientUser.profilePic}" alt="Profile Picture" class="profile-pic" />
            </div>
            <div class="profile-info">
              <h2>${recipientUser.name}</h2>
              <p class="matric-number"><i class="fas fa-graduation-cap"></i> Matric: ${recipientUser.matric}</p>
              <a href="#" class="btn btn-primary" id="message-from-profile-btn">Message</a>
            </div>
          </div>
          <div class="profile-content">
            <div class="profile-skills">
              <h3>Skills & Services</h3>
              <div id="public-skills-list" class="skills-grid"></div>
            </div>
          </div>
        </div>
    `;

    document.body.appendChild(publicProfileSection);
    showSection('public-profile');

    const publicSkillsList = document.getElementById('public-skills-list');
    recipientUser.skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `<h4>${skill.name}</h4><p>${skill.description || ''}</p><p class="price">${skill.price}</p>`;
        publicSkillsList.appendChild(skillItem);
    });

    document.getElementById('message-from-profile-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.body.removeChild(publicProfileSection);
        showSection('chat');
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

function populateEditProfileForm() {
    if (currentUser) {
        document.getElementById('edit-name').value = currentUser.name;
    }
}

function handleProfileEdit(e) {
    e.preventDefault();
    if (!currentUser) return;

    const newName = document.getElementById('edit-name').value;
    const newPhotoFile = document.getElementById('edit-photo').files[0];

    const updateProfile = (newPhotoData) => {
        currentUser.name = newName;
        currentUser.profilePic = newPhotoData || currentUser.profilePic;

        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].name = newName;
            users[userIndex].profilePic = newPhotoData || users[userIndex].profilePic;
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('users', JSON.stringify(users));

        services.forEach(service => {
            if (service.userId === currentUser.id) {
                service.providerName = newName;
                service.providerPic = newPhotoData || service.providerPic;
            }
        });
        localStorage.setItem('services', JSON.stringify(services));

        renderUserProfile();
        hideModals();
        showToast("Profile updated successfully! ✨", 'success');
    };

    if (newPhotoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateProfile(reader.result);
        };
        reader.readAsDataURL(newPhotoFile);
    } else {
        updateProfile(null);
    }
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
    showToast("Login successful! Redirecting to your dashboard. 🚀", 'success');
    setTimeout(() => {
        if (pendingContactId) {
            const provider = users.find(u => u.id === pendingContactId);
            if (provider) {
                currentRecipientId = provider.id;
                showChatSection(provider.name);
            }
            pendingContactId = null;
        } else {
            showSection('profile');
            renderUserProfile();
        }
        loginForm.reset();
    }, 1500);
  } else {
    alert('Invalid credentials');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const matric = document.getElementById('reg-matric').value;
  const photoFile = document.getElementById('reg-photo').files[0];
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
  
  const reader = new FileReader();
  reader.onloadend = () => {
    const newUser = {
      id: generateId(),
      name,
      email,
      matric,
      password,
      profilePic: reader.result || 'https://via.placeholder.com/150',
      skills: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateNavForLoggedInUser();
    hideModals();
    showToast("Registration successful! Welcome to SkillSwap. 🎉", 'success');
    setTimeout(() => {
        showSection('profile');
        registerForm.reset();
        renderUserProfile();
    }, 1500);
  };
  
  if (photoFile) {
    reader.readAsDataURL(photoFile);
  } else {
    reader.onloadend();
  }
}

function handleAddSkill(e) {
  e.preventDefault();
  if (!currentUser) return;

  const skillName = document.getElementById('skill-name').value;
  const skillDesc = document.getElementById('skill-desc').value;
  const skillCategory = document.getElementById('skill-category').value; // New input
  let skillPrice = document.getElementById('skill-price').value;

  // Auto-format price
  if (skillPrice) {
      if (!skillPrice.startsWith('₦')) {
          skillPrice = '₦' + skillPrice;
      }
      if (!skillPrice.includes('/')) {
          skillPrice += '/project';
      }
  } else {
      skillPrice = '₦0';
  }

  const newSkill = {
    id: generateId(),
    name: skillName,
    description: skillDesc,
    price: skillPrice,
    userId: currentUser.id,
    category: skillCategory // Use selected category
  };
  
  currentUser.skills.push(newSkill);
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  users[userIndex].skills = currentUser.skills;

  services.push({ ...newSkill, providerName: currentUser.name, providerMatric: currentUser.matric, providerPic: currentUser.profilePic });

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('services', JSON.stringify(services));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  renderUserSkills();
  renderFeaturedServices();
  addSkillForm.reset();
  showToast("Skill added successfully! ✨", 'success');
}

function updateNavForLoggedInUser() {
  if (!currentUser) { location.reload(); return; }
  
  document.getElementById('header-buttons').innerHTML = `
    <a href="#" class="btn btn-outline" id="profile-btn">Profile</a>
    <a href="#" class="btn btn-accent" id="logout-btn">Log Out</a>
  `;
  document.getElementById('profile-btn').addEventListener('click', (e) => { e.preventDefault(); showSection('profile'); });
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to log out?')) {
      currentUser = null;
      localStorage.removeItem('currentUser');
      showSection('home');
      location.reload();
    }
  });

  const mobileAuthLinks = document.querySelector('.mobile-auth-links');
  if (mobileAuthLinks) {
    mobileAuthLinks.innerHTML = `
      <li><a href="#" class="btn btn-outline" id="mobile-profile-btn">Profile</a></li>
      <li><a href="#" class="btn btn-accent" id="mobile-logout-btn">Log Out</a></li>
    `;
    document.getElementById('mobile-profile-btn').addEventListener('click', (e) => { e.preventDefault(); mobileMenu.classList.remove('active'); showSection('profile'); });
    document.getElementById('mobile-logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            showSection('home');
            location.reload();
        }
    });
  }
}

function renderUserProfile() {
  if (!currentUser) return;
  profileName.textContent = currentUser.name;
  profileMatric.textContent = currentUser.matric;
  profilePic.src = currentUser.profilePic;
  renderUserSkills();
  renderConversations();
}

function renderUserSkills() {
  if (!currentUser) return;
  skillsList.innerHTML = '';
  if (currentUser.skills.length === 0) {
    skillsList.innerHTML = '<p class="no-results">No skills added yet. Add a skill to get started!</p>';
    return;
  }
  currentUser.skills.forEach(skill => {
    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';
    skillItem.innerHTML = `
      <h4>${skill.name}</h4>
      <p>${skill.description || 'No description provided'}</p>
      <p class="price">${skill.price}</p>
      <div class="skill-item-buttons">
          <button class="edit-btn" data-id="${skill.id}"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${skill.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    skillsList.appendChild(skillItem);
  });
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this skill?')) {
        currentUser.skills = currentUser.skills.filter(s => s.id !== this.dataset.id);
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex].skills = currentUser.skills;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        services = services.filter(s => s.id !== this.dataset.id);
        localStorage.setItem('services', JSON.stringify(services));
        renderUserSkills();
        renderFeaturedServices();
        showToast('Skill deleted successfully!', 'info');
      }
    });
  });
  document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', function() {
          const skillToEdit = currentUser.skills.find(s => s.id === this.dataset.id);
          const newName = prompt("Enter new skill name:", skillToEdit.name);
          if (newName !== null) {
              skillToEdit.name = newName;
              const newDesc = prompt("Enter new description:", skillToEdit.description);
              if (newDesc !== null) skillToEdit.description = newDesc;
              let newPrice = prompt("Enter new price (e.g., 5000):", skillToEdit.price.replace('₦', '').replace('/project', ''));
              if (newPrice !== null) {
                  if (!newPrice.startsWith('₦')) newPrice = '₦' + newPrice;
                  if (!newPrice.includes('/')) newPrice += '/project';
                  skillToEdit.price = newPrice;
              }
              const userIndex = users.findIndex(u => u.id === currentUser.id);
              users[userIndex].skills = currentUser.skills;
              localStorage.setItem('users', JSON.stringify(users));
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
              
              const serviceToUpdate = services.find(s => s.id === skillToEdit.id);
              if (serviceToUpdate) {
                  serviceToUpdate.name = newName;
                  serviceToUpdate.description = newDesc;
                  serviceToUpdate.price = newPrice;
              }
              localStorage.setItem('services', JSON.stringify(services));
              
              renderUserSkills();
              renderFeaturedServices();
              showToast('Skill updated successfully!', 'info');
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

  // New logic: Prioritize recently added services
  const sortedServices = [...filteredServices].sort((a, b) => b.id.localeCompare(a.id));
  const displayServices = sortedServices.slice(0, 8); // Show up to 8 featured services
  
  displayServices.forEach(service => {
    const serviceCard = document.createElement('div');
    serviceCard.className = 'service-card';
    const contactBtnHtml = currentUser ? 
      `<a href="#" class="contact-btn" data-id="${service.userId}" data-name="${service.providerName}">Contact</a>` :
      `<a href="#" class="contact-btn login-required" data-id="${service.userId}" data-name="${service.providerName}">Contact</a>`;

    const formattedPrice = service.price.startsWith('₦') ? service.price.replace('per', '/') : service.price;

    serviceCard.innerHTML = `
      <img src="${service.providerPic || 'https://via.placeholder.com/300x180'}" alt="${service.name}">
      <div class="service-content">
        <span class="category-pill">${service.category || 'Other'}</span>
        <h3>${service.name}</h3>
        <p class="provider">${service.providerName} (${service.providerMatric})</p>
        <p class="price">${formattedPrice}</p>
        ${contactBtnHtml}
      </div>
    `;
    featuredGrid.appendChild(serviceCard);
  });
  
  document.querySelectorAll('.contact-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const providerId = this.getAttribute('data-id');
      const providerName = this.getAttribute('data-name');
      
      if (!currentUser) {
        pendingContactId = providerId;
        showModal('login-modal');
        return;
      }
      
      let conversation = conversations.find(conv => (conv.user1 === currentUser.id && conv.user2 === providerId) || (conv.user1 === providerId && conv.user2 === currentUser.id));
      if (!conversation) {
        conversation = { id: generateId(), user1: currentUser.id, user2: providerId, userName1: currentUser.name, userName2: providerName, messages: [] };
        conversations.push(conversation);
        localStorage.setItem('conversations', JSON.stringify(conversations));
      }
      currentChat = conversation.id;
      currentRecipientId = providerId;
      showChatSection(providerName);
    });
  });
}

function showChatSection(recipientName) {
  showSection('chat');
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
      currentRecipientId = otherUserId;
      showChatSection(otherUserName);
    });
    conversationsList.appendChild(conversationItem);
    const unread = conv.messages.filter(msg => !msg.read && msg.senderId !== currentUser.id).length;
    unreadCount += unread;
  });
  messageBadge.textContent = unreadCount;
  if (unreadCount === 0) { messageBadge.style.display = 'none'; } else { messageBadge.style.display = 'inline-block'; }
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
  const newMessage = { senderId: currentUser.id, text: messageInput.value.trim(), timestamp: new Date().getTime(), read: false };
  conversations[conversationIndex].messages.push(newMessage);
  localStorage.setItem('conversations', JSON.stringify(conversations));
  renderMessages();
  messageInput.value = '';
  autoResizeTextarea.call(messageInput);
}

// Helper functions
function generateId() { return Math.random().toString(36).substr(2, 9); }
function loadSampleData() {
  const sampleUsers = [
    { id: 'user1', name: 'Ikeri Priscilla Oluchukwu', email: 'priscilla@example.com', matric: '130310014', password: 'password1', profilePic: 'https://randomuser.me/api/portraits/women/1.jpg', skills: [{ id: 'skill1', name: 'Graphic Design', description: 'Professional logo and branding design', price: '₦5000/design', userId: 'user1', category: 'design' }] },
    { id: 'user2', name: 'Ajayi Oladotun Temitope', email: 'temitope@example.com', matric: '249074195', password: 'password2', profilePic: 'https://randomuser.me/api/portraits/men/1.jpg', skills: [{ id: 'skill3', name: 'Math Tutoring', description: 'Calculus and Algebra tutoring for undergraduates', price: '₦2000/hour', userId: 'user2', category: 'tutoring' }] },
    { id: 'user3', name: 'Gezawa Umar Sulaiman', email: 'umar@example.com', matric: '249074295', password: 'password3', profilePic: 'https://randomuser.me/api/portraits/men/2.jpg', skills: [{ id: 'skill4', name: 'Web Development', description: 'Basic HTML, CSS, JavaScript websites', price: '₦15000/project', userId: 'user3', category: 'programming' }] },
    { id: 'user4', name: 'Oshodi Nasirudeen Oladipupo', email: 'nasir@example.com', matric: '249074197', password: 'password4', profilePic: 'https://randomuser.me/api/portraits/men/3.jpg', skills: [{ id: 'skill5', name: 'Essay Writing', description: 'Academic writing and proofreading services', price: '₦2500/page', userId: 'user4', category: 'writing' }] },
    { id: 'user5', name: 'Ukaegbu Chidinma Glory', email: 'chidinma@example.com', matric: '249074248', password: 'password5', profilePic: 'https://randomuser.me/api/portraits/women/2.jpg', skills: [{ id: 'skill6', name: 'French Tutoring', description: 'Beginner to intermediate French lessons', price: '₦1500/hour', userId: 'user5', category: 'language' }] },
  ];
  users = sampleUsers;
  services = sampleUsers.flatMap(user => user.skills.map(skill => ({ ...skill, providerName: user.name, providerMatric: user.matric, providerPic: user.profilePic })));
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('services', JSON.stringify(services));
}

function updateMessageBadge() {
  if (!currentUser) { return; }
  let unreadCount = conversations
    .filter(conv => conv.user1 === currentUser.id || conv.user2 === currentUser.id)
    .flatMap(conv => conv.messages)
    .filter(msg => !msg.read && msg.senderId !== currentUser.id).length;
  messageBadge.textContent = unreadCount;
  if (unreadCount === 0) { messageBadge.style.display = 'none'; } else { messageBadge.style.display = 'inline-block'; }
}

init();