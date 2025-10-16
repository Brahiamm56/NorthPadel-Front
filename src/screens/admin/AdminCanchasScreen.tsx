import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';

interface Cancha {
  id: string;
  nombre: string;
  piso: string;
  pared: string;
  precio: string;
  publicada: boolean;
}

export const AdminCanchasScreen = () => {
  // Estados
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [piso, setPiso] = useState('');
  const [pared, setPared] = useState('');
  const [precio, setPrecio] = useState('');

  // Función para agregar una nueva cancha
  const agregarCancha = () => {
    if (!nombre || !piso || !pared || !precio) return;
    
    const nuevaCancha: Cancha = {
      id: Date.now().toString(),
      nombre,
      piso,
      pared,
      precio,
      publicada: true,
    };

    setCanchas([...canchas, nuevaCancha]);
    setModalVisible(false);
    // Limpiar formulario
    setNombre('');
    setPiso('');
    setPared('');
    setPrecio('');
  };

  // Función para cambiar el estado de publicación
  const togglePublicada = (id: string) => {
    setCanchas(
      canchas.map((cancha) =>
        cancha.id === id ? { ...cancha, publicada: !cancha.publicada } : cancha
      )
    );
  };

  // Renderizar cada ítem de la lista de canchas
  const renderItem = ({ item }: { item: Cancha }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text>Piso: {item.piso}</Text>
        <Text>Pared: {item.pared}</Text>
        <Text style={styles.precio}>${item.precio} /hora</Text>
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {item.publicada ? 'Publicada' : 'Oculta'}
        </Text>
        <Switch
          value={item.publicada}
          onValueChange={() => togglePublicada(item.id)}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={item.publicada ? colors.white : '#f4f3f4'}
        />
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
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para añadir cancha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Nueva Cancha</Text>
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

              <Text style={styles.label}>Tipo de piso</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Cemento, Césped"
                value={piso}
                onChangeText={setPiso}
              />

              <Text style={styles.label}>Tipo de pared</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Cristal, Ladrillo"
                value={pared}
                onChangeText={setPared}
              />

              <Text style={styles.label}>Precio por hora</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 1500"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.photoButton}>
                <Ionicons name="camera" size={24} color={colors.primary} />
                <Text style={styles.photoButtonText}>Agregar fotos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.publishButton}
                onPress={agregarCancha}
              >
                <Text style={styles.publishButtonText}>Publicar Cancha</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  precio: {
    marginTop: spacing.xs,
    fontWeight: 'bold',
    color: colors.primary,
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
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  publishButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
