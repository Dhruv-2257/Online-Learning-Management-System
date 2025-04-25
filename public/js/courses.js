document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-courses');
  const categoryFilter = document.getElementById('category-filter');
  const coursesGrid = document.getElementById('courses-grid');
  const noCoursesMessage = document.getElementById('no-courses-message');
  const courseCards = document.querySelectorAll('.course-card');
  
  // Function to filter courses
  function filterCourses() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    let visibleCount = 0;
    
    courseCards.forEach(card => {
      const title = card.querySelector('.course-title').textContent.toLowerCase();
      const description = card.querySelector('.course-description').textContent.toLowerCase();
      const categoryId = card.getAttribute('data-category');
      
      // Check if the course matches both search term and category filter
      const matchesSearch = !searchTerm || 
        title.includes(searchTerm) || 
        description.includes(searchTerm);
        
      const matchesCategory = !selectedCategory || categoryId === selectedCategory;
      
      if (matchesSearch && matchesCategory) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show/hide no courses message
    if (visibleCount === 0) {
      noCoursesMessage.classList.remove('hidden');
    } else {
      noCoursesMessage.classList.add('hidden');
    }
  }
  
  // Add event listeners for search and filter
  if (searchInput) {
    searchInput.addEventListener('input', filterCourses);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterCourses);
  }
  
  // Search button
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', filterCourses);
  }
});