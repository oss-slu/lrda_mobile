export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
      return "Email is required";
    }
    
    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check for basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return "Invalid email address format";
    }
    
    // Check for suspicious patterns
    if (normalizedEmail.includes('..') || normalizedEmail.startsWith('.') || normalizedEmail.endsWith('.')) {
      return "Invalid email address";
    }
    
    // Check length limits
    if (normalizedEmail.length > 254) {
      return "Email address is too long";
    }
    
    return null;
  };
  
  export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
      return "Password is required";
    }
    
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    
    if (password.length > 128) {
      return "Password is too long";
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return "Password is too common, please choose a stronger password";
    }
    
    // Check for at least one letter and one number
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return "Password must contain at least one letter and one number";
    }
    
    return null;
  };

  export const validateTextInput = (text, fieldName = 'Text', maxLength = 1000) => {
    if (!text || typeof text !== 'string') {
      return `${fieldName} is required`;
    }
    
    const trimmedText = text.trim();
    
    if (trimmedText.length === 0) {
      return `${fieldName} cannot be empty`;
    }
    
    if (trimmedText.length > maxLength) {
      return `${fieldName} is too long (maximum ${maxLength} characters)`;
    }
    
    // Check for potentially malicious content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedText)) {
        return `${fieldName} contains potentially unsafe content`;
      }
    }
    
    return null;
  };

  export const validateTitle = (title) => {
    return validateTextInput(title, 'Title', 200);
  };

  export const validateNoteContent = (content) => {
    return validateTextInput(content, 'Note content', 10000);
  };
  