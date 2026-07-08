export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#060B18]">
      {/* Radial soft glow matching the current color scheme */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#060B18]/50 to-[#060B18] z-0" />
    </div>
  );
}
