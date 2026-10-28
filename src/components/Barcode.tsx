const BARS = [2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 1, 3, 2, 1, 2, 4, 1, 2];

export default function Barcode({ className }: { className?: string }) {
  return (
    <span className={`barcode ${className ?? ""}`.trim()} aria-hidden="true">
      {BARS.map((width, index) => (
        <span key={index} style={{ width: `${width}px` }} />
      ))}
    </span>
  );
}
