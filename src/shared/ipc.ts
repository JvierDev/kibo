export const IPC = {
  GET_STATE: "kibo:getState",
  SET_REMINDER: "kibo:setReminder",
  SET_SNOOZE: "kibo:setSnooze",
  SET_PAUSED: "kibo:setPaused",
  SET_AUTOSTART: "kibo:setAutoStart",
  TRIGGER_NOW: "kibo:triggerNow",
  RESPOND: "kibo:respond",
  HIDE_SETTINGS: "kibo:hideSettings",
  QUIT: "kibo:quit",
  EVT_REMINDER: "kibo:ev-reminder",
  EVT_REACTION: "kibo:ev-reaction",
  EVT_STATE: "kibo:ev-state",
} as const;
