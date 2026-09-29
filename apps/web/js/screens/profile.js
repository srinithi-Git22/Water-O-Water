async function renderProfile() {
  const bal = await window.apiGet("/balances/hh-ayesha");
  document.getElementById("profile-balance").textContent =
    "Due " + window.formatPaise(bal.duePaise) + " · cans held " + bal.cansHeld;
}

window.renderProfile = renderProfile;
