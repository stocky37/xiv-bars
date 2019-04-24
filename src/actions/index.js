import {
  ADD_ACTION_TO_SLOT,
  REMOVE_ACTION_FROM_SLOT,
  STORE_ACTION,
  UPDATE_TOOLTIP
} from '../constants/action-types';

export function addActionToSlot(payload) {
  return { type: ADD_ACTION_TO_SLOT, payload };
}

export function removeActionFromSlot(payload) {
  return { type: REMOVE_ACTION_FROM_SLOT, payload };
}

export function storeAction(payload) {
  return { type: STORE_ACTION, payload };
}

export function updateTooltip(payload) {
  return { type: UPDATE_TOOLTIP, payload };
}
