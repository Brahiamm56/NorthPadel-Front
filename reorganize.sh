#!/bin/bash

# Crear estructura de directorios si no existe
mkdir -p src/{features/{auth,admin,user,reservas,canchas}/{services,screens,hooks,contexts},components/features/{auth,admin,user,reservas,canchas},styles,types,utils}

# Mover archivos por feature
echo "Moviendo archivos por feature..."

# Auth feature
mv src/screens/auth/* src/features/auth/screens/
mv src/services/authService.ts src/features/auth/services/
mv src/context/AuthContext.tsx src/features/auth/contexts/
mv src/components/auth/* src/components/features/auth/

# Admin feature
mv src/screens/admin/* src/features/admin/screens/
mv src/services/adminService.ts src/features/admin/services/
mv src/hooks/useReservasAdmin.ts src/features/admin/hooks/
mv src/components/admin/* src/components/features/admin/

# User feature
mv src/screens/user/* src/features/user/screens/
mv src/services/userService.ts src/features/user/services/
mv src/services/userReservasService.ts src/features/user/services/
mv src/components/user/* src/components/features/user/

# Reservas feature
mv src/services/reservaService.ts src/features/reservas/services/
mv src/services/reservasService.ts src/features/reservas/services/

# Canchas feature
mv src/services/canchasService.ts src/features/canchas/services/
mv src/services/clubService.ts src/features/canchas/services/

# Otros directorios
mv src/theme/* src/styles/

# Renombrar archivos
echo "Renombrando archivos..."

# Componentes Admin
mv src/components/features/admin/CalendarioHorizontal.tsx src/components/features/admin/AdminCalendar.tsx
mv src/components/features/admin/CalendarioHorizontalMejorado.tsx src/components/features/admin/AdminCalendarEnhanced.tsx
mv src/components/features/admin/CanchaDisponible.tsx src/components/features/admin/CourtAvailability.tsx
mv src/components/features/admin/CanchasDisponibles.tsx src/components/features/admin/CourtsAvailability.tsx
mv src/components/features/admin/CanchasTabs.tsx src/components/features/admin/CourtTabs.tsx
mv src/components/features/admin/EmptyState.tsx src/components/features/admin/EmptyState.tsx
mv src/components/features/admin/EstadoDropdown.tsx src/components/features/admin/StatusDropdown.tsx
mv src/components/features/admin/FiltrosMejorados.tsx src/components/features/admin/EnhancedFilters.tsx
mv src/components/features/admin/FloatingActionButton.tsx src/components/features/admin/FloatingActionButton.tsx
mv src/components/features/admin/HeaderAdmin.tsx src/components/features/admin/AdminHeader.tsx
mv src/components/features/admin/HeaderMejorado.tsx src/components/features/admin/EnhancedHeader.tsx
mv src/components/features/admin/ReservaCard.tsx src/components/features/admin/ReservationCard.tsx
mv src/components/features/admin/ReservaCardMejorada.tsx src/components/features/admin/EnhancedReservationCard.tsx
mv src/components/features/admin/SearchBar.tsx src/components/features/admin/SearchBar.tsx
mv src/components/features/admin/SkeletonLoading.tsx src/components/features/admin/SkeletonLoading.tsx

# Servicios
mv src/features/auth/services/authService.ts src/features/auth/services/authentication.service.ts
mv src/features/admin/services/adminService.ts src/features/admin/services/admin.service.ts
mv src/features/user/services/userService.ts src/features/user/services/user.service.ts
mv src/features/reservas/services/reservasService.ts src/features/reservas/services/reservations.service.ts
mv src/features/canchas/services/canchasService.ts src/features/canchas/services/courts.service.ts

echo "¡Reorganización completada!"