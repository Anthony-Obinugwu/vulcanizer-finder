import React, { useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo, useDragControls } from 'framer-motion';

export type BottomSheetProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  hideBackdrop?: boolean;
  snapPoints?: number[];
  currentSnap?: number;
  onSnapChange?: (snap: number) => void;
  className?: string;
};

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  hideBackdrop = false,
  snapPoints,
  currentSnap,
  onSnapChange,
  className = ''
}: BottomSheetProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const dragControls = useDragControls();

  // Handle Drag End physics
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    if (snapPoints && currentSnap !== undefined && onSnapChange) {
      // Multi-snap logic
      const sortedSnaps = [...snapPoints].sort((a, b) => a - b);
      const currentIndex = sortedSnaps.indexOf(currentSnap);
      
      if (offset > 50 || velocity > 400) {
        // Dragged down
        if (currentIndex > 0) {
          onSnapChange(sortedSnaps[currentIndex - 1]);
        } else if (onClose) {
          // If at the lowest snap and dragged down, close if possible
          // But for the map list, it's permanently open.
          // onClose might be undefined.
        }
      } else if (offset < -50 || velocity < -400) {
        // Dragged up
        if (currentIndex < sortedSnaps.length - 1) {
          onSnapChange(sortedSnaps[currentIndex + 1]);
        }
      }
    } else {
      // Standard open/close logic
      if (offset > 100 || velocity > 500) {
        if (onClose) onClose();
      }
    }
  };

  const isMultiSnap = Boolean(snapPoints && currentSnap !== undefined);

  // For multi-snap, we use percentages instead of dvh/calc to avoid mobile URL bar jump glitches
  // Example: snap = 0.9 -> y = 10%. snap = 0.2 -> y = 80%.
  // Percentages animate buttery smooth in Framer Motion.
  const yAnim = isMultiSnap ? `${(1 - currentSnap!) * 100}%` : 0;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {!hideBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
          )}

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: yAnim }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            dragControls={dragControls}
            dragListener={false}
            onDragEnd={handleDragEnd}
            className={`
              fixed inset-x-0 bottom-0 mx-auto z-50 flex flex-col max-w-3xl bg-slate-900 rounded-t-[32px] 
              border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] outline-none
              ${isMultiSnap ? 'h-[100vh]' : 'min-h-[60vh] max-h-[85vh]'}
              ${className}
            `}
          >
            {/* Drag Handle Area */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="flex-shrink-0 p-4 bg-slate-900 rounded-t-[32px] cursor-grab active:cursor-grabbing flex justify-center w-full z-10 touch-none"
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-700 pointer-events-none" />
            </div>

            {/* Scrollable Content Area */}
            <div 
              className="flex-1 overflow-y-auto px-4 flex flex-col"
              style={{ paddingBottom: isMultiSnap ? `calc(${(1 - currentSnap!) * 100}vh + 2rem)` : '2rem' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
