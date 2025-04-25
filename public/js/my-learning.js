document.addEventListener('DOMContentLoaded', function() {
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
  
  // Mark course as completed functionality (if needed)
  const completeButtons = document.querySelectorAll('.complete-course-btn');
  
  completeButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const enrollmentId = this.getAttribute('data-enrollment-id');
      
      try {
        const response = await fetch(`/api/enrollments/${enrollmentId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'completed'
          })
        });
        
        if (response.ok) {
          // Reload the page to show updated status
          window.location.reload();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to update enrollment status. Please try again.');
        }
      } catch (error) {
        console.error('Error updating enrollment status:', error);
        alert('An error occurred. Please try again.');
      }
    });
  });
});