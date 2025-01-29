import { useDocsData } from '@docsmith/react'

export function App() {
  const { docs, tree } = useDocsData();

  return (
    <div>
      <h1>Docsmith Test</h1>
      <main>
        <pre>{JSON.stringify({ docs, tree }, null, 2)}</pre>
      </main>
    </div>
  );
}