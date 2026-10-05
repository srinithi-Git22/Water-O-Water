
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
  Linking,
} from "react-native";

import {
  COLORS,
  RADIUS,
  SPACING,
} from "../../styles/theme";

import {
  getOrder,
  getOrders,
} from "../../api/orderApi";

import {
  getAuthUser,
} from "../../storage/authStorage";

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

function getStatusText(status) {
  switch (status) {
    case "placed":
      return "Order placed";

    case "accepted":
      return "Order accepted";

    case "preparing":
      return "Preparing your order";

    case "ready":
      return "Order ready";

    case "out_for_delivery":
      return "Out for delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Order cancelled";

    default:
      return "Order placed";
  }
}

function isCompleted(status, step) {
  const statusOrder = [
    "placed",
    "accepted",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
  ];

  if (status === "cancelled") {
    return step === "placed";
  }

  const currentIndex =
    statusOrder.indexOf(status);

  const stepIndex =
    statusOrder.indexOf(step);

  if (currentIndex === -1) {
    return step === "placed";
  }

  return stepIndex <= currentIndex;
}

export default function TrackScreen({
  setScreen,
  data,
  confirmedOrder,
}) {
  const [order, setOrder] =
    useState(
      confirmedOrder || null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadOrder();
  }, [confirmedOrder]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      if (confirmedOrder?.id) {
        const latestOrder =
          await getOrder(
            confirmedOrder.id
          );

        setOrder(latestOrder);
        return;
      }

      const orders =
        await fetchOrders();

      if (
        Array.isArray(orders) &&
        orders.length > 0
      ) {
        setOrder(orders[0]);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.log(
        "Track order error:",
        err
      );

      setError(
        err?.message ||
          "Could not load order."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    const authUser =
      await getAuthUser();

    const customerId =
      authUser?.customerId ||
      authUser?.id ||
      data?.customer?.id ||
      null;

    if (!customerId) {
      return [];
    }

    return getOrders(
      customerId
    );
  }

  async function callDeliveryPartner() {
    if (!order?.riderPhone) {
      return;
    }

    try {
      await Linking.openURL(
        `tel:${order.riderPhone}`
      );
    } catch (err) {
      console.log(
        "Could not open phone dialer:",
        err
      );
    }
  }

  if (loading && !order) {
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
          Loading order...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View
        style={
          styles.emptyContainer
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
          No active order
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          {error ||
            "Place an order to see its delivery status here."}
        </Text>

        <TouchableOpacity
          style={
            styles.orderButton
          }
          onPress={() =>
            setScreen("order")
          }
        >
          <Text
            style={
              styles.orderButtonText
            }
          >
            Order Water
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const orderCode =
    order.code ||
    order.id ||
    "No order";

  const quantity =
    Number(order.qty || 0);

  const status =
    order.status || "placed";

  const eta =
    order.eta || null;

  const supplier =
    order.fulfillingSupplierId ||
    order.primarySupplierId ||
    "Supplier";

  const riderName =
    order.riderName || null;

  const riderPhone =
    order.riderPhone || null;

  const vehicleNumber =
    order.vehicleNumber || null;

  const hasDeliveryPartner =
    Boolean(
      riderName ||
        riderPhone ||
        vehicleNumber
    );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={
        styles.content
      }
    >
      <Text style={styles.title}>
        Track Order
      </Text>

      <Text style={styles.subtitle}>
        Order #{orderCode}
      </Text>

      <View
        style={styles.etaCard}
      >
        <Text
          style={styles.etaLabel}
        >
          Expected Delivery
        </Text>

        <Text style={styles.eta}>
          {formatEta(eta)}
        </Text>

        <Text
          style={
            styles.etaStatus
          }
        >
          {getStatusText(status)}
        </Text>
      </View>

      <View
        style={styles.orderCard}
      >
        <View
          style={styles.orderHeader}
        >
          <View>
            <Text
              style={
                styles.orderLabel
              }
            >
              Order Number
            </Text>

            <Text
              style={
                styles.orderCode
              }
            >
              #{orderCode}
            </Text>
          </View>

          <View
            style={
              styles.statusBadge
            }
          >
            <Text
              style={
                styles.statusBadgeText
              }
            >
              {status.replace(
                /_/g,
                " "
              )}
            </Text>
          </View>
        </View>

        <View
          style={styles.divider}
        />

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            Product
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {order.productId ||
              "Water"}
          </Text>
        </View>

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            Quantity
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {quantity}
          </Text>
        </View>

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            Supplier
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {supplier}
          </Text>
        </View>
      </View>

      {hasDeliveryPartner && (
        <>
          <Text
            style={styles.sectionTitle}
          >
            Delivery Partner
          </Text>

          <View
            style={
              styles.deliveryCard
            }
          >
            <View
              style={
                styles.deliveryAvatar
              }
            >
              <Text
                style={
                  styles.deliveryAvatarText
                }
              >
                {(riderName || "D")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View
              style={
                styles.deliveryDetails
              }
            >
              <Text
                style={
                  styles.deliveryName
                }
              >
                {riderName ||
                  "Delivery Partner"}
              </Text>

              <Text
                style={
                  styles.deliveryRole
                }
              >
                Delivery Partner
              </Text>

              {vehicleNumber && (
                <Text
                  style={
                    styles.vehicleText
                  }
                >
                  Bike · {vehicleNumber}
                </Text>
              )}
            </View>

            {riderPhone && (
              <TouchableOpacity
                style={
                  styles.callButton
                }
                onPress={
                  callDeliveryPartner
                }
              >
                <Text
                  style={
                    styles.callIcon
                  }
                >
                  📞
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <Text
        style={styles.sectionTitle}
      >
        Delivery status
      </Text>

      <View
        style={styles.timelineCard}
      >
        <TimelineItem
          title="Order placed"
          text="Your order has been received."
          active={isCompleted(
            status,
            "placed"
          )}
          last={false}
        />

        <TimelineItem
          title="Supplier confirmation"
          text="Supplier will accept and prepare your order."
          active={isCompleted(
            status,
            "accepted"
          )}
          last={false}
        />

        <TimelineItem
          title="Preparing"
          text="Your water order is being prepared."
          active={isCompleted(
            status,
            "preparing"
          )}
          last={false}
        />

        <TimelineItem
          title="Out for delivery"
          text="Your delivery partner will bring your order."
          active={isCompleted(
            status,
            "out_for_delivery"
          )}
          last={false}
        />

        <TimelineItem
          title="Delivered"
          text="Your water has been delivered."
          active={isCompleted(
            status,
            "delivered"
          )}
          last={true}
        />
      </View>

      {error ? (
        <Text
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : null}

     
      <TouchableOpacity
        style={
          styles.ordersButton
        }
        onPress={() =>
          setScreen("orders")
        }
      >
        <Text
          style={
            styles.ordersButtonText
          }
        >
          View All Orders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          styles.homeButton
        }
        onPress={() =>
          setScreen("home")
        }
      >
        <Text
          style={
            styles.homeButtonText
          }
        >
          Back to Home
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TimelineItem({
  title,
  text,
  active,
  last,
}) {
  return (
    <View
      style={styles.timelineItem}
    >
      <View
        style={styles.timelineLeft}
      >
        <View
          style={[
            styles.circle,
            active &&
              styles.activeCircle,
          ]}
        >
          {active && (
            <Text
              style={styles.check}
            >
              ✓
            </Text>
          )}
        </View>

        {!last && (
          <View
            style={[
              styles.line,
              active &&
                styles.activeLine,
            ]}
          />
        )}
      </View>

      <View
        style={
          styles.timelineContent
        }
      >
        <Text
          style={[
            styles.timelineTitle,
            active &&
              styles.activeTimelineTitle,
          ]}
        >
          {title}
        </Text>

        <Text
          style={
            styles.timelineText
          }
        >
          {text}
        </Text>
      </View>
    </View>
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

  title: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 18,
  },

  etaCard: {
    backgroundColor:
      COLORS.lightBlue,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 15,
  },

  etaLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  eta: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 7,
  },

  etaStatus: {
    color:
      COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },

  orderCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 18,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
  },

  orderLabel: {
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

  statusBadge: {
    backgroundColor:
      COLORS.lightGreen,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusBadgeText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 8,
  },

  infoLabel: {
    color:
      COLORS.textSecondary,
    fontSize: 14,
  },

  infoValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  sectionTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 10,
  },

  deliveryCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  deliveryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryAvatarText: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: "700",
  },

  deliveryDetails: {
    flex: 1,
    marginLeft: 12,
  },

  deliveryName: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  deliveryRole: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  vehicleText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      COLORS.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },

  callIcon: {
    fontSize: 19,
  },

  timelineCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 18,
  },

  timelineItem: {
    flexDirection: "row",
    minHeight: 72,
  },

  timelineLeft: {
    width: 32,
    alignItems: "center",
  },

  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.white,
  },

  activeCircle: {
    backgroundColor:
      COLORS.primary,
    borderColor:
      COLORS.primary,
  },

  check: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 3,
  },

  activeLine: {
    backgroundColor:
      COLORS.primary,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 15,
  },

  timelineTitle: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
  },

  activeTimelineTitle: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  timelineText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

 

  ordersButton: {
    backgroundColor:
      COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },

  ordersButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  homeButton: {
    alignItems: "center",
    paddingVertical: 15,
  },

  homeButtonText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
  },

  errorText: {
    color:
      COLORS.error || "#B00020",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    color:
      COLORS.textSecondary,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    color:
      COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },

  orderButton: {
    backgroundColor:
      COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 13,
    marginTop: 20,
  },

  orderButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});


