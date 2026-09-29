function renderHome(data) {
  const customer = data.customer;
  const order = data.orders[0];
  document.getElementById("greet-name").textContent = "Hi, " + customer.name + " 👋";
  document.getElementById("home-address").textContent = data.address.line;
  document.getElementById("home-banner").textContent =
    "Order " + order.code + " · " + window.statusLabel(order.status) + " · " + order.eta;
}

window.renderHome = renderHome;
