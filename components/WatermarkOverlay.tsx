export default function WatermarkOverlay() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
            <span
                className="font-playfair text-primary/35 font-bold uppercase tracking-[0.3em] select-none"
                style={{ transform: 'rotate(-30deg)', fontSize: 'clamp(1rem, 4vw, 2rem)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            >
                KANDANGI
            </span>
        </div>
    );
}
