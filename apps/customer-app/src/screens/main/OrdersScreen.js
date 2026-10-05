
import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import StatusTimeline from "../../components/StatusTimeline";

import { COLORS } from "../../styles/theme";

import { getOrders } from "../../api/orderApi";

import { getAuthUser } from "../../storage/authStorage";

function getStatusLabel(status) {
  if (!status) {
    return "Placed";
  }

  switch (status) {
    case "placed":
      return "Placed";

    case "accepted":
      return "Accepted";

    case "preparing":
      return "Preparing";

    case "ready":
      return "Ready";

    case "out_for_delivery":
      return "Out for delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function isActiveOrder(status) {
  return (
    status !== "delivered" &&
    status !== "cancelled"
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Recent order";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recent order";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatEta(eta) {
  if (!eta) {
    return null;
  }

  const date = new Date(eta);

  if (Number.isNaN(date.getTime())) {
    return eta;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getTotal(order) {
  if (order?.totalPaise != null) {
    return (
      Number(order.totalPaise) / 100
    );
  }

  return 0;
}

export default function OrdersScreen({
  onTrackOrder,
}) {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    // Initial load
    loadOrders(true);

    // Background polling every 5 seconds.
    // This does NOT show the loading screen.
    const interval = setInterval(() => {
      loadOrders(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  async function loadOrders(showLoading = false) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const authUser =
        await getAuthUser();

      const customerId =
        authUser?.customerId ||
        authUser?.id ||
        null;

      if (!customerId) {
        setOrders([]);

        setError(
          "Customer information is not available. Please login again."
        );

        return;
      }

      const result =
        await getOrders(
          customerId
        );

      setOrders(
        Array.isArray(result)
          ? result
          : []
      );

      // Clear an old error after
      // a successful request.
      setError("");
    } catch (err) {
      console.log(
        "My Orders error:",
        err
      );

      /*
       * During background polling:
       * keep the current screen and
       * existing orders visible.
       */
      if (
        showLoading ||
        orders.length === 0
      ) {
        setError(
          err?.message ||
            "Could not load your orders."
        );
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  /*
   * Initial loading screen only.
   *
   * Background polling does not reach
   * this screen because loading remains false.
   */
  if (loading) {
    return (
      <View
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
          Loading your orders...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={
        styles.content
      }
    >
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>
            Orders
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Your recent water orders
          </Text>
        </View>
      </View>

      {error ? (
        <View
          style={
            styles.errorCard
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={() =>
              loadOrders(true)
            }
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!error &&
      orders.length === 0 ? (
        <View
          style={
            styles.emptyCard
          }
        >
          <Text
            style={
              styles.emptyIcon
            }
          >
            💧
          </Text>

          <Text
            style={
              styles.emptyTitle
            }
          >
            No orders yet
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Your water orders will
            appear here.
          </Text>
        </View>
      ) : null}

      {orders.map((order) => {
        const total =
          getTotal(order);

        const status =
          getStatusLabel(
            order.status
          );

        const active =
          isActiveOrder(
            order.status
          );

        const eta =
          formatEta(order.eta);

        return (
          <View
            key={order.id}
            style={
              styles.orderCard
            }
          >
            <View
              style={
                styles.orderHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.orderCode
                  }
                >
                  {order.code ||
                    order.id}
                </Text>

                <Text
                  style={
                    styles.orderDate
                  }
                >
                  {formatDate(
                    order.createdAt
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  active
                    ? styles.activeBadge
                    : styles.completedBadge,
                ]}
              >
                <Text
                  style={
                    styles.statusText
                  }
                >
                  {status}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.orderInfo
              }
            >
              <Text
                style={
                  styles.infoText
                }
              >
                Quantity:{" "}
                {order.qty || 0}
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                Total: ₹
                {total.toFixed(2)}
              </Text>

              {order.riderName ? (
                <Text
                  style={
                    styles.infoText
                  }
                >
                  Delivery Partner:{" "}
                  {order.riderName}
                </Text>
              ) : null}

              {order.vehicleNumber ? (
                <Text
                  style={
                    styles.infoText
                  }
                >
                  Vehicle:{" "}
                  {order.vehicleNumber}
                </Text>
              ) : null}

              {eta ? (
                <Text
                  style={
                    styles.infoText
                  }
                >
                  ETA: {eta}
                </Text>
              ) : null}
            </View>

            <StatusTimeline
              order={order}
            />

            {onTrackOrder ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.trackButton
                }
                onPress={() =>
                  onTrackOrder(
                    order
                  )
                }
              >
                <Text
                  style={
                    styles.trackButtonText
                  }
                >
                  Track Order
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.muted,
    marginTop: 4,
  },

  errorCard: {
    backgroundColor: "#FDECEC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  errorText: {
    color: "#B42318",
    marginBottom: 12,
  },

  retryButton: {
    backgroundColor:
      COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },

  retryButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  emptyTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  emptyText: {
    color: COLORS.muted,
    marginTop: 6,
    textAlign: "center",
  },

  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  orderCode: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  orderDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  activeBadge: {
    backgroundColor: "#E8F5F8",
  },

  completedBadge: {
    backgroundColor: "#EAF7EF",
  },

  statusText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  orderInfo: {
    marginTop: 14,
  },

  infoText: {
    color: COLORS.primary,
    fontSize: 14,
    marginBottom: 5,
  },

  trackButton: {
    backgroundColor:
      COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 6,
  },

  trackButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});

