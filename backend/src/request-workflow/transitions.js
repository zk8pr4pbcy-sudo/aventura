const TERMINAL = new Set();

const TRANSITIONS = {
  experience: {
    new: new Set(["under_review", "cancelled"]),
    under_review: new Set(["contacted", "quoted", "not_suitable", "cancelled"]),
    contacted: new Set(["quoted", "confirmed", "not_suitable", "cancelled"]),
    quoted: new Set(["confirmed", "not_suitable", "cancelled"]),
    confirmed: new Set(["closed", "cancelled"]),
    not_suitable: new Set(["closed"]),
    cancelled: new Set(["closed"]),
    closed: TERMINAL
  },
  collaboration: {
    new: new Set(["under_review", "cancelled"]),
    under_review: new Set(["contacted", "not_suitable", "cancelled"]),
    contacted: new Set(["confirmed", "not_suitable", "cancelled"]),
    confirmed: new Set(["closed", "cancelled"]),
    not_suitable: new Set(["closed"]),
    cancelled: new Set(["closed"]),
    closed: TERMINAL,
    quoted: TERMINAL
  }
};

export function isRequestKind(value) {
  return value === "experience" || value === "collaboration";
}

export function canTransition(kind, fromStatus, toStatus) {
  return Boolean(TRANSITIONS[kind]?.[fromStatus]?.has(toStatus));
}
