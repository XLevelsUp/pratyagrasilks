import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Server-to-server auth for /api/agent/*.
 *
 * AGENT_API_KEY holds one key, or several comma-separated so an old and a new
 * key can both work during rotation. Unset means every request is refused.
 */

export function agentError(status: number, code: string, message: string, details?: unknown) {
    return NextResponse.json(
        { error: { code, message, ...(details !== undefined && { details }) } },
        { status }
    );
}

function safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Returns an error response to send back, or null when the key is valid. */
export function requireAgentKey(req: NextRequest): NextResponse | null {
    const keys = (process.env.AGENT_API_KEY ?? '')
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length >= 32);

    const header = req.headers.get('authorization') ?? '';
    const presented = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (keys.length === 0 || !presented || !keys.some((k) => safeEqual(k, presented))) {
        return agentError(401, 'UNAUTHORIZED', 'Missing or invalid API key');
    }
    return null;
}
