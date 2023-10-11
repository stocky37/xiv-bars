import { ActionType } from 'types/Action';

export interface TooltipState {
  content?: ActionType,
  position?: {
    x: number,
    y: number
  },
  mouse?: {
    x: number,
    y: number
  },
  error?: string
}

export interface HideTooltip {
  type: TooltipAction.HIDE,
  payload: TooltipState
}

export interface UpdateTooltip {
  type: TooltipAction.UPDATE,
  payload: TooltipState
}

export interface FailTooltip {
  type: TooltipAction.FAIL,
  payload: TooltipState
}

export type TooltipActions = HideTooltip | UpdateTooltip | FailTooltip;

export interface TooltipDispatch {
  type: string,
  payload?: TooltipState
}