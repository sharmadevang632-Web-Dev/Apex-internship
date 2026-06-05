document.addEventListener('DOMContentLoaded', () => {
  
  const themeToggle = document.getElementById('theme-toggle');
  const bodyElement = document.body;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    bodyElement.classList.add('light-mode');
  }

  themeToggle.addEventListener('click', () => {
    bodyElement.classList.toggle('light-mode');
    const activeTheme = bodyElement.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', activeTheme);
  });

  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('nav-links');
  const navHeader = document.getElementById('navbar');
  const allNavLinks = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
  });

  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinksContainer.classList.remove('active');
    });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navHeader.classList.add('navbar-scrolled');
    } else {
      navHeader.classList.remove('navbar-scrolled');
    }
    updateActiveLinkOnScroll();
  });

  const sections = document.querySelectorAll('section');
  function updateActiveLinkOnScroll() {
    let currentActiveSection = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentActiveSection = sec.getAttribute('id');
      }
    });

    if (currentActiveSection) {
      allNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentActiveSection}`) {
          link.classList.add('active');
        }
      });
    }
  }

  const contactForm = document.getElementById('contact-form');
  const formFields = {
    name: {
      input: document.getElementById('contact-name'),
      error: document.getElementById('error-name'),
      validate: (val) => val.trim().length > 0
    },
    email: {
      input: document.getElementById('contact-email'),
      error: document.getElementById('error-email'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    subject: {
      input: document.getElementById('contact-subject'),
      error: document.getElementById('error-subject'),
      validate: (val) => val.trim().length > 0
    },
    message: {
      input: document.getElementById('contact-message'),
      error: document.getElementById('error-message'),
      validate: (val) => val.trim().length > 0
    }
  };

 
  Object.keys(formFields).forEach(key => {
    const field = formFields[key];
    

    ['input', 'blur'].forEach(evt => {
      field.input.addEventListener(evt, () => {
        runFieldValidation(field);
      });
    });
  });


  function runFieldValidation(field) {
    const isValid = field.validate(field.input.value);
    const formGroup = field.input.closest('.form-group');
    
    if (isValid) {
      formGroup.classList.remove('has-error');
      formGroup.classList.add('is-valid');
    } else {
      formGroup.classList.add('has-error');
      formGroup.classList.remove('is-valid');
    }
    return isValid;
  }

 
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isFormValid = true;
    let firstErrorField = null;

  
    Object.keys(formFields).forEach(key => {
      const field = formFields[key];
      const isFieldValid = runFieldValidation(field);
      
      if (!isFieldValid) {
        isFormValid = false;
        if (!firstErrorField) {
          firstErrorField = field.input;
        }
      }
    });

    if (isFormValid) {
      
      triggerToastNotification('Validation Success!', 'Your message has been processed successfully.');
      
     
      contactForm.reset();
      Object.keys(formFields).forEach(key => {
        const formGroup = formFields[key].input.closest('.form-group');
        formGroup.classList.remove('is-valid', 'has-error');
      });
    } else {
     
      if (firstErrorField) {
        firstErrorField.focus();
      }
      
     
      const formPanel = contactForm.closest('.contact-form-panel') || contactForm.closest('.glass-panel');
      if (formPanel) {
        formPanel.classList.add('shake-animation');
        setTimeout(() => {
          formPanel.classList.remove('shake-animation');
        }, 400);
      }
    }
  });


  const toastNotification = document.getElementById('toast');
  function triggerToastNotification(title, message) {
    const toastTitle = toastNotification.querySelector('.toast-title') || toastNotification.querySelector('h4');
    const toastMessage = toastNotification.querySelector('.toast-message') || toastNotification.querySelector('p');
    
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    
    toastNotification.classList.remove('hidden');
    
    void toastNotification.offsetWidth;
    toastNotification.classList.add('active');

   
    setTimeout(() => {
      toastNotification.classList.remove('active');
      setTimeout(() => {
        toastNotification.classList.add('hidden');
      }, 400);
    }, 4000);
  }

  
  const todoInput = document.getElementById('todo-input');
  const todoCategory = document.getElementById('todo-category');
  const todoAddBtn = document.getElementById('todo-add-btn') || document.getElementById('todo-add');
  const todoList = document.getElementById('todo-list');
  const todoCount = document.getElementById('todo-count');
  const todoEmptyState = document.getElementById('todo-empty-state') || document.getElementById('todo-empty');
  const todoClearCompleted = document.getElementById('todo-clear-completed') || document.getElementById('todo-clear');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    { id: 1, text: 'Review responsive CSS Grid rules', category: 'Study', completed: false },
    { id: 2, text: 'Finalize HTML semantic elements layout', category: 'Work', completed: true },
    { id: 3, text: 'Implement vanilla JS DOM validation mechanics', category: 'Urgent', completed: false }
  ];
  let activeFilter = 'all';

 
  if (todoAddBtn) {
    todoAddBtn.addEventListener('click', addTask);
  }
  if (todoInput) {
    todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });
  }

  
  function addTask() {
    const text = todoInput.value.trim();
    const category = todoCategory.value;

    if (!text) {
      todoInput.focus();
      return;
    }

    const newTask = {
      id: Date.now(),
      text,
      category,
      completed: false
    };

    tasks.unshift(newTask);
    saveTasks();
    todoInput.value = '';
    renderTasks();
  }

 
  function deleteTask(id, listItemElement) {
    listItemElement.classList.add('fade-out');
    
   
    listItemElement.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    });
  }

 
  function toggleTaskCompletion(id) {
    tasks = tasks.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    saveTasks();
    renderTasks();
  }

 
  if (todoClearCompleted) {
    todoClearCompleted.addEventListener('click', () => {
      const initialCount = tasks.length;
      tasks = tasks.filter(t => !t.completed);
      const clearedCount = initialCount - tasks.length;
      
      if (clearedCount > 0) {
        saveTasks();
        renderTasks();
        triggerToastNotification('Tasks Cleared', `Successfully purged ${clearedCount} completed tasks.`);
      }
    });
  }


  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }


  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      renderTasks();
    });
  });

 
  function renderTasks() {
    if (!todoList) return;
    todoList.innerHTML = '';
    

    const filteredTasks = tasks.filter(task => {
      if (activeFilter === 'active') return !task.completed;
      if (activeFilter === 'completed') return task.completed;
      return true;
    });


    const activeTasksCount = tasks.filter(t => !t.completed).length;
    if (todoCount) {
      todoCount.textContent = `${activeTasksCount} task${activeTasksCount !== 1 ? 's' : ''} remaining`;
    }

 
    if (filteredTasks.length === 0) {
      if (todoEmptyState) todoEmptyState.classList.remove('hidden');
      todoList.classList.add('hidden');
    } else {
      if (todoEmptyState) todoEmptyState.classList.add('hidden');
      todoList.classList.remove('hidden');

      filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
          <div class="todo-item-left">
            <div class="todo-checkbox" aria-label="Toggle Complete">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="todo-item-content">
              <span class="todo-text">${escapeHtml(task.text)}</span>
              <span class="todo-tag tag-${task.category.toLowerCase()}">${task.category}</span>
            </div>
          </div>
          <button class="todo-delete-btn" aria-label="Delete Task">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        `;

      
        li.querySelector('.todo-checkbox').addEventListener('click', () => toggleTaskCompletion(task.id));
        li.querySelector('.todo-delete-btn').addEventListener('click', () => deleteTask(task.id, li));

        todoList.appendChild(li);
      });
    }
  }

 
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  renderTasks();


  const galleryGrid = document.getElementById('gallery-grid');
  const gallerySearch = document.getElementById('gallery-search');
  const galleryFiltersContainer = document.getElementById('gallery-filters');
  const toggleUploadFormBtn = document.getElementById('toggle-upload-form-btn') || document.getElementById('add-img-toggle');
  const imageUploadPanel = document.getElementById('image-upload-panel') || document.getElementById('add-img-panel');
  const imageUploadForm = document.getElementById('image-upload-form') || document.getElementById('add-img-form');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const galleryEmptyState = document.getElementById('gallery-empty-state') || document.getElementById('gallery-empty');


  const defaultImages = [
    {
      id: 1,
      title: 'Misty Mountains Peak',
      category: 'nature',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      tags: 'mountains, mist, pine, trees',
      favorite: false
    },
    {
      id: 2,
      title: 'Workspace Design setup',
      category: 'design',
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      tags: 'workspace, laptop, study, designer',
      favorite: true
    },
    {
      id: 3,
      title: 'Cyberpunk Code Screen',
      category: 'tech',
      url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
      tags: 'code, dark, hacker, programming',
      favorite: false
    },
    {
      id: 4,
      title: 'Majestic Forest Sunlight',
      category: 'nature',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      tags: 'forest, trees, sunlight, wilderness',
      favorite: false
    },
    {
      id: 5,
      title: 'Minimalist Architecture',
      category: 'design',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      tags: 'architecture, house, clean, concrete',
      favorite: false
    },
    {
      id: 6,
      title: 'Modern Mobile Interface',
      category: 'tech',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      tags: 'phone, apps, dark, software',
      favorite: false
    }
  ];

  let galleryImages = JSON.parse(localStorage.getItem('gallery_images')) || defaultImages;
  let activeGalleryFilter = 'all';
  let searchQuery = '';

  
  renderGallery();

 
  if (toggleUploadFormBtn) {
    toggleUploadFormBtn.addEventListener('click', () => {
      imageUploadPanel.classList.toggle('hidden');
      const urlInput = document.getElementById('img-url');
      if (!imageUploadPanel.classList.contains('hidden') && urlInput) {
        urlInput.focus();
      }
    });
  }

  if (cancelUploadBtn) {
    cancelUploadBtn.addEventListener('click', () => {
      imageUploadPanel.classList.add('hidden');
      imageUploadForm.reset();
    });
  }

  
  if (imageUploadForm) {
    imageUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('img-url').value.trim();
      const title = document.getElementById('img-title').value.trim();
      const category = document.getElementById('img-category').value;
      const tagsInput = document.getElementById('img-tags');
      const tags = tagsInput ? tagsInput.value.trim() : '';

      if (!url || !title) return;

      const newImg = {
        id: Date.now(),
        title,
        category,
        url,
        tags: tags || 'custom, photo',
        favorite: false,
        isCustom: true 
      };

      galleryImages.unshift(newImg);
      localStorage.setItem('gallery_images', JSON.stringify(galleryImages));
      
      
      imageUploadForm.reset();
      imageUploadPanel.classList.add('hidden');
      
      renderGallery();
      triggerToastNotification('Media Updated!', `"${title}" has been successfully added to the grid.`);
    });
  }

  
  if (galleryFiltersContainer) {
    galleryFiltersContainer.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('.gallery-filter-btn') || e.target.closest('.g-filter-btn');
      if (!filterBtn) return;

      galleryFiltersContainer.querySelectorAll('.gallery-filter-btn, .g-filter-btn').forEach(btn => btn.classList.remove('active'));
      filterBtn.classList.add('active');
      activeGalleryFilter = filterBtn.getAttribute('data-gallery-filter') || filterBtn.getAttribute('data-filter');
      renderGallery();
    });
  }


  if (gallerySearch) {
    gallerySearch.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderGallery();
    });
  }


  function deleteGalleryImage(id, event) {
    event.stopPropagation(); 
    if (confirm('Are you sure you want to remove this custom image from the collection?')) {
      galleryImages = galleryImages.filter(img => img.id !== id);
      localStorage.setItem('gallery_images', JSON.stringify(galleryImages));
      renderGallery();
      triggerToastNotification('Image Removed', 'The item was deleted from your workspace.');
    }
  }


  function toggleFavoriteImage(id, event, element) {
    event.stopPropagation(); 
    galleryImages = galleryImages.map(img => {
      if (img.id === id) {
        const nextState = !img.favorite;
        element.classList.toggle('active', nextState);
        return { ...img, favorite: nextState, fav: nextState };
      }
      return img;
    });
    localStorage.setItem('gallery_images', JSON.stringify(galleryImages));
    
   
    if (activeGalleryFilter === 'favorites') {
      renderGallery();
    }
  }


  let currentFilteredList = [];


  function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

   
    currentFilteredList = galleryImages.filter(img => {
      
      const isFav = img.favorite || img.fav;
      const matchesCategory = activeGalleryFilter === 'all' || 
                              (activeGalleryFilter === 'favorites' && isFav) || 
                              (img.category === activeGalleryFilter);
      
    
      const imgTags = img.tags || '';
      const matchesSearch = img.title.toLowerCase().includes(searchQuery) || 
                            imgTags.toLowerCase().includes(searchQuery) ||
                            img.category.toLowerCase().includes(searchQuery);

      return matchesCategory && matchesSearch;
    });

    if (currentFilteredList.length === 0) {
      if (galleryEmptyState) galleryEmptyState.classList.remove('hidden');
      galleryGrid.classList.add('hidden');
    } else {
      if (galleryEmptyState) galleryEmptyState.classList.add('hidden');
      galleryGrid.classList.remove('hidden');

      currentFilteredList.forEach((img, idx) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const isFav = img.favorite || img.fav;
      
        item.innerHTML = `
          <img class="gallery-item-image" src="${escapeHtml(img.url)}" alt="${escapeHtml(img.title)}" loading="lazy">
          <div class="gallery-item-overlay">
            <div class="gallery-item-top">
              <span class="gallery-item-cat">${img.category}</span>
              <div class="item-action-btns">
                <button class="item-action-btn btn-fav ${isFav ? 'active' : ''}" aria-label="Favorite Image">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
                ${(img.isCustom || img.custom) ? `
                <button class="item-action-btn btn-del-img" aria-label="Delete Image">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>` : ''}
              </div>
            </div>
            <div class="gallery-item-info">
              <h4 class="gallery-item-title">${escapeHtml(img.title)}</h4>
              <p class="gallery-item-tags">${escapeHtml(img.tags || '#' + img.category)}</p>
            </div>
          </div>
        `;

   
        const favBtn = item.querySelector('.btn-fav');
        favBtn.addEventListener('click', (e) => toggleFavoriteImage(img.id, e, favBtn));

        if (img.isCustom || img.custom) {
          const delBtn = item.querySelector('.btn-del-img');
          delBtn.addEventListener('click', (e) => deleteGalleryImage(img.id, e));
        }

      
        item.addEventListener('click', () => openLightbox(idx));

        galleryGrid.appendChild(item);
      });
    }
  }

  
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCategory = document.getElementById('lightbox-category') || document.getElementById('lightbox-cat');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentImageIndex = 0;

  
  function openLightbox(index) {
    if (currentFilteredList.length === 0) return;
    currentImageIndex = index;
    updateLightboxContent();
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; 
    setTimeout(() => {
      lightboxImg.src = ''; 
    }, 300);
  }

 
  function updateLightboxContent() {
    const targetImage = currentFilteredList[currentImageIndex];
    if (!targetImage || !lightboxImg) return;

    
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.95)';

    setTimeout(() => {
      lightboxImg.src = targetImage.url;
      lightboxImg.alt = targetImage.title;
      if (lightboxTitle) lightboxTitle.textContent = targetImage.title;
      if (lightboxCategory) lightboxCategory.textContent = targetImage.category;
      
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);
  }

 
  function showPrevImage() {
    if (currentFilteredList.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentFilteredList.length) % currentFilteredList.length;
    updateLightboxContent();
  }


  function showNextImage() {
    if (currentFilteredList.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentFilteredList.length;
    updateLightboxContent();
  }


  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);

  
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'ArrowRight') showNextImage();
  });

});
