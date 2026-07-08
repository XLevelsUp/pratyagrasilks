import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        {/* <h3 className="font-playfair text-2xl font-bold">
                            Pratyagra Silks
                        </h3> */}
                         <Image
                            src="/Pratyagra_Silks_Logo_White.svg"
                            alt="Pratyagra Silks Logo"
                            width={200}
                            height={32}
                            className="object-contain"
                        />
                        <p className="text-white/80 mb-4 max-w-md">
                            Reviving Tradition with a New Touch
                        </p>
                        <p className="text-white/80">
                            <strong>Contact:</strong>{' '}
                            <a
                                href="mailto:info@pratyagrasilks.com"
                                className="text-white/80 hover:text-secondary underline underline-offset-2 transition-colors"
                            >
                                info@pratyagrasilks.com
                            </a>
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/collection"
                                    className="text-white/80 hover:text-secondary transition-colors"
                                >
                                    Collection
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-white/80 hover:text-secondary transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-white/80 hover:text-secondary transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shipping"
                                    className="text-white/80 hover:text-secondary transition-colors"
                                >
                                    Shipping & Delivery
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media & Policies */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
                        <div className="flex flex-wrap gap-4 items-center mb-6">
                            <a
                                href="/instagram"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-secondary transition-colors"
                                aria-label="Instagram"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="/youtube"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-secondary transition-colors"
                                aria-label="YouTube"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                            <a
                                href="/facebook"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-secondary transition-colors"
                                aria-label="Facebook"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="/x"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-secondary transition-colors"
                                aria-label="X (Twitter)"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="/reddit"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-secondary transition-colors"
                                aria-label="Reddit"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.09-3.43 2.98.66c.09.83.79 1.48 1.64 1.48 1.1 0 2-1 2-2s-.9-2-2-2c-.88 0-1.61.57-1.89 1.36l-3.32-.74c-.21-.05-.42.08-.47.3l-1.37 4.3c-2.48.05-4.73.7-6.39 1.71-.56-.75-1.46-1.23-2.42-1.23-1.65 0-3 1.35-3 3 0 1.1.6 2.06 1.48 2.58-.05.29-.08.59-.08.89 0 3.86 4.7 7 10.5 7s10.5-3.14 10.5-7c0-.3-.03-.6-.08-.89.88-.52 1.48-1.48 1.48-2.58zM8.5 13.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5zm8.5 3.5c-1.35 1.35-3.88 1.48-5 1.48s-3.65-.13-5-1.48c-.19-.19-.19-.51 0-.7.19-.19.51-.19.7 0 1.07 1.07 3.12 1.18 4.3 1.18 1.18 0 3.23-.11 4.3-1.18.19-.19.51-.19.7 0 .19.19.19.51 0 .7zm-1.5-2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                </svg>
                            </a>
                            <a
                                href="/blogger"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-secondary transition-colors"
                                aria-label="Blogger"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M21.976 24H2.026C.9 24 0 23.1 0 21.976V2.026C0 .9.9 0 2.025 0H22.05C23.1 0 24 .9 24 2.025v19.95C24 23.1 23.1 24 21.976 24zM12 3.975H9c-2.775 0-5.025 2.25-5.025 5.025v6c0 2.774 2.25 5.024 5.025 5.024h6c2.774 0 5.024-2.25 5.024-5.024v-3.975c0-.6-.45-1.05-1.05-1.05H18c-.524 0-.976-.45-.976-.976 0-2.776-2.25-5.026-5.024-5.026zm3.074 12H9c-.525 0-.975-.45-.975-.975s.45-.976.975-.976h6.074c.526 0 .977.45.977.976s-.45.976-.975.976zm-2.55-7.95c.527 0 .976.45.976.975s-.45.975-.975.975h-3.6c-.525 0-.976-.45-.976-.975s.45-.975.975-.975h3.6z" />
                                </svg>
                            </a>
                            <a
                                href="/pinterest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-secondary transition-colors"
                                aria-label="Pinterest"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.404 7.627 11.162-.105-.947-.2-2.403.042-3.438.216-.926 1.408-5.98 1.408-5.98s-.359-.72-.359-1.783c0-1.671.969-2.921 2.175-2.921 1.025 0 1.521.77 1.521 1.693 0 1.031-.657 2.573-.995 3.996-.284 1.203.602 2.181 1.785 2.181 2.143 0 3.791-2.257 3.791-5.516 0-2.885-2.074-4.904-5.035-4.904-3.427 0-5.441 2.568-5.441 5.225 0 1.034.399 2.144.895 2.747.098.118.112.222.03.509-.101.353-.327 1.127-.424 1.446-.057.189-.189.256-.432.155-1.611-.667-2.617-2.458-2.617-4.444 0-3.603 2.619-6.915 7.547-6.915 3.959 0 7.031 2.822 7.031 6.574 0 3.926-2.474 7.086-5.912 7.086-1.156 0-2.242-.599-2.615-1.307 0 0-.573 2.185-.712 2.721-.212.812-.779 1.626-1.246 2.256C9.919 23.824 10.929 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                                </svg>
                            </a>
                        </div>

                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-white/80 hover:text-secondary transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-white/80 hover:text-secondary transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/returns"
                                    className="text-white/80 hover:text-secondary transition-colors"
                                >
                                    Returns & Exchanges
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="flex flex-wrap gap-3 justify-between border-t border-white/20 mt-8 pt-8 text-center text-white/70 text-sm">
                    <p>
                        &copy; {currentYear} Pratyagra Silks. All rights reserved.
                    </p>
                     <p>
                            Built with ❤️ by{' '}
                            <a
                                href="https://xlevelsup.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className=" hover:text-white"
                            >
                                XLevelsUp
                            </a>
                        </p>
                </div>
            </div>
        </footer>
    );
}
