
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function HomeScreen({
  quantities = {},
  changeQuantity,
  setScreen,
  data,
  products = [],
}) {
  const customer = data?.customer || null;
  const address = data?.address || null;
  const orders = Array.isArray(data?.orders) ? data.orders : [];

  const customerName = customer?.name || "Customer";

  const firstLetter =
    customerName.length > 0
      ? customerName.charAt(0).toUpperCase()
      : "C";

  const addressText =
    address?.line ||
    [
      address?.house,
      address?.street,
      address?.city,
      address?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

  const latestOrder = orders.length > 0 ? orders[0] : null;

  const hasActiveOrder =
    latestOrder &&
    !["delivered", "cancelled", "rejected"].includes(
      String(latestOrder.status || "").toLowerCase()
    );

  function formatStatus(status) {
    if (!status) {
      return "";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  /*
   * Quick Order uses only the first two real API products.
   */
  const quickProducts = products.slice(0, 2);

  /*
   * Product name comes directly from the real API product.
   */
  function getProductName(product) {
    return (
      product?.nameEn ||
      product?.name ||
      product?.nameTa ||
      "Water"
    );
  }

  /*
   * Product unit is based on the real product data.
   */
  function getProductUnit(product) {
    const sku = String(product?.sku || "").toLowerCase();
    const name = String(
      product?.nameEn ||
        product?.name ||
        ""
    ).toLowerCase();

    if (
      sku.includes("pack") ||
      name.includes("pack")
    ) {
      return "pack";
    }

    if (
      name.includes("can") ||
      name.includes("20l") ||
      name.includes("9l") ||
      name.includes("2l")
    ) {
      return "can";
    }

    return "unit";
  }

  function getProductIcon(product, index) {
    const name = String(
      product?.nameEn ||
        product?.name ||
        ""
    ).toLowerCase();

    if (
      name.includes("can") ||
      name.includes("20l") ||
      name.includes("9l") ||
      name.includes("2l")
    ) {
      return "🪣";
    }

    return index === 0 ? "🪣" : "🍶";
  }

  function getProductPrice(product) {
    /*
     * Price is taken from the API.
     */
    if (product?.unitPricePaise !== undefined) {
      return Number(product.unitPricePaise) / 100;
    }

    if (product?.price !== undefined) {
      return Number(product.price);
    }

    return 0;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text
              style={styles.greeting}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Hi, {customerName} 👋
            </Text>

            <Text
              style={styles.location}
              numberOfLines={2}
            >
              📍 {addressText || "No delivery address"}
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstLetter}
            </Text>
          </View>
        </View>

        {/* WATER STATUS */}

        <View style={styles.heroCard}>
          <View style={styles.heroCircle}>
            <View style={styles.circleInner}>
              <Text style={styles.circleNumber}>
                {latestOrder?.qty || "2"}
              </Text>

              <Text style={styles.circleLabel}>
                CANS LEFT
              </Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Your water usually runs out in 2 days
            </Text>

            <Text style={styles.heroDescription}>
              Based on your recent orders.
            </Text>

            <Text style={styles.heroDescription}>
              Reorder now so you're never dry.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.reorderButton}
              onPress={() => setScreen("order")}
            >
              <Text style={styles.reorderButtonText}>
                Reorder now
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTIVE ORDER */}

        <View style={styles.activeOrderCard}>
          <View style={styles.activeOrderDot} />

          <View style={styles.activeOrderContent}>
            <Text style={styles.activeOrderTitle}>
              {hasActiveOrder
                ? `Order ${formatStatus(
                    latestOrder?.status || "active"
                  )}`
                : "No active order"}
            </Text>

            {hasActiveOrder ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setScreen("track")}
              >
                <Text style={styles.activeOrderDescription}>
                  {latestOrder?.eta
                    ? `Arriving ${latestOrder.eta}`
                    : "Order is being processed"}{" "}
                  · Tap Track to follow along
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.activeOrderDescription}>
                You have no active order right now.
              </Text>
            )}
          </View>
        </View>

        {/* QUICK ORDER */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Quick order
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setScreen("order")}
          >
            <Text style={styles.seeAll}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsRow}>
          {quickProducts.map((product, index) => {
            const quantity =
              quantities[product.id] || 0;

            const productName =
              getProductName(product);

            const productUnit =
              getProductUnit(product);

            const productIcon =
              getProductIcon(product, index);

            const productPrice =
              getProductPrice(product);

            return (
              <View
                key={product.id}
                style={styles.productCard}
              >
                {/* PRODUCT ICON */}

                <View style={styles.productImage}>
                  <Text style={styles.productEmoji}>
                    {productIcon}
                  </Text>
                </View>

                {/* REAL PRODUCT NAME */}

                <Text
                  style={styles.productName}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {productName}
                </Text>

                {/* REAL API PRICE */}

                <Text style={styles.productPrice}>
                  ₹{productPrice} / {productUnit}
                </Text>

                {/* QUANTITY */}

                <View style={styles.quantityBar}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.quantityButton}
                    onPress={() =>
                      changeQuantity &&
                      changeQuantity(
                        product.id,
                        -1
                      )
                    }
                  >
                    <Text style={styles.quantityButtonText}>
                      −
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>
                    {quantity}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.quantityButton}
                    onPress={() =>
                      changeQuantity &&
                      changeQuantity(
                        product.id,
                        1
                      )
                    }
                  >
                    <Text style={styles.quantityButtonText}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {Object.values(quantities).some(
          (quantity) => quantity > 0
        ) && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.continueOrderButton}
            onPress={() => setScreen("order")}
          >
            <Text style={styles.continueOrderButtonText}>
              Continue to Order
            </Text>
          </TouchableOpacity>
        )}

        {quickProducts.length === 0 && (
          <View style={styles.emptyProducts}>
            <Text style={styles.emptyProductsText}>
              No products available.
            </Text>
          </View>
        )}

        {/* MONTHLY REFILL */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.refillCard}
          onPress={() => setScreen("order")}
        >
          <View style={styles.refillTextContainer}>
            <Text style={styles.refillTitle}>
              Never run out — Monthly Refill Plan
            </Text>

            <Text style={styles.refillDescription}>
              Choose your regular water delivery from available products.
            </Text>
          </View>

          <View style={styles.refillButton}>
            <Text style={styles.refillButtonText}>
              View
            </Text>
          </View>
        </TouchableOpacity>

        {/* LATEST ORDER */}

        {latestOrder && (
          <View style={styles.orderDetailsCard}>
            <Text style={styles.orderDetailsTitle}>
              Latest order
            </Text>

            <Text style={styles.orderDetailsText}>
              Order:{" "}
              {latestOrder.code || latestOrder.id}
            </Text>

            {latestOrder.status && (
              <Text style={styles.orderDetailsText}>
                Status:{" "}
                {formatStatus(latestOrder.status)}
              </Text>
            )}

            {latestOrder.riderName && (
              <Text style={styles.orderDetailsText}>
                Rider: {latestOrder.riderName}
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setScreen("track")}
            >
              <Text style={styles.trackLink}>
                Track order →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F9FB",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
    marginBottom: 14,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    color: "#073E52",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },

  location: {
    color: "#6F7E86",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E1F3F8",
    borderWidth: 1,
    borderColor: "#C8E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#0B6480",
    fontSize: 16,
    fontWeight: "800",
  },

  /* WATER STATUS */

  heroCard: {
    minHeight: 199,
    backgroundColor: "#0E708E",
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  heroCircle: {
    width: 91,
    height: 91,
    borderRadius: 46,
    borderWidth: 8,
    borderColor: "#D9F1F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  circleInner: {
    alignItems: "center",
    justifyContent: "center",
  },

  circleNumber: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 27,
  },

  circleLabel: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 1,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    marginBottom: 4,
  },

  heroDescription: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.95,
  },

  reorderButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 11,
  },

  reorderButtonText: {
    color: "#073E52",
    fontSize: 13,
    fontWeight: "800",
  },

  /* ACTIVE ORDER */

  activeOrderCard: {
    minHeight: 89,
    backgroundColor: "#E6F7EF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#C9ECDC",
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    marginBottom: 22,
  },

  activeOrderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2BA86B",
    marginTop: 8,
    marginRight: 10,
  },

  activeOrderContent: {
    flex: 1,
  },

  activeOrderTitle: {
    color: "#0B7150",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },

  activeOrderDescription: {
    color: "#37715F",
    fontSize: 13,
    lineHeight: 18,
  },

  /* QUICK ORDER */

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#073E52",
    fontSize: 18,
    fontWeight: "800",
  },

  seeAll: {
    color: "#0074A0",
    fontSize: 12,
    fontWeight: "700",
  },

  productsRow: {
    flexDirection: "row",
    gap: 12,
  },

  productCard: {
    flex: 1,
    height: 154,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  productImage: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  productEmoji: {
    fontSize: 27,
  },

  productName: {
    color: "#0A3545",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 5,
  },

  productPrice: {
    color: "#687982",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 11,
  },

  /* MEDIUM QUANTITY CONTROL */

  quantityBar: {
    width: 120,
    height: 29,
    alignSelf: "center",
    borderRadius: 8,
    backgroundColor: "#E3F2F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  quantityButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#08637F",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 17,
    fontWeight: "700",
  },

  quantityText: {
    color: "#073E52",
    fontSize: 13,
    fontWeight: "700",
  },

  continueOrderButton: {
    height: 38,
    backgroundColor: "#08637F",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  continueOrderButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
  },

  emptyProducts: {
    minHeight: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyProductsText: {
    color: "#71808A",
    fontSize: 13,
  },

  /* MONTHLY REFILL */

  refillCard: {
    minHeight: 104,
    backgroundColor: "#073E52",
    borderRadius: 18,
    paddingHorizontal: 17,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
  },

  refillTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  refillTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
  },

  refillDescription: {
    color: "#D7E9EF",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  refillButton: {
    minWidth: 69,
    height: 41,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  refillButtonText: {
    color: "#073E52",
    fontSize: 13,
    fontWeight: "800",
  },

  /* LATEST ORDER */

  orderDetailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 17,
    marginTop: 17,
  },

  orderDetailsTitle: {
    color: "#073E52",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  orderDetailsText: {
    color: "#687982",
    fontSize: 13,
    marginTop: 5,
  },

  trackLink: {
    color: "#0074A0",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 11,
  },
});

