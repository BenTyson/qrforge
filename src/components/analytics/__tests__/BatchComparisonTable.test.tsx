import { render, screen } from '@testing-library/react';
import { BatchComparisonTable } from '../BatchComparisonTable';
import type { BatchComparisonRow } from '../BatchComparisonTable';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('BatchComparisonTable', () => {
  const mockRows: BatchComparisonRow[] = [
    {
      id: 'qr-1',
      name: 'Product Launch',
      destinationUrl: 'https://example.com/launch',
      scanCount: 500,
      percentOfTotal: 50,
      topDevice: 'Mobile',
      topCountry: 'United States',
    },
    {
      id: 'qr-2',
      name: 'Event Signup',
      destinationUrl: 'https://example.com/event',
      scanCount: 300,
      percentOfTotal: 30,
      topDevice: 'Desktop',
      topCountry: 'United Kingdom',
    },
    {
      id: 'qr-3',
      name: 'Menu',
      destinationUrl: null,
      scanCount: 200,
      percentOfTotal: 20,
      topDevice: 'Tablet',
      topCountry: 'Germany',
    },
  ];

  it('renders all rows in the table', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    // Both mobile and desktop layouts render names, so use getAllByText
    expect(screen.getAllByText('Product Launch').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Event Signup').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Menu').length).toBeGreaterThanOrEqual(1);
  });

  it('displays correct ranking numbers', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    // Desktop table has rank numbers
    const rankElements = screen.getAllByText(/^[123]$/);
    expect(rankElements.length).toBeGreaterThanOrEqual(3);
  });

  it('displays correct percentages', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    expect(screen.getAllByText('50.0%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('30.0%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('20.0%').length).toBeGreaterThanOrEqual(1);
  });

  it('displays scan counts', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    expect(screen.getAllByText('500').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('300').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('200').length).toBeGreaterThanOrEqual(1);
  });

  it('renders links to individual QR analytics', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    const links = screen.getAllByRole('link', { name: 'Product Launch' });
    expect(links[0]).toHaveAttribute('href', '/analytics?qr=qr-1');
  });

  it('renders nothing when rows is empty', () => {
    const { container } = render(<BatchComparisonTable rows={[]} batchLabel="batch-123" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Export Batch Report button', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    expect(screen.getByText('Export Batch Report')).toBeInTheDocument();
  });

  it('exports CSV on button click', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    const mockClick = jest.fn();
    const mockAnchor = { href: '', download: '', click: mockClick };
    jest.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor as unknown as HTMLElement);

    screen.getByText('Export Batch Report').click();

    expect(mockAnchor.download).toBe('batch-report-batch-123.csv');
    expect(mockClick).toHaveBeenCalled();
  });

  it('shows dash for null destination URL', () => {
    render(<BatchComparisonTable rows={mockRows} batchLabel="batch-123" />);

    // The third row has null URL, which should show '-'
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
