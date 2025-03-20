import React from 'react';
import { Component, Wire as WireType } from '../store';

interface WireProps {
  wire: WireType;
  components: Record<string, Component>;
}

export const Wire: React.FC<WireProps> = ({ wire, components }) => {
  const sourceComponent = components[wire.from.componentId];
  const targetComponent = components[wire.to.componentId];

  if (!sourceComponent || !targetComponent) return null;

  const sourcePin = sourceComponent.pins.find(p => p.id === wire.from.pinId);
  const targetPin = targetComponent.pins.find(p => p.id === wire.to.pinId);

  if (!sourcePin || !targetPin) return null;

  const startX = sourceComponent.x + sourcePin.x;
  const startY = sourceComponent.y + sourcePin.y;
  const endX = targetComponent.x + targetPin.x;
  const endY = targetComponent.y + targetPin.y;

  // Calculate control points for a smooth curve
  const dx = endX - startX;
  const dy = endY - startY;
  const controlX = startX + dx * 0.5;

  const path = `
    M ${startX} ${startY}
    C ${controlX} ${startY},
      ${controlX} ${endY},
      ${endX} ${endY}
  `;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <path
        d={path}
        stroke="#60A5FA"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}