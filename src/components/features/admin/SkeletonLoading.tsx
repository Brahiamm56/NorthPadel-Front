import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';

interface SkeletonCardProps {
  width?: number | string;
  height?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  width = '100%', 
  height = 120 
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
};

export const SkeletonReservaCard: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      {/* Header skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonCard width={120} height={20} />
        <SkeletonCard width={80} height={16} />
      </View>
      
      {/* Body skeleton */}
      <View style={styles.bodySkeleton}>
        <View style={styles.usuarioSkeleton}>
          <SkeletonCard width={44} height={44} />
          <View style={styles.usuarioInfoSkeleton}>
            <SkeletonCard width={100} height={16} />
            <SkeletonCard width={80} height={12} />
          </View>
        </View>
        <SkeletonCard width={60} height={60} />
      </View>
      
      {/* Footer skeleton */}
      <View style={styles.footerSkeleton}>
        <SkeletonCard width={80} height={16} />
        <SkeletonCard width={60} height={16} />
      </View>
      
      {/* Buttons skeleton */}
      <View style={styles.buttonsSkeleton}>
        <SkeletonCard width={80} height={32} />
        <SkeletonCard width={80} height={32} />
        <SkeletonCard width={80} height={32} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray200,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bodySkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usuarioSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  usuarioInfoSkeleton: {
    marginLeft: 12,
    flex: 1,
  },
  footerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  buttonsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
