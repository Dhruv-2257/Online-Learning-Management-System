document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.dataset.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.dataset.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    });
  }
  
  // User dropdown
  const userDropdownBtn = document.querySelector('.user-dropdown-btn');
  
  if (userDropdownBtn) {
    userDropdownBtn.addEventListener('click', function() {
      const dropdown = this.closest('.user-dropdown');
      dropdown.classList.toggle('active');
      
      // Close dropdown when clicking outside
      const closeDropdown = function(event) {
        if (!dropdown.contains(event.target)) {
          dropdown.classList.remove('active');
          document.removeEventListener('click', closeDropdown);
        }
      };
      
      // Add listener with a small delay to avoid immediate trigger
      setTimeout(() => {
        document.addEventListener('click', closeDropdown);
      }, 0);
    });
  }
  
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      const mainNav = document.querySelector('.main-nav');
      const headerActions = document.querySelector('.header-actions');
      
      mainNav.classList.toggle('mobile-open');
      headerActions.classList.toggle('mobile-open');
      
      // Toggle hamburger icon animation
      const spans = this.querySelectorAll('span');
      if (mainNav.classList.contains('mobile-open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          window.location.href = '/';
        } else {
          console.error('Logout failed');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    });
  }
});