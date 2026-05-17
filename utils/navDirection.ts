let _direction: 'left' | 'right' = 'right';
let _prevIndex = 0;

export function setNavDirection(fromIndex: number, toIndex: number) {
  _direction = toIndex >= fromIndex ? 'right' : 'left';
  _prevIndex = fromIndex;
}

export function getNavDirection() {
  return _direction;
}
