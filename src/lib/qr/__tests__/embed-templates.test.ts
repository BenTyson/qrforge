import { generateEmbedCode, escapeHtml } from '../embed-templates';
import type { EmbedCodeOptions } from '../embed-templates';

const BASE_OPTIONS: EmbedCodeOptions = {
  embedType: 'static',
  format: 'html-img',
  size: 256,
  showBorder: false,
  svgDataURL: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
  svgContent: '<svg width="100" height="100"><rect /></svg>',
  qrName: 'My QR Code',
  qrId: '123e4567-e89b-12d3-a456-426614174000',
  baseUrl: 'https://qrwolf.com',
};

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('handles combined special characters', () => {
    expect(escapeHtml('<a href="x">&')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;');
  });
});

describe('generateEmbedCode', () => {
  describe('Static HTML <img>', () => {
    it('generates correct img tag with base64 data URL', () => {
      const result = generateEmbedCode(BASE_OPTIONS);
      expect(result).toBe(
        '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" alt="My QR Code" width="256" height="256" />'
      );
    });

    it('wraps with border div when showBorder is true', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, showBorder: true });
      expect(result).toContain('border:1px solid #e5e7eb');
      expect(result).toContain('border-radius:8px');
      expect(result).toContain('padding:8px');
      expect(result).toContain('<img src="data:image/svg+xml;base64,');
    });

    it('respects the size parameter', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, size: 512 });
      expect(result).toContain('width="512"');
      expect(result).toContain('height="512"');
    });
  });

  describe('Static Inline SVG', () => {
    it('returns SVG content with adjusted dimensions', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, format: 'html-inline' });
      expect(result).toContain('<svg');
      expect(result).toContain('width="256"');
      expect(result).toContain('height="256"');
    });

    it('replaces existing width/height in SVG', () => {
      const opts: EmbedCodeOptions = {
        ...BASE_OPTIONS,
        format: 'html-inline',
        svgContent: '<svg width="100" height="100" viewBox="0 0 100 100"><rect /></svg>',
        size: 400,
      };
      const result = generateEmbedCode(opts);
      expect(result).toContain('width="400"');
      expect(result).toContain('height="400"');
      expect(result).not.toContain('width="100"');
      expect(result).not.toContain('height="100"');
    });

    it('wraps inline SVG with border when showBorder is true', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, format: 'html-inline', showBorder: true });
      expect(result).toContain('border:1px solid #e5e7eb');
      expect(result).toContain('<svg');
    });
  });

  describe('Static Markdown', () => {
    it('generates markdown image syntax with data URL', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, format: 'markdown' });
      expect(result).toBe('![My QR Code](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)');
    });

    it('does not add border wrapper for markdown format', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, format: 'markdown', showBorder: true });
      // Markdown format ignores border since it's just markdown syntax
      expect(result).toBe('![My QR Code](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)');
    });
  });

  describe('Dynamic HTML <img>', () => {
    it('generates img tag with embed endpoint URL', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, embedType: 'dynamic' });
      expect(result).toBe(
        '<img src="https://qrwolf.com/api/embed/123e4567-e89b-12d3-a456-426614174000?size=256" alt="My QR Code" width="256" height="256" />'
      );
    });

    it('includes size parameter in URL', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, embedType: 'dynamic', size: 512 });
      expect(result).toContain('?size=512');
      expect(result).toContain('width="512"');
      expect(result).toContain('height="512"');
    });

    it('wraps dynamic embed with border when showBorder is true', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, embedType: 'dynamic', showBorder: true });
      expect(result).toContain('border:1px solid #e5e7eb');
      expect(result).toContain('/api/embed/');
    });
  });

  describe('HTML entity escaping in qrName', () => {
    it('escapes special characters in the alt text', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, qrName: 'My <Script> & "Code"' });
      expect(result).toContain('alt="My &lt;Script&gt; &amp; &quot;Code&quot;"');
    });

    it('escapes name in markdown format', () => {
      const result = generateEmbedCode({
        ...BASE_OPTIONS,
        format: 'markdown',
        qrName: 'Test & Code',
      });
      expect(result).toContain('![Test &amp; Code]');
    });
  });

  describe('Dynamic embed fallback when qrId is null', () => {
    it('returns fallback comment when qrId is null', () => {
      const result = generateEmbedCode({ ...BASE_OPTIONS, embedType: 'dynamic', qrId: null });
      expect(result).toBe('<!-- QR code must be saved before generating a dynamic embed -->');
    });
  });
});
