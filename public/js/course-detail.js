document.addEventListener('DOMContentLoaded', function() {
  // Render Markdown content
  const courseContentData = document.getElementById('course-content-data');
  const courseContent = document.getElementById('course-content');
  
  if (courseContentData && courseContent) {
    // Get the encoded content and decode it
    const encodedContent = courseContentData.getAttribute('data-content');
    const content = decodeURIComponent(encodedContent);
    
    // Use marked library to convert Markdown to HTML
    if (typeof marked !== 'undefined') {
      courseContent.innerHTML = marked.parse(content);
      
      // Apply syntax highlighting if highlight.js is available
      if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightBlock(block);
        });
      }
    } else {
      // Fallback if marked is not available
      courseContent.textContent = content;
    }
  }
  
  // Enrollment functionality
  const enrollBtn = document.getElementById('enroll-btn');
  
  if (enrollBtn) {
    enrollBtn.addEventListener('click', async function() {
      const courseId = this.getAttribute('data-course-id');
      
      try {
        // First, get current user info
        const userResponse = await fetch('/api/user');
        
        if (!userResponse.ok) {
          window.location.href = `/auth?redirect=/course/${courseId}`;
          return;
        }
        
        const user = await userResponse.json();
        
        // Create enrollment
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            courseId: parseInt(courseId),
            status: 'in_progress'
          })
        });
        
        if (response.ok) {
          // Reload the page to show enrollment status
          window.location.reload();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to enroll in course. Please try again.');
        }
      } catch (error) {
        console.error('Error during enrollment:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }
});