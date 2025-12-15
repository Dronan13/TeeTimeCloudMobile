import React, { useState } from 'react';
import { View, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { CourseGallery as CourseGalleryType } from '@/types';
import { courseDetailStyles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CourseGalleryProps {
  images: CourseGalleryType[];
  onImagePress: (imageUrl: string) => void;
}

export const CourseGallery: React.FC<CourseGalleryProps> = ({ images, onImagePress }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const renderGalleryItem = ({ item }: { item: CourseGalleryType }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(item.image_url)}>
      <Image
        source={{ uri: item.image_url }}
        style={courseDetailStyles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={courseDetailStyles.galleryContainer}>
      <FlatList
        data={images}
        renderItem={renderGalleryItem}
        keyExtractor={(item, index) => item.id || `image-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentImageIndex(index);
        }}
      />
      {images.length > 1 && (
        <View style={courseDetailStyles.paginationDots}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                courseDetailStyles.dot,
                index === currentImageIndex && courseDetailStyles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};
