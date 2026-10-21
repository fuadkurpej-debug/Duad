/**
 * Visibly marks information that the business owner still has to provide.
 * Never replace a Placeholder with invented data.
 */
export function Placeholder({ label, tooltip }: { label: string; tooltip?: string }) {
  return (
    <span
      className="inline rounded-md border border-dashed border-brass/60 bg-brass/8 px-1.5 py-0.5 text-[0.92em] text-walnut [box-decoration-break:clone]"
      title={tooltip}
      data-placeholder=""
    >
      {label}
    </span>
  );
}
