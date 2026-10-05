
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { requestOtp } from "../../api/authApi";
export default function OtpScreen({
  phone,
  onVerified,
  onBack,
  loading,
  error,
}) {
  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  function handleVerify() {
    if (otp.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit OTP."
      );
      return;
    }

    onVerified(otp);
  }
async function handleResend() {
  try {
    setOtp("");

    await requestOtp(phone);

    Alert.alert(
      "OTP Sent",
      "A new OTP has been sent to your mobile number."
    );
  } catch (error) {
    console.log(
      "Resend OTP error:",
      error
    );

    Alert.alert(
      "OTP Error",
      "Could not resend OTP. Please try again."
    );
  }
}

  const maskedPhone = phone
    ? `+91 ${phone.slice(0, 2)}••••${phone.slice(-2)}`
    : "+91 ••••••••••";

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
              STEP 2 OF 3
            </Text>

            <Text style={styles.title}>
              Verify your number
            </Text>

            <Text style={styles.subtitle}>
              Enter the 6-digit OTP sent to
            </Text>

            <Text style={styles.phone}>
              {maskedPhone}
            </Text>
          </View>

          {/* Hidden native input */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(value) => {
              const numbers =
                value.replace(/\D/g, "");

              if (numbers.length <= 6) {
                setOtp(numbers);
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            style={styles.hiddenInput}
            editable={!loading}
          />

          {/* OTP Boxes */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              inputRef.current?.focus()
            }
            style={styles.otpContainer}
            disabled={loading}
          >
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    otp[index] &&
                      styles.otpBoxFilled,
                  ]}
                >
                  <Text style={styles.otpText}>
                    {otp[index] || ""}
                  </Text>
                </View>
              )
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendLabel}>
              Didn't receive the OTP?
            </Text>

            <TouchableOpacity
              onPress={handleResend}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text
                style={[
                  styles.resendButton,
                  loading &&
                    styles.disabledResend,
                ]}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          {/* Verify */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={
                otp.length !== 6 || loading
              }
              onPress={handleVerify}
              style={[
                styles.verifyButton,
                (otp.length !== 6 ||
                  loading) &&
                  styles.disabledButton,
              ]}
            >
              <Text style={styles.verifyText}>
                {loading
                  ? "Verifying..."
                  : "Verify & Continue"}
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
    marginTop: 12,
  },

  phone: {
    color: "#0B3B4F",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 5,
  },

  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 45,
  },

  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5E2E7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxFilled: {
    borderColor: "#00A8CC",
  },

  otpText: {
    color: "#0B3B4F",
    fontSize: 22,
    fontWeight: "700",
  },

  resendContainer: {
    alignItems: "center",
    marginTop: 28,
  },

  resendLabel: {
    color: "#84969E",
    fontSize: 13,
  },

  resendButton: {
    color: "#00A8CC",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },

  disabledResend: {
    opacity: 0.45,
  },

  errorText: {
    color: "#D64545",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 20,
  },

  bottomSection: {
    marginTop: "auto",
  },

  verifyButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0B3B4F",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.45,
  },

  verifyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

