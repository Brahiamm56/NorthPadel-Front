import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button, Input, Loading } from '../../../components/common';
import { colors } from '../../../styles/colors';
import { spacing, fontSize, fontWeight } from '../../../styles/spacing';
import { validators, errorMessages } from '../../../utils/validators';
import { registerUser } from '../services/authentication.service';

export const RegisterScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  // Actualizar campo del formulario
  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    // Validar nombre
    if (!validators.required(formData.nombre)) {
      newErrors.nombre = errorMessages.required;
      isValid = false;
    } else if (!validators.minLength(formData.nombre, 2)) {
      newErrors.nombre = errorMessages.minLength(2);
      isValid = false;
    }

    // Validar apellido
    if (!validators.required(formData.apellido)) {
      newErrors.apellido = errorMessages.required;
      isValid = false;
    } else if (!validators.minLength(formData.apellido, 2)) {
      newErrors.apellido = errorMessages.minLength(2);
      isValid = false;
    }

    // Validar email
    if (!validators.required(formData.email)) {
      newErrors.email = errorMessages.required;
      isValid = false;
    } else if (!validators.email(formData.email)) {
      newErrors.email = errorMessages.invalidEmail;
      isValid = false;
    }

    // Validar teléfono (opcional pero si hay debe ser válido)
    if (formData.telefono && !validators.phoneAR(formData.telefono)) {
      newErrors.telefono = errorMessages.invalidPhone;
      isValid = false;
    }

    // Validar contraseña
    if (!validators.required(formData.password)) {
      newErrors.password = errorMessages.required;
      isValid = false;
    } else if (!validators.password(formData.password)) {
      newErrors.password = errorMessages.invalidPassword;
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!validators.required(formData.confirmPassword)) {
      newErrors.confirmPassword = errorMessages.required;
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Manejar registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // 1. Recolectar los datos de los inputs
      const userData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        password: formData.password,
        telefono: formData.telefono.trim() || undefined,
      };

      // 2. Llamar al servicio
      const result = await registerUser(userData);

      // 3. Manejar la respuesta
      if (result.success) {
        Alert.alert("¡Éxito!", "Te has registrado correctamente. Ahora puedes iniciar sesión.");
        // Navegar a la pantalla de Login
        navigation.navigate('Login');
      } else {
        // Mostrar el mensaje de error que viene del backend
        Alert.alert("Error de Registro", result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  // Volver al login
  const goToLogin = () => {
    navigation.goBack();
  };

  if (loading) {
    return <Loading text="Creando cuenta..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎾</Text>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Unite a NorthPadel</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Input
            label="Nombre"
            placeholder="Juan"
            value={formData.nombre}
            onChangeText={(text) => updateField('nombre', text)}
            error={errors.nombre}
            autoCapitalize="words"
          />

          <Input
            label="Apellido"
            placeholder="Pérez"
            value={formData.apellido}
            onChangeText={(text) => updateField('apellido', text)}
            error={errors.apellido}
            autoCapitalize="words"
          />

          <Input
            label="Email"
            placeholder="tu@email.com"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Teléfono (opcional)"
            placeholder="3794123456"
            value={formData.telefono}
            onChangeText={(text) => updateField('telefono', text)}
            error={errors.telefono}
            keyboardType="phone-pad"
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            error={errors.password}
            isPassword
          />

          <Input
            label="Confirmar Contraseña"
            placeholder="Repetí tu contraseña"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            error={errors.confirmPassword}
            isPassword
          />

          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tenés cuenta?</Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.loginLink}>Iniciá Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  loginLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});