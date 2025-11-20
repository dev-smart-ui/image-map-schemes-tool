import { useClickOutside } from "@/hooks/useClickOutside";
import classNames from "classnames";
import React, { useCallback, useRef, useState, useLayoutEffect } from "react";
import { RgbaStringColorPicker } from "react-colorful";

export const PopoverColorPicker = ({ 
  color, 
  onChange,
  className = '',
  offsetBetween = 32,
  edgeOffset = 20,
}: {
  color: string;
  onChange: (v: string) => void;
  className?: string;
  offsetBetween?: number;
  edgeOffset?: number;
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside([popoverRef], close);

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (!popoverRef.current || !swatchRef.current) return;

    const pop = popoverRef.current;
    const swatch = swatchRef.current;

    const popRect = pop.getBoundingClientRect();
    const swatchRect = swatch.getBoundingClientRect();

    let left = swatchRect.left;
    let top = swatchRect.bottom + offsetBetween;

    if (left < edgeOffset) {
      left = edgeOffset;
    }

    if (left + popRect.width > window.innerWidth - edgeOffset) {
      left = window.innerWidth - edgeOffset - popRect.width;
    }

    if (top + popRect.height > window.innerHeight - edgeOffset) {
      top = swatchRect.top - popRect.height - offsetBetween;
    }

    if (top < edgeOffset) {
      top = edgeOffset;
    }

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }, [isOpen, offsetBetween, edgeOffset]);

  return (
    <div className={classNames('picker', className)}>
      <div
        ref={swatchRef}
        className="swatch"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          ref={popoverRef}
          className="popover fixed z-50"
          style={{ position: "fixed" }}
        >
          <RgbaStringColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
};
