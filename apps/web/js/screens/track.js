function renderTrack(data) {
  const order = data.orders[0];
  document.getElementById("track-code").textContent =
    order.code + " · " + order.qty + " × 20L · " + window.statusLabel(order.status);
  const events = data.events.filter((row) => row.orderId === order.id);
  const list = document.getElementById("track-events");
  list.innerHTML = events
    .map((row) => {
      return (
        "<div class='cat-item'><div><h4>" +
        window.statusLabel(row.toStatus) +
        "</h4><span class='muted'>" +
        row.reason +
        "</span></div></div>"
      );
    })
    .join("");
}

window.renderTrack = renderTrack;
