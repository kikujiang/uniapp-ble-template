export const FRAME = {
  head: 'BA',
  tail: 'BB'
}

export const FUNCTION_CODE = {
  TIME: '01',
  RECORD: '02',
  DEVICE_STATE: '03',
  DISCHARGE: '04',
  POWER_ALERT: '07'
}

export const COMMAND_CODE = {
  READ_TIME: '01',
  CALIBRATE_TIME: '02',
  RECORD_NEW_HINT: '01',
  RECORD_SUMMARY: '02',
  RECORD_DETAIL: '03',
  RECORD_CLEAR: '04',
  DISCHARGE_START: '02',
  LOW_POWER_ALERT: '01'
}

export default {
  FRAME,
  FUNCTION_CODE,
  COMMAND_CODE
}
