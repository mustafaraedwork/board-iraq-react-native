// src/components/AdvancedColorPicker.tsx - منتقي ألوان متقدم
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { ColorPicker, TriangleColorPicker, HueSlider, SaturationSlider, LightnessSlider } from 'react-native-color-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppTheme, useShadows } from '../contexts/ThemeContext';

interface AdvancedColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  initialColor?: string;
  title: string;
  colorType: 'background' | 'text' | 'button';
}

const { width, height } = Dimensions.get('window');

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  visible,
  onClose,
  onColorSelect,
  initialColor = '#2196F3',
  title,
  colorType,
}) => {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
  const shadows = useShadows();
  
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [pickerType, setPickerType] = useState<'wheel' | 'triangle' | 'sliders'>('wheel');
  const [slideAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleConfirm = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  const handleCancel = () => {
    setSelectedColor(initialColor);
    onClose();
  };

  const getColorTypeIcon = () => {
    switch (colorType) {
      case 'background': return 'format-color-fill';
      case 'text': return 'format-color-text';
      case 'button': return 'gesture-tap-button';
      default: return 'palette';
    }
  };

  const presetColors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
    '#795548', '#9E9E9E', '#607D8B', '#000000',
    '#FFFFFF', '#212121', '#424242', '#757575',
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: paperTheme.colors.surface,
              transform: [
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
            shadows.large,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name={getColorTypeIcon()}
                size={24}
                color={paperTheme.colors.primary}
              />
              <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
                {title}
              </Text>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={onClose}
              iconColor={paperTheme.colors.onSurface}
            />
          </View>

          {/* Color Preview */}
          <View style={styles.previewSection}>
            <Surface style={[styles.colorPreview, shadows.medium]}>
              <View
                style={[
                  styles.colorSample,
                  { backgroundColor: selectedColor },
                ]}
              />
              <Text style={[styles.colorValue, { color: paperTheme.colors.onSurface }]}>
                {selectedColor.toUpperCase()}
              </Text>
            </Surface>
          </View>

          {/* Picker Type Selector */}
          <View style={styles.pickerTypeSelector}>
            {[
              { type: 'wheel', icon: 'circle-outline', label: 'عجلة' },
              { type: 'triangle', icon: 'triangle-outline', label: 'مثلث' },
              { type: 'sliders', icon: 'tune', label: 'شرائط' },
            ].map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: pickerType === item.type 
                      ? paperTheme.colors.primary 
                      : paperTheme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => setPickerType(item.type as any)}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={
                    pickerType === item.type
                      ? paperTheme.colors.onPrimary
                      : paperTheme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.typeLabel,
                    {
                      color: pickerType === item.type
                        ? paperTheme.colors.onPrimary
                        : paperTheme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color Picker */}
          <View style={styles.pickerContainer}>
            {pickerType === 'wheel' && (
              <ColorPicker
                style={styles.colorPicker}
                color={selectedColor}
                onColorChange={handleColorChange}
                thumbSize={30}
                sliderSize={20}
                noSnap={true}
                row={false}
              />
            )}

            {pickerType === 'triangle' && (
              <TriangleColorPicker
                style={styles.trianglePicker}
                color={selectedColor}
                onColorChange={handleColorChange}
              />
            )}

            {pickerType === 'sliders' && (
              <View style={styles.slidersContainer}>
                <Text style={[styles.sliderLabel, { color: paperTheme.colors.onSurface }]}>
                  درجة اللون (Hue)
                </Text>
                <HueSlider
                  style={styles.slider}
                  gradientSteps={40}
                  color={selectedColor}
                  onColorChange={handleColorChange}
                />

                <Text style={[styles.sliderLabel, { color: paperTheme.colors.onSurface }]}>
                  التشبع (Saturation)
                </Text>
                <SaturationSlider
                  style={styles.slider}
                  gradientSteps={20}
                  color={selectedColor}
                  onColorChange={handleColorChange}
                />

                <Text style={[styles.sliderLabel, { color: paperTheme.colors.onSurface }]}>
                  السطوع (Lightness)
                </Text>
                <LightnessSlider
                  style={styles.slider}
                  gradientSteps={20}
                  color={selectedColor}
                  onColorChange={handleColorChange}
                />
              </View>
            )}
          </View>

          {/* Preset Colors */}
          <View style={styles.presetsSection}>
            <Text style={[styles.presetsTitle, { color: paperTheme.colors.onSurface }]}>
              ألوان سريعة
            </Text>
            <View style={styles.presetsGrid}>
              {presetColors.map((color, index) => (
                <TouchableOpacity
                  key={`preset-${index}`}
                  style={[
                    styles.presetColor,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedPreset,
                    shadows.small,
                  ]}
                  onPress={() => handleColorChange(color)}
                />
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.actionButton}
              textColor={paperTheme.colors.onSurface}
            >
              إلغاء
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={styles.actionButton}
              buttonColor={paperTheme.colors.primary}
              textColor={paperTheme.colors.onPrimary}
            >
              تأكيد
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.95,
    maxWidth: 400,
    maxHeight: height * 0.85,
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  colorPreview: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
  },
  colorSample: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorValue: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  pickerTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  colorPicker: {
    width: 250,
    height: 250,
  },
  trianglePicker: {
    width: 200,
    height: 200,
  },
  slidersContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 15,
  },
  slider: {
    height: 30,
    borderRadius: 15,
  },
  presetsSection: {
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  presetColor: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedPreset: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
});

export default AdvancedColorPicker;