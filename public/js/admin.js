document.addEventListener('DOMContentLoaded', function() {
  // Free vs Paid course toggle functionality
  const freeCourseToggle = document.getElementById('free-course-toggle');
  const priceContainer = document.getElementById('price-container');
  const coursePriceInput = document.getElementById('course-price');
  
  // Function to toggle price field visibility
  function updatePriceField() {
    if (freeCourseToggle.checked) {
      priceContainer.style.display = 'none';
      coursePriceInput.value = '0';
    } else {
      priceContainer.style.display = 'block';
      if (coursePriceInput.value === '0') {
        coursePriceInput.value = '';
      }
    }
  }
  
  // Initialize price field visibility
  if (freeCourseToggle) {
    updatePriceField();
    
    // Add event listener for toggle changes
    freeCourseToggle.addEventListener('change', updatePriceField);
  }

  // Tab switching functionality
  const tabNavItems = document.querySelectorAll('.tab-nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabNavItems.forEach(tabNavItem => {
    tabNavItem.addEventListener('click', function() {
      // Remove active class from all tab nav items
      tabNavItems.forEach(item => {
        item.classList.remove('active');
      });
      
      // Add active class to the clicked tab nav item
      this.classList.add('active');
      
      // Hide all tab contents
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // Show the corresponding tab content
      const tabId = this.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Modal functionality
  const courseModal = document.getElementById('course-modal');
  const deleteModal = document.getElementById('delete-modal');
  const createCourseBtn = document.getElementById('create-course-btn');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const cancelCourseBtn = document.getElementById('cancel-course-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  
  // Open course modal for new course
  if (createCourseBtn) {
    createCourseBtn.addEventListener('click', function() {
      resetCourseForm();
      document.getElementById('course-modal-title').textContent = 'Create New Course';
      document.getElementById('save-course-btn').textContent = 'Create Course';
      courseModal.classList.add('show');
    });
  }
  
  // Close modals
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      courseModal.classList.remove('show');
      deleteModal.classList.remove('show');
    });
  });
  
  if (cancelCourseBtn) {
    cancelCourseBtn.addEventListener('click', function() {
      courseModal.classList.remove('show');
    });
  }
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', function() {
      deleteModal.classList.remove('show');
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === courseModal) {
      courseModal.classList.remove('show');
    }
    if (event.target === deleteModal) {
      deleteModal.classList.remove('show');
    }
  });
  
  // Course form submission
  const courseForm = document.getElementById('course-form');
  
  if (courseForm) {
    courseForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Reset error messages
      const errorElements = courseForm.querySelectorAll('.error-message');
      errorElements.forEach(el => {
        el.textContent = '';
      });
      
      // Get form data
      const courseId = document.getElementById('course-id').value;
      const title = document.getElementById('course-title').value.trim();
      const description = document.getElementById('course-description').value.trim();
      const image = document.getElementById('course-image').value.trim();
      const categoryId = document.getElementById('course-category').value;
      const price = document.getElementById('course-price').value;
      const content = document.getElementById('course-content').value.trim();
      const status = document.getElementById('course-status').value;
      
      // Simple validation
      let hasErrors = false;
      
      if (!title) {
        document.getElementById('title-error').textContent = 'Title is required';
        hasErrors = true;
      }
      
      if (!description) {
        document.getElementById('description-error').textContent = 'Description is required';
        hasErrors = true;
      }
      
      if (!content) {
        document.getElementById('content-error').textContent = 'Content is required';
        hasErrors = true;
      }
      
      if (hasErrors) return;
      
      // Prepare course data
      const courseData = {
        title,
        description,
        image,
        categoryId: categoryId ? parseInt(categoryId) : null,
        price: price || "0", // Keep as string for the database
        content,
        status
      };
      
      try {
        let response;
        
        if (courseId) {
          // Update existing course
          response = await fetch(`/api/courses/${courseId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
          });
        } else {
          // Create new course
          response = await fetch('/api/courses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
          });
        }
        
        if (response.ok) {
          // Close modal and reload page
          courseModal.classList.remove('show');
          window.location.reload();
        } else {
          const data = await response.json();
          document.getElementById('form-error').textContent = data.message || 'Failed to save course. Please try again.';
        }
      } catch (error) {
        console.error('Error saving course:', error);
        document.getElementById('form-error').textContent = 'An error occurred. Please try again.';
      }
    });
  }
  
  // Edit course
  const editCourseButtons = document.querySelectorAll('.edit-course-btn');
  
  editCourseButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const courseId = this.getAttribute('data-course-id');
      
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (response.ok) {
          const course = await response.json();
          
          // Fill the form with course data
          document.getElementById('course-id').value = course.id;
          document.getElementById('course-title').value = course.title;
          document.getElementById('course-description').value = course.description;
          document.getElementById('course-image').value = course.image || '';
          document.getElementById('course-category').value = course.categoryId || '';
          document.getElementById('course-price').value = course.price;
          document.getElementById('course-content').value = course.content;
          document.getElementById('course-status').value = course.status;
          
          // Set free course toggle based on course price
          const freeToggle = document.getElementById('free-course-toggle');
          if (freeToggle) {
            const isFree = !course.price || course.price === '0';
            freeToggle.checked = isFree;
            updatePriceField(); // Update price field visibility
          }
          
          // Update modal title and button text
          document.getElementById('course-modal-title').textContent = 'Edit Course';
          document.getElementById('save-course-btn').textContent = 'Save Changes';
          
          // Show the modal
          courseModal.classList.add('show');
        } else {
          alert('Failed to load course data. Please try again.');
        }
      } catch (error) {
        console.error('Error loading course:', error);
        alert('An error occurred. Please try again.');
      }
    });
  });
  
  // Delete course
  const deleteCourseButtons = document.querySelectorAll('.delete-course-btn');
  let currentCourseId;
  
  deleteCourseButtons.forEach(button => {
    button.addEventListener('click', function() {
      currentCourseId = this.getAttribute('data-course-id');
      deleteModal.classList.add('show');
    });
  });
  
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async function() {
      if (!currentCourseId) return;
      
      try {
        const response = await fetch(`/api/courses/${currentCourseId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          deleteModal.classList.remove('show');
          window.location.reload();
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to delete course. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }
  
  // Helper function to reset course form
  function resetCourseForm() {
    document.getElementById('course-id').value = '';
    document.getElementById('course-title').value = '';
    document.getElementById('course-description').value = '';
    document.getElementById('course-image').value = '';
    document.getElementById('course-category').value = '';
    document.getElementById('course-price').value = '0';
    document.getElementById('course-content').value = '';
    document.getElementById('course-status').value = 'draft';
    
    // Reset free course toggle
    const freeToggle = document.getElementById('free-course-toggle');
    if (freeToggle) {
      freeToggle.checked = true;
      updatePriceField(); // Update price field visibility
    }
    
    const errorElements = courseForm.querySelectorAll('.error-message');
    errorElements.forEach(el => {
      el.textContent = '';
    });
  }
});