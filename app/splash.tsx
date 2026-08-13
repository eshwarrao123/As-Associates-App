import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { Colors, FontFamily, FontSize, withAlpha } from '../src/constants/tokens';

export default function SplashScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.content}>
        <Image
          source={require('../assets/logo-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>AS Associates</Text>

        <Text style={styles.subtitle}>Field Management Platform</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textOnPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: withAlpha(Colors.textOnPrimary, 0.7),
  },
});
