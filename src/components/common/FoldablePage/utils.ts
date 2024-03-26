import { RefObject } from "react";

/**
 * 当父元素为 static 时，才能够设置 position
 * @param VirRef
 * @param position
 * @returns
 */
export function setParentDomPosition(
  VirRef: RefObject<HTMLDivElement>,
  position: string | null
) {
  if (!VirRef.current || position === null) return;
  const parent = VirRef.current.parentElement;
  if (!parent) return;

  const parentPosition = getComputedStyle(parent).position;
  if (["static", ""].includes(parentPosition)) {
    parent.style.setProperty("position", position);
  }
}
