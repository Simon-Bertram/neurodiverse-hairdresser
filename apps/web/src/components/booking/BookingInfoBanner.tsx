/**
 * Informative guidance: reduces uncertainty about what happens after submit.
 */
export function BookingInfoBanner() {
  return (
    <div className="flex items-center gap-4 border-info/20 border-b bg-info/10 p-5 text-info-content">
      <div className="rounded-full bg-base-100 p-2 text-lg shadow-sm">ℹ️</div>
      <p className="prose lg:prose-lg xl:prose-xl leading-relaxed">
        Lucy replies within 1–2 working days. This request isn't final—you can
        ask questions or change details later.
      </p>
    </div>
  );
}
