export const validators = {
  // Validar email
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar contraseña (mínimo 6 caracteres)
  password: (password: string): boolean => {
    return password.length >= 6;
  },

  // Validar teléfono argentino
  phoneAR: (phone: string): boolean => {
    // Acepta formatos: 3794123456, +543794123456, 379-4123456
    const phoneRegex = /^(\+?54)?[ -]?3\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validar que no esté vacío
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  // Validar longitud mínima
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  // Validar longitud máxima
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },
};

// Mensajes de error
export const errorMessages = {
  required: 'Este campo es requerido',
  invalidEmail: 'Email inválido',
  invalidPassword: 'La contraseña debe tener al menos 6 caracteres',
  invalidPhone: 'Teléfono inválido',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede tener más de ${max} caracteres`,
};