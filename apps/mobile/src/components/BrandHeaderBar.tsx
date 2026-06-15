import { View, Image, StyleSheet } from 'react-native';

export function BrandHeaderBar() {
  return (
    <View style={styles.bar}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 30,
  },
});
