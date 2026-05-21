// POS temporarily disabled. Original code preserved in git history.
// To re-enable: restore original file from git and uncomment nav items in admin/layout.tsx
import { redirect } from 'next/navigation';

export default function PosPage() {
    redirect('/admin/products');
}
