const { parseBody } = require("../../http/parse-body");
const { sendJson, sendError } = require("../../http/send");

function registerAuthRoutes(router, store) {
  router.add("POST", "/v1/auth/otp", async (req, res) => {
    await parseBody(req);
    sendJson(res, 200, { data: { sent: true, demoOtp: "123456" } });
  });

  router.add("POST", "/v1/auth/verify", async (req, res) => {
    const body = await parseBody(req);
    if (String(body.otp) !== "123456") {
      sendError(res, 401, "UNAUTHORIZED", "Wrong OTP");
      return;
    }
    sendJson(res, 200, {
      data: {
        accessToken: "demo-access",
        refreshToken: "demo-refresh",
        user: store.users[0],
        supplierId: "sup-murugan",
        role: "owner",
      },
    });
  });
}

module.exports = { registerAuthRoutes };
