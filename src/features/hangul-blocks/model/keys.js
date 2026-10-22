const actions = {
  KeyA: 'left',
  KeyD: 'right',
  Enter: 'rotate',
  ShiftLeft: 'hard',
  ShiftRight: 'hard'
};
export function keyAction(event) {
  const action = event.key === 'Shift' ? 'hard' : actions[event.code];
  if (!action || event.repeat && ['hard', 'rotate'].includes(action)) return null;
  return action;
}
