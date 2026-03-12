const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{0,15}$/;

export function validateEmail(email) {
  if (!email?.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password, minLength = 6) {
  if (!password) return 'Password is required';
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  return null;
}

export function validateName(name, fieldName = 'Name') {
  if (!name?.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.trim().length > 50) return `${fieldName} must be less than 50 characters`;
  return null;
}

export function validatePhone(phone, required = false) {
  if (!phone?.trim()) return required ? 'Phone is required' : null;
  if (!PHONE_REGEX.test(phone.trim())) return 'Please enter a valid phone number';
  return null;
}

export function validatePasswordConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}
