function renderOrderScreen(data) {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  data.products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "cat-item";
    row.innerHTML =
      "<div><h4>" +
      product.nameEn +
      "</h4><span class='muted'>" +
      window.formatPaise(product.unitPricePaise) +
      " · " +
      product.serviceType +
      "</span></div>";
    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.textContent = "Order";
    btn.onclick = async () => {
      const order = await window.apiPost("/orders", {
        householdId: data.customer.householdId,
        customerId: data.customer.id,
        addressId: data.address.id,
        primarySupplierId: product.supplierId,
        productId: product.id,
        qty: 1,
        source: "web",
      });
      window.showToast("Placed " + order.code);
      await window.refreshApp();
    };
    row.appendChild(btn);
    list.appendChild(row);
  });
}

window.renderOrderScreen = renderOrderScreen;
