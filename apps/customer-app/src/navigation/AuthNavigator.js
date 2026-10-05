import React, { useState } from "react";

import SplashScreen from "../screens/auth/SplashScreen";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import AddressScreen from "../screens/auth/AddressScreen";

import {
  requestOtp,
  verifyOtp,
  registerCustomer,
} from "../api/index";

import { AUTH_SCREENS } from "./NavigationConstants";

export default function AuthNavigator({
  onComplete,
}) {
  const [screen, setScreen] = useState(
    AUTH_SCREENS.SPLASH
  );

  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    address: null,
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleRegistration(data) {
    try {
      setError("");
      setLoading(true);

      await requestOtp(data.phone);

      setUserData((current) => ({
        ...current,
        ...data,
      }));

      setScreen(AUTH_SCREENS.OTP);
    } catch (error) {
      console.log(
        "OTP request error:",
        error
      );

      setError(
        "Could not send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerified(otp) {
    try {
      setError("");
      setLoading(true);

      const result = await verifyOtp(
        userData.phone,
        otp
      );

      if (result?.customer) {
        onComplete({
          name: result.customer.name,
          phone: result.customer.phone,
          customerId: result.customer.id,
          householdId:
            result.customer.householdId,
        });

        return;
      }

      setScreen(AUTH_SCREENS.ADDRESS);
    } catch (error) {
      console.log(
        "OTP verification error:",
        error
      );

      setError(
        "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddressSave(address) {
    try {
      setError("");
      setLoading(true);

      const result =
        await registerCustomer({
          name: userData.name,
          phone: userData.phone,
          house: address.house,
          street: address.street,
          city: address.city,
          pincode: address.pincode,
          landmark: address.landmark,
        });

      const customer =
        result?.customer;

      const completedUser = {
        ...userData,
        address,
        customerId:
          customer?.id || null,
        householdId:
          customer?.householdId || null,
      };

      setUserData(completedUser);

      onComplete(completedUser);
    } catch (error) {
      console.log(
        "Customer registration error:",
        error
      );

      setError(
        "Could not create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function renderScreen() {
    if (screen === AUTH_SCREENS.SPLASH) {
      return (
        <SplashScreen
          onFinish={() =>
            setScreen(
              AUTH_SCREENS.WELCOME
            )
          }
        />
      );
    }

    if (screen === AUTH_SCREENS.WELCOME) {
      return (
        <WelcomeScreen
          onGetStarted={() =>
            setScreen(
              AUTH_SCREENS.REGISTER
            )
          }
          onLogin={() =>
            setScreen(
              AUTH_SCREENS.REGISTER
            )
          }
        />
      );
    }

    if (screen === AUTH_SCREENS.REGISTER) {
      return (
        <RegisterScreen
          onContinue={handleRegistration}
          onBack={() =>
            setScreen(
              AUTH_SCREENS.WELCOME
            )
          }
          loading={loading}
          error={error}
        />
      );
    }

    if (screen === AUTH_SCREENS.OTP) {
      return (
        <OtpScreen
          phone={userData.phone}
          onVerified={handleOtpVerified}
          onBack={() =>
            setScreen(
              AUTH_SCREENS.REGISTER
            )
          }
          loading={loading}
          error={error}
        />
      );
    }

    if (screen === AUTH_SCREENS.ADDRESS) {
      return (
        <AddressScreen
          onSave={handleAddressSave}
          onBack={() =>
            setScreen(
              AUTH_SCREENS.OTP
            )
          }
          loading={loading}
          error={error}
        />
      );
    }

    return null;
  }

  return renderScreen();
}