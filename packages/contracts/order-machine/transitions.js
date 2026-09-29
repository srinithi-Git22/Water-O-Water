const { ORDER_STATUS } = require("../enums/order-status");

const TRANSITIONS = Object.freeze([
  {
    from: ORDER_STATUS.placed,
    event: "accept",
    to: ORDER_STATUS.accepted,
    who: ["owner", "staff", "system"],
  },
  {
    from: ORDER_STATUS.placed,
    event: "decline",
    to: ORDER_STATUS.fallbackOffered,
    who: ["owner", "staff"],
  },
  {
    from: ORDER_STATUS.placed,
    event: "timeout",
    to: ORDER_STATUS.fallbackOffered,
    who: ["system"],
  },
  {
    from: ORDER_STATUS.placed,
    event: "cancel",
    to: ORDER_STATUS.cancelled,
    who: ["customer", "member", "ops"],
  },
  {
    from: ORDER_STATUS.fallbackOffered,
    event: "customer_yes",
    to: ORDER_STATUS.fallbackOffered,
    who: ["customer"],
  },
  {
    from: ORDER_STATUS.fallbackOffered,
    event: "primary_accept",
    to: ORDER_STATUS.accepted,
    who: ["owner", "staff"],
  },
  {
    from: ORDER_STATUS.fallbackOffered,
    event: "fallback_assign",
    to: ORDER_STATUS.accepted,
    who: ["ops", "backup"],
  },
  {
    from: ORDER_STATUS.fallbackOffered,
    event: "customer_wait",
    to: ORDER_STATUS.failed,
    who: ["customer", "ops"],
  },
  {
    from: ORDER_STATUS.accepted,
    event: "start",
    to: ORDER_STATUS.outForDelivery,
    who: ["rider", "owner"],
  },
  {
    from: ORDER_STATUS.accepted,
    event: "cancel",
    to: ORDER_STATUS.cancelled,
    who: ["customer", "member", "ops"],
  },
  {
    from: ORDER_STATUS.outForDelivery,
    event: "deliver",
    to: ORDER_STATUS.delivered,
    who: ["rider", "owner"],
  },
  {
    from: ORDER_STATUS.outForDelivery,
    event: "exception",
    to: ORDER_STATUS.exception,
    who: ["rider"],
  },
  {
    from: ORDER_STATUS.exception,
    event: "reschedule",
    to: ORDER_STATUS.accepted,
    who: ["customer", "member"],
  },
  {
    from: ORDER_STATUS.exception,
    event: "cancel",
    to: ORDER_STATUS.cancelled,
    who: ["customer", "member", "ops"],
  },
  {
    from: ORDER_STATUS.delivered,
    event: "settle",
    to: ORDER_STATUS.settled,
    who: ["system"],
  },
]);

module.exports = { TRANSITIONS };
