export default function Toast({ message, type = 'ok', onClose }) {
  if (!message) return null;
  const tone = type === 'error' ? 'bg-rose-600' : 'bg-brand-700';
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-md">
      <div className={`${tone} text-white rounded-2xl px-4 py-3 shadow-card flex items-start gap-3`}>
        <p className="text-sm leading-5 flex-1">{message}</p>
        <button onClick={onClose} className="text-white/80 hover:text-white text-sm" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
