import React from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  COLORS,
  SPACING,
  RADIUS,
} from "../../styles/theme";

function formatEta(eta) {
  if (!eta) {
    return "Not available yet";
  }

  const date = new Date(eta);

  if (Number.isNaN(date.getTime())) {
    return "Not available yet";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function OrderConfirmedScreen({
  order,
  setScreen,
}) {
  if (!order) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.emptyContent}
      >
        <Text style={styles.emptyTitle}>
          Order information is unavailable
        </Text>

        <Text style={styles.emptyText}>
          Please check My Orders to view your orders.
        </Text>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => setScreen("orders")}
        >
          <Text style={styles.trackText}>
            View My Orders
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const orderCode =
    order.code || order.id || "N/A";

  const quantity =
    Number(order.qty || 0);

  const total =
    order.totalPaise != null
      ? Number(order.totalPaise) / 100
      : 0;

  const status =
    order.status || "placed";

  const eta =
    order.eta || null;

  const formattedStatus =
    formatStatus(status);

  const formattedEta =
    formatEta(eta);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <View style={styles.successCircle}>
        <Text style={styles.check}>
          ✓
        </Text>
      </View>

      <Text style={styles.title}>
        Order Confirmed!
      </Text>

      <Text style={styles.subtitle}>
        Your water order has been placed
        successfully.
      </Text>

      <View style={styles.orderCard}>
        <Text style={styles.label}>
          Order Number
        </Text>

        <Text style={styles.orderCode}>
          #{orderCode}
        </Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Quantity
          </Text>

          <Text style={styles.rowValue}>
            {quantity} item(s)
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Status
          </Text>

          <Text style={styles.status}>
            {formattedStatus}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Total
          </Text>

          <Text style={styles.total}>
            ₹{total.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.etaCard}>
        <Text style={styles.etaLabel}>
          EXPECTED DELIVERY
        </Text>

        <Text style={styles.eta}>
          {formattedEta}
        </Text>

        <Text style={styles.etaText}>
          Your delivery estimate is provided
          by the WoW .
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          What happens next?
        </Text>

        <Text style={styles.infoText}>
          ✓ Your order has been received
        </Text>

        <Text style={styles.infoText}>
          ✓ Supplier will prepare your water
        </Text>

        <Text style={styles.infoText}>
          ✓ Delivery partner will bring your order
        </Text>
      </View>

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => setScreen("track")}
      >
        <Text style={styles.trackText}>
          Track Order
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ordersButton}
        onPress={() => setScreen("orders")}
      >
        <Text style={styles.ordersText}>
          View All Orders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => setScreen("home")}
      >
        <Text style={styles.homeText}>
          Back to Home
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  content: {
    padding: SPACING.md,
    paddingBottom: 40,
  },

  emptyContent: {
    flexGrow: 1,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },

  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.lightGreen,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  check: {
    color: COLORS.success,
    fontSize: 38,
    fontWeight: "800",
  },

  title: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 15,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 18,
  },

  label: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  orderCode: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },

  rowLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  rowValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  status: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: "700",
  },

  total: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  etaCard: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginTop: 15,
  },

  etaLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  eta: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 8,
  },

  etaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginTop: 15,
  },

  infoTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  infoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 22,
  },

  trackButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },

  trackText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  ordersButton: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },

  ordersText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  homeButton: {
    alignItems: "center",
    paddingVertical: 15,
  },

  homeText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
  },

  emptyTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },
});