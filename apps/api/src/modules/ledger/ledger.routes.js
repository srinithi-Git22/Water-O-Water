const { sendJson } = require("../../http/send");

function registerLedgerRoutes(router, services) {
  router.add("GET", "/v1/balances/:householdId", (req, res) => {
    const data = services.ledger.householdBalance(req.params.householdId);
    sendJson(res, 200, { data });
  });
}

module.exports = { registerLedgerRoutes };
