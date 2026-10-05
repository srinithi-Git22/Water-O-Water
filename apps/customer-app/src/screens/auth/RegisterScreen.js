
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen({
  onContinue,
  onBack,
  loading,
  error,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const isValid =
    name.trim().length > 0 &&
    phone.length === 10;

  function handleContinue() {
    if (!isValid || loading) {
      return;
    }

    onContinue({
      name: name.trim(),
      phone,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F2F7FA"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View style={styles.container}>
          {/* Back */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.backText}>‹</Text>

            <Text style={styles.backLabel}>
              Back
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.step}>
              STEP 1 OF 3
            </Text>

            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.subtitle}>
              Enter your details to get started
              with WoW.
            </Text>
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Full Name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#9AAAB2"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Mobile Number
            </Text>

            <View style={styles.phoneContainer}>
              <Text style={styles.countryCode}>
                +91
              </Text>

              <TextInput
                value={phone}
                onChangeText={(value) => {
                  const numbers =
                    value.replace(/\D/g, "");

                  if (numbers.length <= 10) {
                    setPhone(numbers);
                  }
                }}
                placeholder="10-digit mobile number"
                placeholderTextColor="#9AAAB2"
                keyboardType="number-pad"
                maxLength={10}
                style={styles.phoneInput}
                editable={!loading}
              />
            </View>
          </View>

          {/* Error */}
          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          {/* Continue */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isValid || loading}
              onPress={handleContinue}
              style={[
                styles.continueButton,
                (!isValid || loading) &&
                  styles.disabledButton,
              ]}
            >
              <Text style={styles.continueText}>
                {loading
                  ? "Sending OTP..."
                  : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F7FA",
  },

  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    alignSelf: "flex-start",
  },

  backText: {
    color: "#0B3B4F",
    fontSize: 32,
    lineHeight: 32,
    marginRight: 5,
  },

  backLabel: {
    color: "#0B3B4F",
    fontSize: 14,
    fontWeight: "600",
  },

  header: {
    marginTop: 30,
    marginBottom: 35,
  },

  step: {
    color: "#00A8CC",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
  },

  title: {
    color: "#0B3B4F",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35,
  },

  subtitle: {
    color: "#607782",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },

  field: {
    marginBottom: 22,
  },

  label: {
    color: "#0B3B4F",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D5E2E7",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    color: "#0B3B4F",
    fontSize: 16,
  },

  phoneContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5E2E7",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  countryCode: {
    color: "#0B3B4F",
    fontSize: 16,
    fontWeight: "700",
    paddingLeft: 16,
    paddingRight: 12,
  },

  phoneInput: {
    flex: 1,
    height: 52,
    color: "#0B3B4F",
    fontSize: 16,
    paddingRight: 16,
  },

  errorText: {
    color: "#D64545",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },

  bottomSection: {
    marginTop: "auto",
  },

  continueButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0B3B4F",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.45,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

