async function refreshApp() {
  const data = await window.apiGet("/bootstrap");
  window.renderHome(data);
  window.renderOrderScreen(data);
  window.renderTrack(data);
  await window.renderProfile();
  window.renderSupplier(data);
}

function setMode(mode) {
  document.getElementById("customerPhone").classList.toggle("hidden", mode !== "customer");
  document.getElementById("supplierDash").classList.toggle("active", mode === "supplier");
  document.getElementById("supplierDash").classList.toggle("hidden", mode !== "supplier");
  document.querySelectorAll(".mode-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
}

async function startApp() {
  try {
    await refreshApp();
  } catch (err) {
    window.showToast("API not running: " + err.message);
  }
}

window.refreshApp = refreshApp;
window.setMode = setMode;
window.addEventListener("DOMContentLoaded", startApp);
