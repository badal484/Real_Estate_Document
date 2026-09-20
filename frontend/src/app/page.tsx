import { redirect } from 'next/navigation';

// Root redirects to the upload page — first action in the workflow
export default function RootPage() {
  redirect('/upload');
}
