import React from 'react';
import { View, Image, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { X } from 'lucide-react-native';
import { courseDetailStyles } from './styles';

interface ImageModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={courseDetailStyles.modalContainer}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity
          style={courseDetailStyles.modalCloseButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <X size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={courseDetailStyles.modalImageContainer}
          activeOpacity={1}
          onPress={onClose}
        >
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={courseDetailStyles.modalImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
