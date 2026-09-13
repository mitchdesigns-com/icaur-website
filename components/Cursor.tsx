export function Cursor() {
  return (
    <div className="cursor" id="cursor" aria-hidden="true">
      <div className="cursor__dot" id="cursorDot" />
      <div className="cursor__ring" id="cursorRing" />
      <div className="cursor__label" id="cursorLabel" />
    </div>
  );
}
