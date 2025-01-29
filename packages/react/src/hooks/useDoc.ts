import { docsmith } from '@docsmith/core';
// import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Doc } from '@docsmith/core';

export function useDoc(slug?: string): Doc | null {
  // const params = useParams();
  // const path = slug ?? params["*"] ?? "";
  // const [doc, setDoc] = useState<Doc | null>(null);
  //
  // useEffect(() => {
  //   // Get doc on mount or when path changes
  //   docsmith.initialize(process.cwd()).then(() => {
  //     setDoc(docsmith.getDoc(path));
  //   });
  // }, [path]);
  //
  // return doc;
  return null;
}