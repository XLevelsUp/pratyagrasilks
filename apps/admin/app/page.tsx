import { redirect } from 'next/navigation';

// The admin host serves nothing at its root. The /admin URL prefix is retained
// (see the split commit) so existing bookmarks and the storefront's 301 map
// 1:1 onto this app.
export default function Home() {
    redirect('/admin');
}
