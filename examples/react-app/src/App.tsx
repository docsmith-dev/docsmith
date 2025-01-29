import { useDocsData, useDoc, TableOfContents, Search } from '@docsmith/react'

export function App() {
  const { docs, tree } = useDocsData();

  return (
    <div>
      <h1>Docsmith Test</h1>
      <Search/>
      <TableOfContents/>
      <main>
        <pre>{JSON.stringify({ docs, tree }, null, 2)}</pre>
      </main>
    </div>
  );
}