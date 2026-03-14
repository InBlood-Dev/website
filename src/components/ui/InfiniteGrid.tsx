"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface GridProfile {
  user_id: string;
  name: string;
  age: number;
  primary_photo: string | null;
  is_online?: boolean;
  borderColor?: string;
}

interface InfiniteGridProps {
  profiles: GridProfile[];
  onProfileClick: (userId: string) => void;
  className?: string;
}

const NUM_COLS = 3;
const GAP = 8;
const DECELERATION = 0.96;
const MIN_VELOCITY = 0.3;

/**
 * 360° infinite scroll grid — same technique as the mobile app.
 * Renders a 3x3 tile of identical grids. As the user drags/scrolls,
 * the position wraps via modulo so an identical neighbor replaces
 * the exiting tile seamlessly.
 */
export default function InfiniteGrid({
  profiles,
  onProfileClick,
  className = "",
}: InfiniteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const animFrameRef = useRef(0);
  const tileRef = useRef<HTMLDivElement>(null);

  // Dimensions
  const [dims, setDims] = useState({ cardW: 0, cardH: 0, cycleW: 0, cycleH: 0 });

  const numRows = Math.max(5, Math.ceil(profiles.length / NUM_COLS));

  // Compute card + cycle dimensions based on container width
  const computeDims = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const cardW = (w - GAP * (NUM_COLS - 1)) / NUM_COLS;
    const cardH = cardW * 1.4;
    const cellW = cardW + GAP;
    const cellH = cardH + GAP;
    const cycleW = cellW * NUM_COLS;
    const cycleH = cellH * numRows;
    setDims({ cardW, cardH, cycleW, cycleH });
  }, [numRows]);

  useEffect(() => {
    computeDims();
    const observer = new ResizeObserver(computeDims);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [computeDims]);

  // Modulo that handles negatives
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  // Get profile at grid position using wrapping
  const getProfileAt = useCallback(
    (col: number, row: number): GridProfile | null => {
      if (profiles.length === 0) return null;
      const idx = mod(row * NUM_COLS + col, profiles.length);
      return profiles[idx];
    },
    [profiles]
  );

  // Apply transform (called every frame)
  const applyTransform = useCallback(() => {
    if (!tileRef.current || dims.cycleW === 0 || dims.cycleH === 0) return;
    const normX = mod(translateRef.current.x, dims.cycleW);
    const normY = mod(translateRef.current.y, dims.cycleH);
    tileRef.current.style.transform = `translate3d(${normX - dims.cycleW}px, ${normY - dims.cycleH}px, 0)`;
  }, [dims]);

  // Momentum animation
  const animateMomentum = useCallback(() => {
    const vx = velocityRef.current.x * DECELERATION;
    const vy = velocityRef.current.y * DECELERATION;
    velocityRef.current = { x: vx, y: vy };

    translateRef.current.x += vx;
    translateRef.current.y += vy;
    applyTransform();

    if (Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY) {
      animFrameRef.current = requestAnimationFrame(animateMomentum);
    }
  }, [applyTransform]);

  // Pointer/touch handlers
  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      cancelAnimationFrame(animFrameRef.current);
      isDragging.current = true;
      didDrag.current = false;
      lastPosRef.current = { x: clientX, y: clientY };
      lastTimeRef.current = Date.now();
      velocityRef.current = { x: 0, y: 0 };
    },
    []
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging.current) return;
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDrag.current = true;
      }

      const now = Date.now();
      const dt = Math.max(1, now - lastTimeRef.current);
      velocityRef.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };

      translateRef.current.x += dx;
      translateRef.current.y += dy;
      lastPosRef.current = { x: clientX, y: clientY };
      lastTimeRef.current = now;

      applyTransform();
    },
    [applyTransform]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Kick off momentum
    if (
      Math.abs(velocityRef.current.x) > MIN_VELOCITY ||
      Math.abs(velocityRef.current.y) > MIN_VELOCITY
    ) {
      animFrameRef.current = requestAnimationFrame(animateMomentum);
    }
  }, [animateMomentum]);

  // Wire up pointer events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEnd();

    const onMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => handleEnd();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleStart, handleMove, handleEnd]);

  // Reset position when profiles change (filter)
  useEffect(() => {
    translateRef.current = { x: 0, y: 0 };
    velocityRef.current = { x: 0, y: 0 };
    cancelAnimationFrame(animFrameRef.current);
    applyTransform();
  }, [profiles.length, applyTransform]);

  if (dims.cardW === 0 || profiles.length === 0) {
    return <div ref={containerRef} className={`flex-1 ${className}`} />;
  }

  const cellW = dims.cardW + GAP;
  const cellH = dims.cardH + GAP;

  // Build one tile of cards
  const tileCards: React.ReactNode[] = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      const profile = getProfileAt(col, row);
      if (!profile) continue;
      const x = col * cellW;
      const y = row * cellH;
      tileCards.push(
        <div
          key={`${row}-${col}`}
          className="absolute rounded-xl overflow-hidden"
          style={{
            left: x,
            top: y,
            width: dims.cardW,
            height: dims.cardH,
            borderWidth: 2,
            borderColor: profile.borderColor || "rgba(255,255,255,0.06)",
          }}
          onPointerUp={() => {
            if (!didDrag.current) {
              onProfileClick(profile.user_id);
            }
          }}
        >
          {profile.primary_photo ? (
            <Image
              src={profile.primary_photo}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="33vw"
              unoptimized
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
              <span className="text-2xl text-white/20">
                {profile.name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {profile.is_online && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#4CAF50] ring-2 ring-black/30" />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-white font-medium text-xs truncate">
              {profile.name}
            </p>
            <p className="text-white/50 text-[10px]">{profile.age}</p>
          </div>
        </div>
      );
    }
  }

  // 3x3 tile grid
  const tiles: React.ReactNode[] = [];
  for (let tr = 0; tr < 3; tr++) {
    for (let tc = 0; tc < 3; tc++) {
      tiles.push(
        <div
          key={`tile-${tr}-${tc}`}
          className="absolute"
          style={{
            left: tc * dims.cycleW,
            top: tr * dims.cycleH,
            width: dims.cycleW,
            height: dims.cycleH,
          }}
        >
          {tileCards}
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none ${className}`}
    >
      <div
        ref={tileRef}
        className="will-change-transform"
        style={{
          width: dims.cycleW * 3,
          height: dims.cycleH * 3,
        }}
      >
        {tiles}
      </div>
    </div>
  );
}
