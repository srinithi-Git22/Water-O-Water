
import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

import {
  COLORS,
} from "../../styles/theme";

import {
  updateCustomerProfile,
  updateHomeAddress,
} from "../../api/customerApi";

export default function ProfileScreen({
  data,
  setScreen,
  onLogout,
  onProfileUpdated,
}) {
  const customer =
    data?.customer || {};

  const address =
    data?.address || {};

  const orders =
    Array.isArray(data?.orders)
      ? data.orders
      : [];

  const [pickupEnabled, setPickupEnabled] =
    useState(true);

  const [editVisible, setEditVisible] =
    useState(false);

  const [
    addressEditVisible,
    setAddressEditVisible,
  ] = useState(false);

  const [name, setName] =
    useState(customer.name || "");

  const [addressLine, setAddressLine] =
    useState(
      address.line ||
        address.address ||
        ""
    );

  const [saving, setSaving] =
    useState(false);

  const [
    savingAddress,
    setSavingAddress,
  ] = useState(false);

  const [displayName, setDisplayName] =
    useState(customer.name || "");

  const [
    displayAddress,
    setDisplayAddress,
  ] = useState(
    address.line ||
      address.address ||
      ""
  );

  const customerPhone =
    customer.phone ||
    "Phone number not available";

  const homeAddress =
    displayAddress ||
    "Address not available";

  const orderCount =
    orders.length;

  async function handleSaveName() {
    const trimmedName =
      name.trim();

    if (!trimmedName) {
      Alert.alert(
        "Invalid Name",
        "Please enter your name."
      );

      return;
    }

    if (!customer.id) {
      Alert.alert(
        "Error",
        "Customer information is not available."
      );

      return;
    }

    try {
      setSaving(true);

      const updatedCustomer =
        await updateCustomerProfile(
          customer.id,
          {
            name: trimmedName,
          }
        );

      const newName =
        updatedCustomer?.name ||
        trimmedName;

      /*
       * Update local screen immediately.
       */
      setDisplayName(newName);
      setName(newName);

      setEditVisible(false);

      /*
       * Refresh the parent App state
       * from the real backend/database.
       */
      if (onProfileUpdated) {
        await onProfileUpdated();
      }

      Alert.alert(
        "Profile Updated",
        "Your name has been updated successfully."
      );
    } catch (error) {
      console.log(
        "Profile update error:",
        error
      );

      Alert.alert(
        "Update Failed",
        error.message ||
          "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAddress() {
    const trimmedAddress =
      addressLine.trim();

    if (!trimmedAddress) {
      Alert.alert(
        "Invalid Address",
        "Please enter your home address."
      );

      return;
    }

    if (!customer.id) {
      Alert.alert(
        "Error",
        "Customer information is not available."
      );

      return;
    }

    try {
      setSavingAddress(true);

      const updatedAddress =
        await updateHomeAddress(
          customer.id,
          {
            line: trimmedAddress,
          }
        );

      const newAddress =
        updatedAddress?.line ||
        trimmedAddress;

      /*
       * Update local screen immediately.
       */
      setDisplayAddress(newAddress);
      setAddressLine(newAddress);

      setAddressEditVisible(false);

      /*
       * Refresh the parent App state
       * from the real backend/database.
       */
      if (onProfileUpdated) {
        await onProfileUpdated();
      }

      Alert.alert(
        "Address Updated",
        "Your home address has been updated successfully."
      );
    } catch (error) {
      console.log(
        "Address update error:",
        error
      );

      Alert.alert(
        "Update Failed",
        error.message ||
          "Could not update your home address."
      );
    } finally {
      setSavingAddress(false);
    }
  }

async function handleLogout() {
  if (onLogout) {
    await onLogout();
  }
}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Profile
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.customerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.customerInfo}>
            <Text
              style={styles.customerName}
            >
              {displayName || "Customer"}
            </Text>

            <Text
              style={styles.customerPhone}
            >
              {customerPhone}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editButton}
            onPress={() => {
              setName(displayName);
              setEditVisible(true);
            }}
          >
            <Text
              style={styles.editButtonText}
            >
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>
            Monthly Refill Plan
          </Text>

          <Text
            style={styles.planSubtitle}
          >
            Manage your regular water
            deliveries
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.manageButton}
            onPress={() =>
              Alert.alert(
                "Monthly Refill Plan",
                "Plan management will be available soon."
              )
            }
          >
            <Text
              style={
                styles.manageButtonText
              }
            >
              Manage plan
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settings}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row}
            onPress={() => {
              setAddressLine(
                displayAddress
              );

              setAddressEditVisible(
                true
              );
            }}
          >
            <View
              style={styles.iconTile}
            >
              <Text
                style={styles.icon}
              >
                🏠
              </Text>
            </View>

            <View
              style={styles.rowText}
            >
              <Text
                style={styles.rowTitle}
                numberOfLines={2}
              >
                Home — {homeAddress}
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                Default delivery address
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row}
            onPress={() =>
              Alert.alert(
                "Office Address",
                "Office address management will be available soon."
              )
            }
          >
            <View
              style={styles.iconTile}
            >
              <Text
                style={styles.icon}
              >
                🏢
              </Text>
            </View>

            <View
              style={styles.rowText}
            >
              <Text
                style={styles.rowTitle}
              >
                Office Address
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                Add an office delivery address
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <View
              style={styles.iconTile}
            >
              <Text
                style={styles.icon}
              >
                ♻️
              </Text>
            </View>

            <View
              style={styles.rowText}
            >
              <Text
                style={styles.rowTitle}
              >
                Empty can pickup
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                Notify supplier automatically
              </Text>
            </View>

            <Switch
              value={pickupEnabled}
              onValueChange={
                setPickupEnabled
              }
              trackColor={{
                false: "#D6E2E7",
                true: COLORS.success,
              }}
              thumbColor={
                COLORS.white
              }
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row}
            onPress={() =>
              setScreen &&
              setScreen("orders")
            }
          >
            <View
              style={styles.iconTile}
            >
              <Text
                style={styles.icon}
              >
                🧾
              </Text>
            </View>

            <View
              style={styles.rowText}
            >
              <Text
                style={styles.rowTitle}
              >
                Order history
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                {orderCount}{" "}
                {orderCount === 1
                  ? "order"
                  : "orders"}
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row}
            onPress={() =>
              Alert.alert(
                "Payments",
                "Payment methods will be available soon."
              )
            }
          >
            <View
              style={styles.iconTile}
            >
              <Text
                style={styles.icon}
              >
                💳
              </Text>
            </View>

            <View
              style={styles.rowText}
            >
              <Text
                style={styles.rowTitle}
              >
                Payments
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                Manage payment methods
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountSection}>
          <Text
            style={styles.sectionTitle}
          >
            Account
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text
              style={styles.logoutText}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}

      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          !saving &&
          setEditVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text
              style={styles.modalTitle}
            >
              Edit Profile
            </Text>

            <Text
              style={styles.inputLabel}
            >
              Name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#8A9AA2"
              style={styles.input}
              editable={!saving}
              autoCapitalize="words"
            />

            <View
              style={styles.modalActions}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.cancelButton
                }
                disabled={saving}
                onPress={() =>
                  setEditVisible(false)
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.saveButton
                }
                disabled={saving}
                onPress={
                  handleSaveName
                }
              >
                {saving ? (
                  <ActivityIndicator
                    color={
                      COLORS.white
                    }
                  />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT HOME ADDRESS MODAL */}

      <Modal
        visible={addressEditVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          !savingAddress &&
          setAddressEditVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text
              style={styles.modalTitle}
            >
              Edit Home Address
            </Text>

            <Text
              style={styles.inputLabel}
            >
              Home Address
            </Text>

            <TextInput
              value={addressLine}
              onChangeText={
                setAddressLine
              }
              placeholder="Enter your home address"
              placeholderTextColor="#8A9AA2"
              style={[
                styles.input,
                styles.addressInput,
              ]}
              editable={!savingAddress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View
              style={styles.modalActions}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.cancelButton
                }
                disabled={
                  savingAddress
                }
                onPress={() =>
                  setAddressEditVisible(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.saveButton
                }
                disabled={
                  savingAddress
                }
                onPress={
                  handleSaveAddress
                }
              >
                {savingAddress ? (
                  <ActivityIndicator
                    color={
                      COLORS.white
                    }
                  />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#F2F7FA",
  },

  header: {
    backgroundColor:
      COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  headerTitle: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "700",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingTop: 16,
    paddingBottom: 40,
  },

  customerCard: {
    marginHorizontal: 20,
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor:
      "#E3F3F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "700",
  },

  customerInfo: {
    flex: 1,
  },

  customerName: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  customerPhone: {
    color:
      COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  editButton: {
    borderWidth: 1,
    borderColor:
      COLORS.primary,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  editButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  planCard: {
    marginHorizontal: 20,
    backgroundColor:
      "#0B3B4F",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  planTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },

  planSubtitle: {
    color:
      "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 7,
  },

  manageButton: {
    alignSelf: "flex-start",
    backgroundColor:
      COLORS.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 16,
  },

  manageButtonText: {
    color: "#0B3B4F",
    fontSize: 13,
    fontWeight: "700",
  },

  settings: {
    marginHorizontal: 20,
  },

  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
    paddingVertical: 10,
  },

  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      "#E3F3F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  icon: {
    fontSize: 20,
  },

  rowText: {
    flex: 1,
  },

  rowTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  rowSubtitle: {
    color:
      COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color:
      COLORS.textSecondary,
    fontSize: 25,
    marginLeft: 8,
  },

  accountSection: {
    marginHorizontal: 20,
    marginTop: 25,
  },

  sectionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  logoutButton: {
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor: "#D94A4A",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  logoutText: {
    color: "#D94A4A",
    fontSize: 14,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  inputLabel: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.primary,
    fontSize: 15,
  },

  addressInput: {
    minHeight: 100,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 18,
    marginRight: 10,
  },

  cancelButtonText: {
    color:
      COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor:
      COLORS.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 22,
    minWidth: 75,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
