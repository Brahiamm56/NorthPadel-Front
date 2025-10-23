import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import {
  getMisCanchasAdmin,
  crearCanchaAdmin,
  updateCanchaAdmin,
  deleteCanchaAdmin,
  toggleCanchaStatus,
  CanchaAdmin
} from '../../services/adminService';
import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '../../config/cloudinary';

export const AdminCanchasScreen = () => {
  // Estados
  const [canchas, setCanchas] = useState<CanchaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCancha, setSelectedCancha] = useState<CanchaAdmin | null>(null);
  const [nombre, setNombre] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [techada, setTechada] = useState(false);
  const [pelotitas, setPelotitas] = useState(false);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('23:00');
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Estados para el DateTimePicker
  const [showPickerFor, setShowPickerFor] = useState<'inicio' | 'fin' | null>(null);
  const [pickerTime, setPickerTime] = useState(new Date());

  // Cargar canchas al montar el componente
  useEffect(() => {
    loadCanchas();
  }, []);

  const loadCanchas = async () => {
    try {
      setLoading(true);
      console.log('🏟️ [AdminCanchas] Cargando canchas del admin...');
      const data = await getMisCanchasAdmin();
      console.log('✅ [AdminCanchas] Canchas recibidas:', data);
      console.log('📊 [AdminCanchas] Total:', data.length);
      setCanchas(data);
    } catch (error) {
      console.error('❌ [AdminCanchas] Error cargando canchas:', error);
      Alert.alert('Error', 'No se pudieron cargar las canchas');
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal en modo crear
  const openCreateModal = () => {
    setEditMode(false);
    setSelectedCancha(null);
    resetForm();
    setModalVisible(true);
  };

  // Función para abrir modal en modo editar
  const openEditModal = (cancha: CanchaAdmin) => {
    setEditMode(true);
    setSelectedCancha(cancha);
    setNombre(cancha.nombre);
    setPrecioHora(cancha.precioHora.toString());
    setDescripcion(cancha.descripcion);
    setTechada(cancha.techada || false);
    setPelotitas(cancha.pelotitas || false);
    setHoraInicio((cancha as any).horaInicio || '08:00');
    setHoraFin((cancha as any).horaFin || '23:00');
    setImagenUri(cancha.imagenUrl);
    setModalVisible(true);
  };

  // Función para resetear formulario
  const resetForm = () => {
    setNombre('');
    setPrecioHora('');
    setDescripcion('');
    setTechada(false);
    setPelotitas(false);
    setHoraInicio('08:00');
    setHoraFin('23:00');
    setImagenUri(null);
  };

  // Función para abrir el time picker
  const openTimePicker = (type: 'inicio' | 'fin') => {
    // Convertir la hora actual del estado a un objeto Date
    const horaActual = type === 'inicio' ? horaInicio : horaFin;
    const [hours, minutes] = horaActual.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    setPickerTime(date);
    setShowPickerFor(type);
  };

  // Función para manejar el cambio de hora en el picker
  const onTimeChange = (event: any, selectedDate?: Date) => {
    // En Android, el picker se cierra automáticamente
    if (Platform.OS === 'android') {
      setShowPickerFor(null);
    }
    
    if (event.type === 'set' && selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      if (showPickerFor === 'inicio') {
        setHoraInicio(formattedTime);
      } else if (showPickerFor === 'fin') {
        setHoraFin(formattedTime);
      }
      
      // En iOS, cerrar manualmente después de seleccionar
      if (Platform.OS === 'ios') {
        setShowPickerFor(null);
      }
    } else if (event.type === 'dismissed') {
      setShowPickerFor(null);
    }
  };

  // Función para subir imagen a Cloudinary
  const uploadImageToCloudinary = async (uri: string): Promise<string> => {
    try {
      setUploadingImage(true);

      // Crear FormData para upload sin firma (unsigned upload)
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'cancha_' + Date.now() + '.jpg',
      } as any);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

      // Subir a Cloudinary usando unsigned upload preset
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error de Cloudinary:', errorData);
        throw new Error(errorData.error?.message || 'Error al subir imagen a Cloudinary');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      Alert.alert(
        'Error al subir imagen',
        'No se pudo subir la imagen. Por favor, intenta de nuevo o continúa sin imagen.'
      );
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para seleccionar imagen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para seleccionar imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImagenUri(result.assets[0].uri);
    }
  };

  // Función para manejar submit del formulario
  const handleSubmit = async () => {
    if (!nombre || !precioHora) {
      Alert.alert('Error', 'Nombre y precio por hora son obligatorios');
      return;
    }

    try {
      let imagenUrl = imagenUri;

      // Si hay imagen nueva, subirla
      if (imagenUri && !imagenUri.startsWith('http')) {
        imagenUrl = await uploadImageToCloudinary(imagenUri);
      }

      const canchaData = {
        nombre,
        precioHora: parseFloat(precioHora),
        descripcion,
        techada,
        pelotitas,
        horaInicio,
        horaFin,
        imagenUrl: imagenUrl || '',
        activa: true,
      };

      if (editMode && selectedCancha) {
        await updateCanchaAdmin(selectedCancha.id, canchaData);
        Alert.alert('Éxito', 'Cancha actualizada correctamente');
      } else {
        await crearCanchaAdmin(canchaData);
        Alert.alert('Éxito', 'Cancha creada correctamente');
      }

      setModalVisible(false);
      resetForm();
      loadCanchas();
    } catch (error) {
      console.error('Error guardando cancha:', error);
      Alert.alert('Error', 'No se pudo guardar la cancha');
    }
  };

  // Función para toggle estado activa
  const handleToggleStatus = async (canchaId: string) => {
    try {
      await toggleCanchaStatus(canchaId);
      loadCanchas();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de la cancha');
    }
  };

  // Función para eliminar cancha
  const handleDeleteCancha = async (cancha: CanchaAdmin) => {
    Alert.alert(
      'Eliminar Cancha',
      `¿Estás seguro de que quieres eliminar "${cancha.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCanchaAdmin(cancha.id);
              Alert.alert('Éxito', 'Cancha eliminada correctamente');
              loadCanchas();
            } catch (error) {
              console.error('Error eliminando cancha:', error);
              Alert.alert('Error', 'No se pudo eliminar la cancha');
            }
          },
        },
      ]
    );
  };

  // Renderizar cada ítem de la lista de canchas
  const renderItem = ({ item }: { item: CanchaAdmin }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
          </View>
        )}
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.precio}>${item.precioHora} /hora</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCancha(item)}
        >
          <Ionicons name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {item.activa ? 'Publicada' : 'Oculta'}
          </Text>
          <Switch
            value={item.activa}
            onValueChange={() => handleToggleStatus(item.id)}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={item.activa ? colors.white : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Canchas</Text>
      </View>

      {/* Lista de canchas o estado vacío */}
      {canchas.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emoji}>🎾</Text>
          <Text style={styles.emptyTitle}>Aún no tienes canchas publicadas</Text>
          <Text style={styles.emptySubtitle}>
            Haz clic en el botón + para añadir tu primera cancha
          </Text>
        </View>
      ) : (
        <FlatList
          data={canchas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreateModal}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para crear/editar cancha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Editar Cancha' : 'Crear Nueva Cancha'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Nombre de la cancha</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Cancha 1"
                value={nombre}
                onChangeText={setNombre}
              />

              <Text style={styles.label}>Precio por hora</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 1500"
                value={precioHora}
                onChangeText={setPrecioHora}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe la cancha..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={3}
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Techada</Text>
                <Switch
                  value={techada}
                  onValueChange={setTechada}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={techada ? colors.white : '#f4f3f4'}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Pelotitas disponibles</Text>
                <Switch
                  value={pelotitas}
                  onValueChange={setPelotitas}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={pelotitas ? colors.white : '#f4f3f4'}
                />
              </View>

              {/* Selectores de Hora */}
              <View style={styles.timePickerSection}>
                <Text style={styles.sectionTitle}>Horario de Disponibilidad</Text>
                
                <View style={styles.timePickerRow}>
                  <View style={styles.timePickerItem}>
                    <Text style={styles.label}>Hora Apertura</Text>
                    <TouchableOpacity
                      style={styles.timeDisplayButton}
                      onPress={() => openTimePicker('inicio')}
                    >
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <Text style={styles.timeDisplayText}>{horaInicio}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timePickerItem}>
                    <Text style={styles.label}>Hora Cierre</Text>
                    <TouchableOpacity
                      style={styles.timeDisplayButton}
                      onPress={() => openTimePicker('fin')}
                    >
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <Text style={styles.timeDisplayText}>{horaFin}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Ionicons name="camera" size={24} color={colors.primary} />
                <Text style={styles.photoButtonText}>
                  {imagenUri ? 'Cambiar foto' : 'Agregar foto'}
                </Text>
              </TouchableOpacity>

              {imagenUri && (
                <Image source={{ uri: imagenUri }} style={styles.previewImage} />
              )}

              <TouchableOpacity
                style={[styles.publishButton, uploadingImage && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={uploadingImage}
              >
                <Text style={styles.publishButtonText}>
                  {uploadingImage ? 'Subiendo...' : (editMode ? 'Actualizar Cancha' : 'Crear Cancha')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker - Selector de Hora Nativo */}
      {showPickerFor !== null && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showPickerFor !== null}
          onRequestClose={() => setShowPickerFor(null)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  {showPickerFor === 'inicio' ? 'Hora de Apertura' : 'Hora de Cierre'}
                </Text>
                {Platform.OS === 'ios' && (
                  <TouchableOpacity onPress={() => setShowPickerFor(null)}>
                    <Text style={styles.pickerDoneButton}>Aceptar</Text>
                  </TouchableOpacity>
                )}
              </View>
              <DateTimePicker
                value={pickerTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour={true}
                onChange={onTimeChange}
                textColor={colors.text}
                accentColor={colors.primary}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  precio: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    marginRight: spacing.sm,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  form: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  photoButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
  },
  publishButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  // Estilos para la sección de Time Picker
  timePickerSection: {
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  timePickerItem: {
    flex: 1,
  },
  timeDisplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timeDisplayText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  // Estilos para el Modal del DateTimePicker
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  pickerDoneButton: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
});
