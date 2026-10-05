
import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  COLORS,
  SPACING,
  RADIUS,
} from "../../styles/theme";

import { createOrder } from "../../api/index";

export default function OrderScreen({
  quantities = {},
  changeQuantity,
  setScreen,
  data,
  setConfirmedOrder,
  products = [],
}) {
  const [orderType, setOrderType] =
    useState("one-time");

  const [frequency, setFrequency] =
    useState("weekly");

  const [selectedDays, setSelectedDays] =
    useState([2, 5]);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const days = [
    { id: 1, name: "Mon" },
    { id: 2, name: "Tue" },
    { id: 3, name: "Wed" },
    { id: 4, name: "Thu" },
    { id: 5, name: "Fri" },
    { id: 6, name: "Sat" },
    { id: 7, name: "Sun" },
  ];

  const frequencies = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "weekdays", label: "Weekdays" },
    { id: "weekends", label: "Weekends" },
    { id: "2-days", label: "2 days/week" },
    { id: "3-days", label: "3 days/week" },
    { id: "custom", label: "Custom" },
  ];

  const selectedProducts = products.filter(
    (product) =>
      Number(quantities[product.id] || 0) > 0
  );

  const totalItems = selectedProducts.reduce(
    (total, product) =>
      total +
      Number(quantities[product.id] || 0),
    0
  );

  const totalPrice = selectedProducts.reduce(
    (total, product) =>
      total +
      Number(quantities[product.id] || 0) *
        Number(product.price || 0),
    0
  );

  function getProductIcon(product, index) {
    const sku =
      String(product?.sku || "").toLowerCase();

    const name =
      String(
        product?.nameEn ||
          product?.name ||
          ""
      ).toLowerCase();

    if (
      sku.includes("can20") ||
      name.includes("20l")
    ) {
      return "🪣";
    }

    if (
      name.includes("2l") ||
      sku.includes("pack2")
    ) {
      return "🍶";
    }

    if (name.includes("9l")) {
      return "🥤";
    }

    if (index === 0) {
      return "🪣";
    }

    return "💧";
  }

  function getProductName(product) {
    if (
      product?.nameEn &&
      product.nameEn !== "Water"
    ) {
      return product.nameEn;
    }

    if (product?.name) {
      return product.name;
    }

    return "Water";
  }

  function getProductDescription(product) {
    if (product?.serviceType === "exchange") {
      return "empty can picked up";
    }

    return product?.nameTa || "Water delivery";
  }

  function getSupplierId(product) {
    return product?.supplierId || null;
  }

  function getSelectedSupplierId() {
    const firstSelected =
      selectedProducts[0];

    return getSupplierId(firstSelected);
  }

  function canSelectProduct(product) {
    if (selectedProducts.length === 0) {
      return true;
    }

    const selectedSupplier =
      getSelectedSupplierId();

    return (
      getSupplierId(product) ===
      selectedSupplier
    );
  }

  function handleQuantityChange(
    product,
    amount
  ) {
    const currentQuantity =
      Number(
        quantities[product.id] || 0
      );

    if (
      amount > 0 &&
      currentQuantity === 0 &&
      !canSelectProduct(product)
    ) {
      Alert.alert(
        "Different supplier",
        "Products from different suppliers cannot be placed in the same order. Please place them as separate orders."
      );

      return;
    }

    changeQuantity(
      product.id,
      amount
    );
  }

  function selectFrequency(id) {
    setFrequency(id);

    if (id === "daily") {
      setSelectedDays([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
      ]);
    } else if (id === "weekly") {
      setSelectedDays([2]);
    } else if (id === "weekdays") {
      setSelectedDays([
        1,
        2,
        3,
        4,
        5,
      ]);
    } else if (id === "weekends") {
      setSelectedDays([6, 7]);
    } else if (id === "2-days") {
      setSelectedDays([2, 5]);
    } else if (id === "3-days") {
      setSelectedDays([2, 4, 6]);
    } else if (id === "custom") {
      setSelectedDays([]);
    }
  }

  function toggleDay(dayId) {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(
        selectedDays.filter(
          (day) => day !== dayId
        )
      );
    } else {
      setSelectedDays(
        [...selectedDays, dayId].sort(
          (a, b) => a - b
        )
      );
    }

    setFrequency("custom");
  }

  function getScheduleText() {
    if (orderType === "one-time") {
      return "One-time delivery";
    }

    if (frequency === "daily") {
      return "Every day";
    }

    if (frequency === "weekly") {
      return "Every week";
    }

    if (frequency === "weekdays") {
      return "Monday to Friday";
    }

    if (frequency === "weekends") {
      return "Saturday and Sunday";
    }

    if (frequency === "2-days") {
      return "2 days every week";
    }

    if (frequency === "3-days") {
      return "3 days every week";
    }

    return `${selectedDays.length} custom days`;
  }

  async function confirmOrder() {
    if (totalItems === 0) {
      Alert.alert(
        "Add products",
        "Please select at least one product."
      );
      return;
    }

    if (
      orderType === "recurring" &&
      selectedDays.length === 0
    ) {
      Alert.alert(
        "Select days",
        "Please select at least one delivery day."
      );
      return;
    }

    if (placingOrder) {
      return;
    }

    const customerId =
      data?.customer?.id;

    const householdId =
      data?.customer?.householdId ||
      data?.customer?.household_id;

    const addressId =
      data?.address?.id;

    if (!customerId) {
      Alert.alert(
        "Customer error",
        "Customer information is not available. Please login again."
      );
      return;
    }

    if (!householdId) {
      Alert.alert(
        "Household error",
        "Household information is not available."
      );
      return;
    }

    if (!addressId) {
      Alert.alert(
        "Address error",
        "Delivery address is not available."
      );
      return;
    }

    const selectedItems =
      selectedProducts.map(
        (product) => ({
          productId: product.id,
          qty: Number(
            quantities[product.id] || 0
          ),
        })
      );

    const validItems =
      selectedItems.filter(
        (item) => item.qty > 0
      );

    if (validItems.length === 0) {
      Alert.alert(
        "Add products",
        "Please select at least one product."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const orderData = {
        customerId,
        householdId,
        addressId,
        items: validItems,
        orderType,
        frequency:
          orderType === "recurring"
            ? frequency
            : null,
        deliveryDays:
          orderType === "recurring"
            ? selectedDays
            : [],
        source: "customer-app",
        actorType: "customer",
      };

      const createdOrder =
        await createOrder(orderData);

      if (setConfirmedOrder) {
        setConfirmedOrder(
          createdOrder
        );
      }

      setScreen("confirmed");
    } catch (error) {
      console.log(
        "Create order error:",
        error
      );

      Alert.alert(
        "Order failed",
        error?.message ||
          "Could not place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.title}>
          Order Water
        </Text>

        <Text style={styles.subtitle}>
          Choose your water products
        </Text>

        {products.map(
          (product, index) => {
            const quantity =
              Number(
                quantities[
                  product.id
                ] || 0
              );

            const selected =
              quantity > 0;

            const available =
              canSelectProduct(
                product
              );

            return (
              <View
                key={product.id}
                style={[
                  styles.productCard,
                  selected &&
                    styles.selectedProductCard,
                  !available &&
                    styles.unavailableProductCard,
                ]}
              >
                <View
                  style={
                    styles.productTop
                  }
                >
                  <View
                    style={
                      styles.iconCircle
                    }
                  >
                    <Text
                      style={
                        styles.productIcon
                      }
                    >
                      {getProductIcon(
                        product,
                        index
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.productInfo
                    }
                  >
                    <Text
                      style={
                        styles.productName
                      }
                    >
                      {getProductName(
                        product
                      )}
                    </Text>

                    <Text
                      style={
                        styles.productPrice
                      }
                    >
                      ₹
                      {Number(
                        product.price ||
                          0
                      ).toFixed(0)}
                      {" · "}
                      {getProductDescription(
                        product
                      )}
                    </Text>

                    <Text
                      style={
                        styles.supplierText
                      }
                    >
                      {product.supplierId}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.quantityRow
                  }
                >
                  <Text
                    style={
                      styles.quantityLabel
                    }
                  >
                    Quantity
                  </Text>

                  <View
                    style={
                      styles.quantityControls
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.quantityButton
                      }
                      onPress={() =>
                        handleQuantityChange(
                          product,
                          -1
                        )
                      }
                      disabled={
                        quantity ===
                        0
                      }
                    >
                      <Text
                        style={[
                          styles.quantityButtonText,
                          quantity ===
                            0 &&
                            styles.disabledQuantityText,
                        ]}
                      >
                        −
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={
                        styles.quantity
                      }
                    >
                      {quantity}
                    </Text>

                    <TouchableOpacity
                      style={
                        styles.quantityButton
                      }
                      onPress={() =>
                        handleQuantityChange(
                          product,
                          1
                        )
                      }
                    >
                      <Text
                        style={
                          styles.quantityButtonText
                        }
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {!available &&
                  quantity ===
                    0 && (
                    <Text
                      style={
                        styles.unavailableText
                      }
                    >
                      Different supplier —
                      place separately
                    </Text>
                  )}
              </View>
            );
          }
        )}

        <View
          style={
            styles.bulkCard
          }
        >
          <View
            style={
              styles.bulkIconCircle
            }
          >
            <Text
              style={
                styles.bulkIcon
              }
            >
              🎪
            </Text>
          </View>

          <View
            style={
              styles.bulkInfo
            }
          >
            <Text
              style={
                styles.bulkTitle
              }
            >
              Bulk order
            </Text>

            <Text
              style={
                styles.bulkSubtitle
              }
            >
              Events / halls
            </Text>

            <Text
              style={
                styles.bulkDescription
              }
            >
              Custom quote for 50+ cans
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.askButton
            }
            onPress={() =>
              Alert.alert(
                "Bulk order",
                "Bulk ordering will be connected to the backend in a later phase."
              )
            }
          >
            <Text
              style={
                styles.askButtonText
              }
            >
              Ask
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Delivery type
        </Text>

        <View
          style={
            styles.typeContainer
          }
        >
          <TouchableOpacity
            style={[
              styles.typeButton,
              orderType ===
                "one-time" &&
                styles.selectedType,
            ]}
            onPress={() =>
              setOrderType(
                "one-time"
              )
            }
          >
            <Text
              style={[
                styles.typeText,
                orderType ===
                  "one-time" &&
                  styles.selectedText,
              ]}
            >
              One-time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              orderType ===
                "recurring" &&
                styles.selectedType,
            ]}
            onPress={() =>
              setOrderType(
                "recurring"
              )
            }
          >
            <Text
              style={[
                styles.typeText,
                orderType ===
                  "recurring" &&
                  styles.selectedText,
              ]}
            >
              Recurring
            </Text>
          </TouchableOpacity>
        </View>

        {orderType ===
          "recurring" && (
          <>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Delivery frequency
            </Text>

            <View
              style={
                styles.frequencyContainer
              }
            >
              {frequencies.map(
                (item) => {
                  const selected =
                    frequency ===
                    item.id;

                  return (
                    <TouchableOpacity
                      key={
                        item.id
                      }
                      style={[
                        styles.frequencyButton,
                        selected &&
                          styles.selectedFrequency,
                      ]}
                      onPress={() =>
                        selectFrequency(
                          item.id
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          selected &&
                            styles.selectedFrequencyText,
                        ]}
                      >
                        {
                          item.label
                        }
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Select delivery days
            </Text>

            <View
              style={
                styles.daysContainer
              }
            >
              {days.map(
                (day) => {
                  const selected =
                    selectedDays.includes(
                      day.id
                    );

                  return (
                    <TouchableOpacity
                      key={
                        day.id
                      }
                      style={[
                        styles.dayButton,
                        selected &&
                          styles.selectedDay,
                      ]}
                      onPress={() =>
                        toggleDay(
                          day.id
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selected &&
                            styles.selectedDayText,
                        ]}
                      >
                        {
                          day.name
                        }
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </>
        )}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>

      <View
        style={
          styles.checkoutBar
        }
      >
        <View>
          <Text
            style={
              styles.checkoutItems
            }
          >
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}{" "}
            · ₹
            {totalPrice.toFixed(0)}
          </Text>

          <Text
            style={
              styles.checkoutDelivery
            }
          >
            {getScheduleText()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (placingOrder ||
              totalItems ===
                0) &&
              styles.disabledButton,
          ]}
          onPress={
            confirmOrder
          }
          disabled={
            placingOrder ||
            totalItems === 0
          }
        >
          {placingOrder ? (
            <ActivityIndicator
              color={
                COLORS.white
              }
            />
          ) : (
            <Text
              style={
                styles.checkoutText
              }
            >
              Checkout →
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: SPACING.md,
    paddingBottom: 120,
  },

  title: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 5,
    marginBottom: 18,
  },

  productCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  selectedProductCard: {
    borderColor:
      COLORS.secondary,
  },

  unavailableProductCard: {
    opacity: 0.55,
  },

  productTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor:
      COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  productIcon: {
    fontSize: 27,
  },

  productInfo: {
    flex: 1,
    marginLeft: 13,
  },

  productName: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  productPrice: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },

  supplierText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginTop: 15,
  },

  quantityLabel: {
    color:
      COLORS.textSecondary,
    fontSize: 13,
  },

  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 24,
  },

  disabledQuantityText: {
    color: COLORS.muted,
  },

  quantity: {
    minWidth: 20,
    textAlign: "center",
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  unavailableText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 8,
  },

  bulkCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  bulkIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  bulkIcon: {
    fontSize: 24,
  },

  bulkInfo: {
    flex: 1,
    marginLeft: 12,
  },

  bulkTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  bulkSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  bulkDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  askButton: {
    borderWidth: 1,
    borderColor:
      COLORS.secondary,
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  askButtonText: {
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: 12,
  },

  sectionTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },

  typeContainer: {
    flexDirection: "row",
    backgroundColor:
      COLORS.white,
    borderRadius:
      RADIUS.md,
    padding: 4,
  },

  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 9,
  },

  selectedType: {
    backgroundColor:
      COLORS.primary,
  },

  typeText: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  selectedText: {
    color: COLORS.white,
  },

  frequencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  frequencyButton: {
    backgroundColor:
      COLORS.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  selectedFrequency: {
    backgroundColor:
      COLORS.lightBlue,
    borderColor:
      COLORS.secondary,
  },

  frequencyText: {
    color:
      COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  selectedFrequencyText: {
    color:
      COLORS.secondary,
  },

  daysContainer: {
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  selectedDay: {
    backgroundColor:
      COLORS.primary,
    borderColor:
      COLORS.primary,
  },

  dayText: {
    color:
      COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  selectedDayText: {
    color: COLORS.white,
  },

  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      COLORS.white,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  checkoutItems: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  checkoutDelivery: {
    color:
      COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  checkoutButton: {
    backgroundColor:
      COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 13,
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
  },

  checkoutText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.55,
  },

  bottomSpace: {
    height: 20,
  },
});

