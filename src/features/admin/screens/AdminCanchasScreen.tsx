import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../../styles/colors';
import { spacing, fontSize, borderRadius } from '../../../styles/spacing';
import {
  getMisCanchasAdmin,
  crearCanchaAdmin,
  updateCanchaAdmin,
  deleteCanchaAdmin,
  toggleCanchaStatus,
  CanchaAdmin
} from '../services/admin.service';
import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '../../../config/cloudinary';

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
  const [refreshing, setRefreshing] = useState(false);
  
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getMisCanchasAdmin();
      setCanchas(data);
    } catch (error) {
      console.error('❌ [AdminCanchas] Error refrescando canchas:', error);
    } finally {
      setRefreshing(false);
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
    <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={() => openEditModal(item)}>
      <View style={styles.cardHeaderRow}>
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="tennisball-outline" size={28} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.courtName} numberOfLines={1} ellipsizeMode="tail">{item.nombre}</Text>
            <View style={[styles.estadoBadge, item.activa ? styles.estadoActiva : styles.estadoPausada]}>
              <Text style={styles.estadoBadgeText}>{item.activa ? 'Activa' : 'Pausada'}</Text>
            </View>
          </View>
          {(item as any)?.techada !== undefined || (item as any)?.capacidad || (item as any)?.ubicacion ? (
            <Text style={styles.featuresText} numberOfLines={1}>
              {[(item as any)?.techada ? 'Techada' : undefined, (item as any)?.ubicacion, (item as any)?.capacidad ? `${(item as any).capacidad} jugadores` : undefined]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          ) : null}
          <View style={styles.priceRatingRow}>
            <View style={styles.priceRow}>
              <Ionicons name="cash-outline" size={16} color={colors.brandBlue} />
              <Text style={styles.priceText}>${item.precioHora} /hora</Text>
            </View>
            {(item as any)?.rating ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.ratingText}>
                  {(item as any).rating}
                  {(item as any)?.cantidadReviews ? ` (${(item as any).cantidadReviews})` : ''}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.separator} />
      <View style={styles.cardFooterRow}>
        <View style={styles.switchContainer}>
          <Switch
            value={item.activa}
            onValueChange={() => handleToggleStatus(item.id)}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor={'#E0E0E0'}
          />
          <Text style={styles.switchLabel}>{item.activa ? 'Publicada' : 'No publicada'}</Text>
        </View>
        <View style={styles.footerButtonsRow}>
          <TouchableOpacity style={styles.btnOutline} onPress={() => openEditModal(item)} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={16} color={colors.brandBlue} />
            <Text style={styles.btnOutlineText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnFilled} onPress={() => Alert.alert('Estadísticas', 'Navegar a estadísticas de la cancha')} activeOpacity={0.7}>
            <Ionicons name="bar-chart-outline" size={16} color={colors.brandBlue} />
            <Text style={styles.btnFilledText}>Stats</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );



return (
  <SafeAreaView style={styles.container} edges={['top']}>
    {/* Encabezado */}
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Mis Canchas</Text>
        <TouchableOpacity style={styles.headerConfigBtn} onPress={() => {}}>
          <Ionicons name="settings-outline" size={22} color={colors.brandBlue} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSubtitle}>Gestiona tus canchas de padel</Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brandGreen]} tintColor={colors.brandGreen} />
        }
      />
    )}

    {/* Botón flotante */}
    <TouchableOpacity
      style={styles.fab}
      onPress={openCreateModal}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={30} color="#FFFFFF" />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  headerConfigBtn: {
    padding: 6,
    borderRadius: 18,
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
    paddingTop: 16,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courtName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandBlue,
  },
  estadoBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  estadoActiva: {
    backgroundColor: '#4CAF50',
  },
  estadoPausada: {
    backgroundColor: '#9E9E9E',
  },
  estadoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 0,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  footerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brandBlue,
    borderRadius: 8,
    minWidth: 90,
  },
  btnOutlineText: {
    color: colors.brandBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  btnFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.brandGreen,
    borderRadius: 8,
    minWidth: 90,
  },
  btnFilledText: {
    color: colors.brandBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
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
