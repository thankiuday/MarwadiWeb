const FRIENDLY_MESSAGES = {
  'Invalid credentials': 'Invalid email or password. Please check and try again.',
  'Invalid email or password. Please check and try again.': 'Invalid email or password. Please check and try again.',
  'Not authorized': 'Please sign in to continue.',
  'Not authorized, no token': 'Your session has expired. Please sign in again.',
  'Invalid token': 'Your session has expired. Please sign in again.',
  'Token expired': 'Your session has expired. Please sign in again.',
  'Token expired. Please sign in again.': 'Your session has expired. Please sign in again.',
  'Email already registered': 'This email is already in use. Try signing in instead.',
  'This email is already registered. Try signing in instead.': 'This email is already in use. Try signing in instead.',
  'This email is already in use.': 'This email is already in use.',
  'Too many attempts. Try again later.': 'Too many attempts. Please wait a few minutes and try again.',
  'User not found': 'Account not found. Please sign up first.',
  'Admin not found': 'Admin account not found.',
  'Cannot delete super admin': 'Super admin accounts cannot be deleted.',
  'Network Error': 'Unable to connect. Please check your internet and try again.',
  'timeout of 30000ms exceeded': 'Request took too long. Please try again.',
};

export function getApiError(err) {
  if (!err) return 'Something went wrong. Please try again.';
  const msg = err.response?.data?.message || err.message;
  if (!msg) return 'Something went wrong. Please try again.';
  return FRIENDLY_MESSAGES[msg] || msg;
}
