'use client';

import * as React from 'react';
import { run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { mdxComponents } from './mdx';

interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  const [Content, setContent] = React.useState<React.ComponentType<{ components: typeof mdxComponents }> | null>(null);

  React.useEffect(() => {
    const runMDX = async () => {
      try {
        const result = await run(code, {
          ...runtime,
          baseUrl: import.meta.url,
        });
        setContent(() => result.default);
      } catch (error) {
        console.error('Error rendering MDX:', error);
      }
    };
    runMDX();
  }, [code]);

  if (!Content) {
    return <div className="animate-pulse">Loading content...</div>;
  }

  return <Content components={mdxComponents} />;
}
