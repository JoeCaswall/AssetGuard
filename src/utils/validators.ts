/**
 * Validation utilities for form inputs and data
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const isValidJobTitle = (title: string): boolean => {
  return title.length >= 3 && title.length <= 100;
};

export const isValidJobDescription = (description: string): boolean => {
  return description.length <= 500;
};

export const isValidJobLocation = (location: string): boolean => {
  return location.length >= 3 && location.length <= 200;
};
