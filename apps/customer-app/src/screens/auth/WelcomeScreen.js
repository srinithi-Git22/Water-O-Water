import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen({
  onGetStarted,
  onLogin,
}) {
  const { height } = useWindowDimensions();

  const illustrationSize = Math.min(height * 0.25, 190);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F2F7FA"
      />

      <View style={styles.container}>
        {/* Logo / Illustration */}
        <View
          style={[
            styles.illustration,
            {
              width: illustrationSize,
              height: illustrationSize,
              borderRadius: illustrationSize / 2,
            },
          ]}
        >
          <Text style={styles.waterDrop}>💧</Text>
        </View>

        {/* Branding */}
        <Text style={styles.title}>
          WATER-O-WATER
        </Text>

        <Text style={styles.heading}>
          Pure water.
        </Text>

        <Text style={styles.heading}>
          Delivered to your doorstep.
        </Text>

        <Text style={styles.description}>
          Order fresh drinking water easily
          and get it delivered when you need it.
        </Text>

        {/* Bottom Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.primaryButton}
            onPress={onGetStarted}
          >
            <Text style={styles.primaryButtonText}>
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.loginButton}
            onPress={onLogin}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginBold}>
                Login
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F7FA",
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 20,
  },

  illustration: {
    backgroundColor: "#0B3B4F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  waterDrop: {
    fontSize: 70,
  },

  title: {
    color: "#00A8CC",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 28,
  },

  heading: {
    color: "#0B3B4F",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 34,
  },

  description: {
    color: "#607782",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 16,
    maxWidth: 330,
  },

  actions: {
    width: "100%",
    marginTop: "auto",
  },

  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0B3B4F",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loginButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  loginText: {
    color: "#607782",
    fontSize: 14,
  },

  loginBold: {
    color: "#00A8CC",
    fontWeight: "700",
  },
});