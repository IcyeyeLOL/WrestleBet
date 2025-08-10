function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function showHome() {
    alert('Navigate to Home page - implement your routing logic here');
    // Replace with your actual routing logic, for example:
    // window.location.href = 'index.html';
}

function showBetting() {
    alert('Navigate to Betting page - implement your routing logic here');
    // Replace with your actual routing logic, for example:
    // window.location.href = 'betting.html';
}

function showDonation() {
    alert('Navigate to Donation page - implement your routing logic here');
    // Replace with your actual routing logic, for example:
    // window.location.href = 'donation.html';
}

// Add interactive functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to buttons for visual feedback
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.onclick && this.textContent !== 'Close Account') {
                // Add a subtle animation for button press
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });

    // Special handling for close account button
    const closeAccountBtn = document.querySelector('button[style*="color: #f44336"]');
    if (closeAccountBtn) {
        closeAccountBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to close your account? This action cannot be undone.')) {
                alert('Account closure process initiated. You will receive a confirmation email.');
            }
        });
    }

    // Add form validation for password fields
    setupPasswordValidation();
    
    // Add form handlers
    setupFormHandlers();
});

function setupPasswordValidation() {
    const newPasswordField = document.querySelector('input[placeholder="Enter new password"]');
    const confirmPasswordField = document.querySelector('input[placeholder="Confirm new password"]');
    
    if (newPasswordField && confirmPasswordField) {
        confirmPasswordField.addEventListener('blur', function() {
            if (newPasswordField.value !== confirmPasswordField.value) {
                confirmPasswordField.style.borderColor = '#f44336';
            } else {
                confirmPasswordField.style.borderColor = '#ffc107';
            }
        });
    }
}

function setupFormHandlers() {
    // Edit Profile button handler
    const editProfileBtn = document.querySelector('.btn-primary');
    if (editProfileBtn && editProfileBtn.textContent === 'Edit Profile') {
        editProfileBtn.addEventListener('click', function() {
            const inputs = document.querySelectorAll('#profile .form-input');
            inputs.forEach(input => {
                input.readOnly = !input.readOnly;
                if (!input.readOnly) {
                    input.style.borderColor = '#ffc107';
                    input.focus();
                }
            });
            
            this.textContent = input.readOnly ? 'Edit Profile' : 'Save Profile';
        });
    }

    // Settings form handler
    const saveSettingsBtn = document.querySelector('button[onclick*="Save Settings"]') || 
                           Array.from(document.querySelectorAll('.btn-primary')).find(btn => btn.textContent === 'Save Settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            // Simulate saving settings
            this.textContent = 'Saving...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = 'Save Settings';
                this.disabled = false;
                alert('Settings saved successfully!');
            }, 1000);
        });
    }

    // Password update handler
    const updatePasswordBtn = Array.from(document.querySelectorAll('.btn-primary')).find(btn => btn.textContent === 'Update Password');
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', function() {
            const currentPassword = document.querySelector('input[placeholder="Enter current password"]').value;
            const newPassword = document.querySelector('input[placeholder="Enter new password"]').value;
            const confirmPassword = document.querySelector('input[placeholder="Confirm new password"]').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match.');
                return;
            }
            
            if (newPassword.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }
            
            // Simulate password update
            this.textContent = 'Updating...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = 'Update Password';
                this.disabled = false;
                alert('Password updated successfully!');
                
                // Clear password fields
                document.querySelector('input[placeholder="Enter current password"]').value = '';
                document.querySelector('input[placeholder="Enter new password"]').value = '';
                document.querySelector('input[placeholder="Confirm new password"]').value = '';
            }, 1000);
        });
    }

    // Enable 2FA handler
    const enable2FABtn = Array.from(document.querySelectorAll('.btn-secondary')).find(btn => btn.textContent === 'Enable 2FA');
    if (enable2FABtn) {
        enable2FABtn.addEventListener('click', function() {
            if (confirm('Do you want to enable Two-Factor Authentication? You will need an authenticator app.')) {
                alert('2FA setup initiated. Please check your email for setup instructions.');
                this.textContent = 'Disable 2FA';
                this.style.background = 'rgba(76, 175, 80, 0.2)';
                this.style.borderColor = '#4caf50';
                this.style.color = '#4caf50';
            }
        });
    }

    // Download account data handler
    const downloadDataBtn = Array.from(document.querySelectorAll('.btn-secondary')).find(btn => btn.textContent === 'Download Account Data');
    if (downloadDataBtn) {
        downloadDataBtn.addEventListener('click', function() {
            this.textContent = 'Preparing Download...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = 'Download Account Data';
                this.disabled = false;
                alert('Account data download will be sent to your email within 24 hours.');
            }, 2000);
        });
    }
}