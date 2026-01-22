'use client';

import dynamic from 'next/dynamic';

const EditorShell = dynamic(
  () => import('@/components/editor/EditorShell').then((mod) => mod.EditorShell),
  {
    ssr: false,
    loading: () => <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">Loading Editor...</div>
  }
);

export default function Home() {
  return <EditorShell />;
}
