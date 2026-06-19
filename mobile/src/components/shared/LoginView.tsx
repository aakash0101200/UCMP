import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';

interface LoginViewProps {
  loginId: string;
  setLoginId: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLoggingIn: boolean;
  activeColor: string;
  isDark: boolean;
  dynamicStyles: any;
  onLogin: () => void;
}

export default function LoginView({
  loginId,
  setLoginId,
  password,
  setPassword,
  isLoggingIn,
  activeColor,
  isDark,
  dynamicStyles,
  onLogin
}: LoginViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, dynamicStyles.container]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <View style={styles.headerContainer}>
          <Text style={[styles.appTitle, { color: activeColor }]}>UCMP</Text>
          <Text style={[styles.appSubtitle, dynamicStyles.appSubtitle]}>Academic Launchpad</Text>
        </View>

        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Portal Sign In</Text>
          <Text style={[styles.cardInfo, dynamicStyles.cardInfo]}>
            Sign in with your College credentials. Student profiles will bind to this device.
          </Text>

          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder="College ID (e.g. STU123 or FAC002)"
            placeholderTextColor={isDark ? "#52525B" : "#94A3B8"}
            value={loginId}
            onChangeText={setLoginId}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder="Password"
            placeholderTextColor={isDark ? "#52525B" : "#94A3B8"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: activeColor, shadowColor: activeColor }]}
            onPress={onLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Authenticate Securely</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardInfo: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  primaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
