// src/components/ThemeToggleButton.tsx - زر تبديل الوضع المظلم
import React from 'react';
import { Animated, Easing } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useAppTheme } from '../contexts/ThemeContext';

interface ThemeToggleButtonProps {
  size?: number;
  style?: any;
  showLabel?: boolean;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  size = 24,
  style,
  showLabel = false,
}) => {
  const paperTheme = useTheme();
  const { toggleTheme, isDark } = useAppTheme();
  const [animatedValue] = React.useState(new Animated.Value(isDark ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isDark, animatedValue]);

  const handleToggle = () => {
    toggleTheme();
  };

  const iconName = isDark ? 'weather-sunny' : 'weather-night';
  const accessibilityLabel = isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي';

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              rotate: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
        style,
      ]}
    >
      <IconButton
        icon={iconName}
        size={size}
        iconColor={paperTheme.colors.onSurface}
        onPress={handleToggle}
        accessibilityLabel={accessibilityLabel}
        style={{
          backgroundColor: paperTheme.colors.surfaceVariant,
        }}
      />
    </Animated.View>
  );
};

export default ThemeToggleButton;