import React, { useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import HomeScreen from "../screens/main/HomeScreen";
import OrderScreen from "../screens/main/OrderScreen";
import OrdersScreen from "../screens/main/OrdersScreen";
import TrackScreen from "../screens/main/TrackScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import OrderConfirmedScreen from "../screens/main/OrderConfirmedScreen";

import BottomTabBar from "../components/BottomTabBar";

import { MAIN_SCREENS } from "./NavigationConstants";
import { COLORS } from "../styles/theme";

export default function MainNavigator({
  data,
  products,
  onLogout,
  onProfileUpdated,
}) {
  const [screen, setScreen] = useState(
    MAIN_SCREENS.HOME
  );

  const [quantities, setQuantities] = useState({});

  const [confirmedOrder, setConfirmedOrder] =
    useState(null);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  function changeQuantity(productId, amount) {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(
        0,
        (current[productId] || 0) + amount
      ),
    }));
  }

 function handleOrderConfirmed(order) {
  setConfirmedOrder(order);

  setSelectedOrder(order);

  setQuantities({});

  setScreen(MAIN_SCREENS.CONFIRMED);
}

  function handleTrackOrder(order) {
    setSelectedOrder(order);
    setScreen(MAIN_SCREENS.TRACK);
  }

  function renderScreen() {
    if (screen === MAIN_SCREENS.HOME) {
      return (
        <HomeScreen
          quantities={quantities}
          changeQuantity={changeQuantity}
          setScreen={setScreen}
          data={data}
          products={products}
        />
      );
    }

    if (screen === MAIN_SCREENS.ORDER) {
      return (
        <OrderScreen
          quantities={quantities}
          changeQuantity={changeQuantity}
          setScreen={setScreen}
          data={data}
          setConfirmedOrder={
            handleOrderConfirmed
          }
          products={products}
        />
      );
    }

    if (screen === MAIN_SCREENS.CONFIRMED) {
      return (
        <OrderConfirmedScreen
          order={confirmedOrder}
          setScreen={setScreen}
        />
      );
    }

    if (screen === MAIN_SCREENS.ORDERS) {
      return (
        <OrdersScreen
          setScreen={setScreen}
          data={data}
          onTrackOrder={
            handleTrackOrder
          }
        />
      );
    }

    if (screen === MAIN_SCREENS.TRACK) {
      return (
        <TrackScreen
          setScreen={setScreen}
          data={data}
          confirmedOrder={
            selectedOrder || confirmedOrder
          }
        />
      );
    }

    if (screen === MAIN_SCREENS.PROFILE) {
      return (
        <ProfileScreen
          data={data}
          setScreen={setScreen}
          onLogout={onLogout}
          onProfileUpdated={
            onProfileUpdated
          }
        />
      );
    }

    return null;
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.appHeader}>
        <Text style={styles.title}>
          WoW
        </Text>

        <Text style={styles.subtitle}>
          Water O Water
        </Text>
      </View>

      <View style={styles.screen}>
        {renderScreen()}
      </View>

      {screen !== MAIN_SCREENS.CONFIRMED && (
        <BottomTabBar
          screen={screen}
          setScreen={setScreen}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  appHeader: {
    backgroundColor:
      COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#CDE6ED",
    fontSize: 12,
    marginTop: 2,
  },

  screen: {
    flex: 1,
  },
});