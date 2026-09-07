'use client';

import { useEffect, useState } from 'react';

/**
 * Confetti effect component for celebratory moments
 * Renders canvas-based confetti animation
 */
export default function ConfettiEffect() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Confetti animation
        const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confettiPieces: any[] = [];
        const confettiCount = 150;
        const colors = ['#FF6B9D', '#C44569', '#FFA07A', '#98D8C8', '#6C5CE7', '#A29BFE', '#FD79A8'];

        class ConfettiPiece {
            x: number;
            y: number;
            size: number;
            color: string;
            speedX: number;
            speedY: number;
            rotation: number;
            rotationSpeed: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height - canvas.height;
                this.size = Math.random() * 8 + 4;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 + 2;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = Math.random() * 10 - 5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;

                if (this.y > canvas.height) {
                    this.y = -10;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        // Create confetti pieces
        for (let i = 0; i < confettiCount; i++) {
            confettiPieces.push(new ConfettiPiece());
        }

        let animationFrameId: number;
        let startTime = Date.now();
        const duration = 5000; // 5 seconds

        function animate() {
            const elapsed = Date.now() - startTime;

            if (elapsed > duration) {
                cancelAnimationFrame(animationFrameId);
                canvas.style.display = 'none';
                return;
            }

            ctx!.clearRect(0, 0, canvas.width, canvas.height);

            confettiPieces.forEach((piece) => {
                piece.update();
                piece.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    if (!isClient) return null;

    return (
        <canvas
            id="confetti-canvas"
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}
