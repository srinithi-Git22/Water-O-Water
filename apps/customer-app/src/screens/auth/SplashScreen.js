import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen({ onFinish }) {
  const { width } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const logoSize = Math.min(width * 0.25, 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F2F7FA"
      />

      <View style={styles.container}>
        <View
          style={[
            styles.logoCircle,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize / 2,
            },
          ]}
        >
          <Text style={styles.drop}>💧</Text>
        </View>

        <Text style={styles.title}>
          WATER-O-WATER
        </Text>

        <Text style={styles.subtitle}>
          Pure water. Delivered to your doorstep.
        </Text>

        <ActivityIndicator
          size="small"
          color="#00A8CC"
          style={styles.loader}
        />
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
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoCircle: {
    backgroundColor: "#0B3B4F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  drop: {
    fontSize: 44,
  },

  title: {
    color: "#0B3B4F",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
  },

  subtitle: {
    color: "#5F7480",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
    maxWidth: 320,
  },

  loader: {
    marginTop: 30,
  },
});