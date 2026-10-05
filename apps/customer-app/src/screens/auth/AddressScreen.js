
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddressScreen({
  onSave,
  onBack,
  loading,
  error,
}) {
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  const isValid =
    house.trim().length > 0 &&
    street.trim().length > 0 &&
    city.trim().length > 0 &&
    pincode.length === 6;

  function handleSave() {
    if (!isValid || loading) {
      return;
    }

    onSave({
      house: house.trim(),
      street: street.trim(),
      city: city.trim(),
      pincode,
      landmark: landmark.trim(),
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.backText}>
              ‹
            </Text>

            <Text style={styles.backLabel}>
              Back
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.step}>
              STEP 3 OF 3
            </Text>

            <Text style={styles.title}>
              Where should we deliver?
            </Text>

            <Text style={styles.subtitle}>
              Add your delivery address so we
              know where to bring your water.
            </Text>
          </View>

          {/* House */}
          <View style={styles.field}>
            <Text style={styles.label}>
              House / Flat / Door No.
            </Text>

            <TextInput
              value={house}
              onChangeText={setHouse}
              placeholder="Eg. Flat 204, 12A"
              placeholderTextColor="#9AAAB2"
              style={styles.input}
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Street */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Street / Area
            </Text>

            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="Eg. Anna Nagar West"
              placeholderTextColor="#9AAAB2"
              style={styles.input}
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* City */}
          <View style={styles.field}>
            <Text style={styles.label}>
              City
            </Text>

            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Eg. Chennai"
              placeholderTextColor="#9AAAB2"
              autoCapitalize="words"
              style={styles.input}
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Pincode */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Pincode
            </Text>

            <TextInput
              value={pincode}
              onChangeText={(value) => {
                const numbers =
                  value.replace(/\D/g, "");

                if (numbers.length <= 6) {
                  setPincode(numbers);
                }
              }}
              placeholder="6-digit pincode"
              placeholderTextColor="#9AAAB2"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
              editable={!loading}
            />
          </View>

          {/* Landmark */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Landmark
              <Text style={styles.optional}>
                {" "}
                (Optional)
              </Text>
            </Text>

            <TextInput
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Eg. Near ABC School"
              placeholderTextColor="#9AAAB2"
              style={styles.input}
              returnKeyType="done"
              editable={!loading}
            />
          </View>

          {/* Error */}
          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          {/* Save */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!isValid || loading}
            onPress={handleSave}
            style={[
              styles.saveButton,
              (!isValid || loading) &&
                styles.disabledButton,
            ]}
          >
            <Text style={styles.saveText}>
              {loading
                ? "Creating Account..."
                : "Save Address"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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

  scrollContent: {
    flexGrow: 1,
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
    marginTop: 25,
    marginBottom: 28,
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
    fontSize: 27,
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
    marginBottom: 19,
  },

  label: {
    color: "#0B3B4F",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  optional: {
    color: "#8A9AA2",
    fontWeight: "400",
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

  errorText: {
    color: "#D64545",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    textAlign: "center",
  },

  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0B3B4F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.45,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

