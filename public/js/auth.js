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
  
  // Login form submission
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Reset error messages
      const errorElements = loginForm.querySelectorAll('.error-message');
      errorElements.forEach(el => {
        el.textContent = '';
      });
      
      // Get form data
      const email = loginForm.querySelector('#login-email').value.trim();
      const password = loginForm.querySelector('#login-password').value;
      
      // Simple validation
      let hasErrors = false;
      
      if (!email) {
        document.getElementById('login-email-error').textContent = 'Email is required';
        hasErrors = true;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('login-email-error').textContent = 'Please enter a valid email address';
        hasErrors = true;
      }
      
      if (!password) {
        document.getElementById('login-password-error').textContent = 'Password is required';
        hasErrors = true;
      }
      
      if (hasErrors) return;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Get redirect URL from query parameter or default to home
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect') || '/';
          
          window.location.href = redirectUrl;
        } else {
          document.getElementById('login-form-error').textContent = data.message || 'Login failed. Please check your credentials.';
        }
      } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('login-form-error').textContent = 'An error occurred. Please try again.';
      }
    });
  }
  
  // Registration form submission
  const registerForm = document.getElementById('register-form');
  
  if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Reset error messages
      const errorElements = registerForm.querySelectorAll('.error-message');
      errorElements.forEach(el => {
        el.textContent = '';
      });
      
      // Get form data
      const firstName = registerForm.querySelector('#first-name').value.trim();
      const lastName = registerForm.querySelector('#last-name').value.trim();
      const username = registerForm.querySelector('#username').value.trim();
      const email = registerForm.querySelector('#register-email').value.trim();
      const password = registerForm.querySelector('#register-password').value;
      const confirmPassword = registerForm.querySelector('#confirm-password').value;
      const terms = registerForm.querySelector('#terms').checked;
      
      // Simple validation
      let hasErrors = false;
      
      if (!username) {
        document.getElementById('username-error').textContent = 'Username is required';
        hasErrors = true;
      } else if (username.length < 3) {
        document.getElementById('username-error').textContent = 'Username must be at least 3 characters';
        hasErrors = true;
      }
      
      if (!email) {
        document.getElementById('register-email-error').textContent = 'Email is required';
        hasErrors = true;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('register-email-error').textContent = 'Please enter a valid email address';
        hasErrors = true;
      }
      
      if (!password) {
        document.getElementById('register-password-error').textContent = 'Password is required';
        hasErrors = true;
      } else if (password.length < 6) {
        document.getElementById('register-password-error').textContent = 'Password must be at least 6 characters';
        hasErrors = true;
      }
      
      if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        hasErrors = true;
      }
      
      if (!terms) {
        document.getElementById('terms-error').textContent = 'You must agree to the terms and conditions';
        hasErrors = true;
      }
      
      if (hasErrors) return;
      
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName,
            lastName,
            username,
            email,
            password,
            role: 'user' // Default role
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Get redirect URL from query parameter or default to home
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect') || '/';
          
          window.location.href = redirectUrl;
        } else {
          document.getElementById('register-form-error').textContent = data.message || 'Registration failed. Please try again.';
        }
      } catch (error) {
        console.error('Error during registration:', error);
        document.getElementById('register-form-error').textContent = 'An error occurred. Please try again.';
      }
    });
  }
});