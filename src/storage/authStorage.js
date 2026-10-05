import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "@wow_auth_user";

export async function saveAuthUser(user) {
  await AsyncStorage.setItem(
    AUTH_KEY,
    JSON.stringify(user)
  );
}

export async function getAuthUser() {
  const value =
    await AsyncStorage.getItem(AUTH_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.log(
      "Failed to read saved auth user:",
      error
    );

    return null;
  }
}

export async function clearAuthUser() {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function isAuthenticated() {
  const user = await getAuthUser();

  return Boolean(user);
}