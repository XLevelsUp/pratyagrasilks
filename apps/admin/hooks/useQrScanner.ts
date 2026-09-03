import { useEffect, useRef } from 'react';

interface UseQrScannerOptions {
    onScan: (qrData: string) => void;
    enabled?: boolean;
}

// Chars arriving faster than this (ms) are from the scanner, not a human
const SCANNER_INTER_KEY_THRESHOLD = 40;
// Total scan must complete within this window from first char to Enter
const SCANNER_TOTAL_THRESHOLD = 500;

export function useQrScanner({ onScan, enabled = true }: UseQrScannerOptions) {
    const bufferRef = useRef<string>('');
    const firstKeystrokeRef = useRef<number>(0);
    const lastKeystrokeRef = useRef<number>(0);
    const callbackRef = useRef<(qrData: string) => void>(onScan);
    const enabledRef = useRef<boolean>(enabled);

    useEffect(() => { callbackRef.current = onScan; }, [onScan]);
    useEffect(() => { enabledRef.current = enabled; }, [enabled]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!enabledRef.current) return;

            const now = Date.now();

            if (e.key === 'Enter') {
                const elapsed = now - firstKeystrokeRef.current;
                if (bufferRef.current.length > 0 && elapsed < SCANNER_TOTAL_THRESHOLD) {
                    e.preventDefault(); // stop Enter reaching forms/search
                    callbackRef.current(bufferRef.current);
                }
                bufferRef.current = '';
                firstKeystrokeRef.current = 0;
                lastKeystrokeRef.current = 0;
                return;
            }

            if (e.key.length === 1) {
                const timeSinceLast = now - lastKeystrokeRef.current;

                if (bufferRef.current.length === 0) {
                    // First char — could be scanner or keyboard, can't tell yet
                    firstKeystrokeRef.current = now;
                } else if (timeSinceLast < SCANNER_INTER_KEY_THRESHOLD) {
                    // Subsequent chars arriving very fast → scanner burst
                    // Prevent them from reaching the focused input
                    e.preventDefault();
                } else {
                    // Chars arriving at human typing speed → not a scan, reset
                    bufferRef.current = '';
                    firstKeystrokeRef.current = now;
                }

                lastKeystrokeRef.current = now;
                bufferRef.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
