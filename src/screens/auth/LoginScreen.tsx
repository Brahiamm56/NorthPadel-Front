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
import { Button, Input, Loading } from '../../components/common';
import { colors } from '../../theme/colors';
import { spacing, fontSize, fontWeight } from '../../theme/spacing';
import { validators, errorMessages } from '../../utils/validators';
import { loginUser } from '../../services/authService';

export const LoginScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!validators.required(email)) {
      newErrors.email = errorMessages.required;
      isValid = false;
    } else if (!validators.email(email)) {
      newErrors.email = errorMessages.invalidEmail;
      isValid = false;
    }

    if (!validators.required(password)) {
      newErrors.password = errorMessages.required;
      isValid = false;
    } else if (!validators.password(password)) {
      newErrors.password = errorMessages.invalidPassword;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const credentials = {
        email: email.trim(),
        password: password,
      };

      const result = await loginUser(credentials);

      if (result.success) {
        // ¡LOGIN EXITOSO!
        console.log("Token JWT:", result.data.token);
        console.log("Datos del usuario:", result.data.user);

        // Aquí es donde guardaríamos el token y los datos del usuario
        // para mantener la sesión iniciada, y luego navegaríamos a la app principal.

        Alert.alert("¡Bienvenido!", "Has iniciado sesión correctamente.");
        // Navegar a la pantalla principal de la app
        // navigation.replace('MainApp'); 
      } else {
        Alert.alert("Error de Inicio de Sesión", result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Navegar a registro
  const goToRegister = () => {
    navigation.navigate('Register');
  };

  if (loading) {
    return <Loading text="Iniciando sesión..." />;
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
          <Text style={styles.title}>NorthPadel</Text>
          <Text style={styles.subtitle}>Reservá tu cancha favorita</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            isPassword
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continuar con Google"
            onPress={() => Alert.alert('Próximamente', 'Login con Google')}
            variant="outline"
            style={styles.googleButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tenés cuenta?</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.registerLink}>Registrate</Text>
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
    marginBottom: spacing.xxl,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  googleButton: {
    marginBottom: spacing.md,
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
  registerLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});