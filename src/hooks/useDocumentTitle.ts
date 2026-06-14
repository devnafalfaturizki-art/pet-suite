import { useEffect, useRef } from 'react';

export function useDocumentTitle(title: string) {
  const previousTitle = useRef(document.title);

  useEffect(() => {
    document.title = `${title} | PetCare Suite`;

    return () => {
      document.title = previousTitle.current;
    };
  }, [title]);
}