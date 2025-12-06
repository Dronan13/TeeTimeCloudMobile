import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Menu } from 'lucide-react-native';
import QuickActionsMenu from './QuickActionsMenu';

export default function FloatingActionButton() {
  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    setMenuVisible(true);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
          activeOpacity={0.9}
        >
          <Menu size={28} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>

      <QuickActionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2d7a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
