
import React, {
  useEffect,
  useState,
} from "react";

import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";

import {
  getBootstrap,
  getProducts,
} from "./src/api/index";

import {
  getCustomerProfile,
} from "./src/api/customerApi";

import {
  getAuthUser,
  saveAuthUser,
  clearAuthUser,
} from "./src/storage/authStorage";

import { COLORS } from "./src/styles/theme";

import SplashScreen from "./src/screens/auth/SplashScreen";

function AppContent() {
  const [loading, setLoading] =
    useState(true);

  const [showSplash, setShowSplash] =
    useState(true);

  const [authUser, setAuthUser] =
    useState(null);

  const [data, setData] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      const savedUser =
        await getAuthUser();

      if (savedUser) {
        setAuthUser(savedUser);

        if (savedUser.customerId) {
          await loadAppData(
            savedUser.customerId
          );
        }
      }
    } catch (error) {
      console.log(
        "App initialization error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAppData(
    customerId
  ) {
    try {
      const result =
        await getBootstrap(
          customerId
        );

      const customerProfile =
        await getCustomerProfile(
          customerId
        );

      const productList =
        await getProducts();

      setData({
        ...result,
        customer:
          customerProfile.customer,
        address:
          customerProfile.address,
      });

      setProducts(
        Array.isArray(productList)
          ? productList.map(
              (product) => ({
                id: product.id,

                supplierId:
                  product.supplierId,

                sku:
                  product.sku,

                nameEn:
                  product.nameEn,

                nameTa:
                  product.nameTa,

                name:
                  product.nameEn,

                description:
                  product.nameTa || "",

                unitPricePaise:
                  product.unitPricePaise,

                price:
                  Number(
                    product.unitPricePaise ||
                      0
                  ) / 100,

                serviceType:
                  product.serviceType,
              })
            )
          : []
      );
    } catch (error) {
      console.log(
        "Backend error:",
        error
      );

      Alert.alert(
        "Connection Error",
        "Could not connect to the WoW backend."
      );
    }
  }

  async function handleProfileUpdated() {
    if (!authUser?.customerId) {
      return;
    }

    try {
      const customerProfile =
        await getCustomerProfile(
          authUser.customerId
        );

      setData((current) => ({
        ...(current || {}),

        customer:
          customerProfile.customer,

        address:
          customerProfile.address,
      }));
    } catch (error) {
      console.log(
        "Profile refresh error:",
        error
      );

      Alert.alert(
        "Refresh Failed",
        "Your changes were saved, but the latest profile data could not be refreshed."
      );
    }
  }

  async function handleAuthComplete(
    user
  ) {
    try {
      const savedUser = {
        ...user,

        customerId:
          user.customerId || null,
      };

      await saveAuthUser(
        savedUser
      );

      setAuthUser(savedUser);

      if (savedUser.customerId) {
        await loadAppData(
          savedUser.customerId
        );
      }
    } catch (error) {
      console.log(
        "Failed to save user:",
        error
      );
    }
  }

  async function handleLogout() {
    try {
      await clearAuthUser();

      setAuthUser(null);
      setData(null);
      setProducts([]);
    } catch (error) {
      console.log(
        "Logout error:",
        error
      );
    }
  }

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() =>
          setShowSplash(false)
        }
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            COLORS.secondary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading WoW...
        </Text>
      </SafeAreaView>
    );
  }

  if (!authUser) {
    return (
      <AuthNavigator
        onComplete={
          handleAuthComplete
        }
      />
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <MainNavigator
        data={data}
        products={products}
        onLogout={handleLogout}
        onProfileUpdated={
          handleProfileUpdated
        }
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      COLORS.background,
  },

  loadingContainer: {
    flex: 1,

    backgroundColor:
      COLORS.background,

    alignItems: "center",

    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.primary,

    marginTop: 12,

    fontWeight: "600",
  },
});

