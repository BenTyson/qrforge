import { render, screen, fireEvent } from '@testing-library/react';
import { BatchFilterSelect } from '../BatchFilterSelect';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe('BatchFilterSelect', () => {
  const options = [
    { value: '', label: 'All Batches' },
    { value: 'batch-1', label: 'Batch Jan 20 (5 codes)' },
    { value: 'batch-2', label: 'Batch Feb 3 (10 codes)' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('renders all options', () => {
    render(<BatchFilterSelect options={options} selected="" />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByText('All Batches')).toBeInTheDocument();
    expect(screen.getByText('Batch Jan 20 (5 codes)')).toBeInTheDocument();
    expect(screen.getByText('Batch Feb 3 (10 codes)')).toBeInTheDocument();
  });

  it('navigates with batch param on select', () => {
    render(<BatchFilterSelect options={options} selected="" />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'batch-1' } });

    expect(mockPush).toHaveBeenCalledWith('/analytics?batch=batch-1');
  });

  it('navigates to /analytics when clearing selection', () => {
    render(<BatchFilterSelect options={options} selected="batch-1" />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

    expect(mockPush).toHaveBeenCalledWith('/analytics');
  });

  it('clears qr and campaign params on select', () => {
    mockSearchParams = new URLSearchParams('qr=some-id&campaign=camp-1&page=3');
    render(<BatchFilterSelect options={options} selected="" />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'batch-2' } });

    const calledUrl = mockPush.mock.calls[0][0] as string;
    const params = new URLSearchParams(calledUrl.replace('/analytics?', ''));
    expect(params.get('batch')).toBe('batch-2');
    expect(params.has('qr')).toBe(false);
    expect(params.has('campaign')).toBe(false);
    expect(params.has('page')).toBe(false);
  });

  it('shows selected value', () => {
    render(<BatchFilterSelect options={options} selected="batch-1" />);

    expect(screen.getByRole('combobox')).toHaveValue('batch-1');
  });
});
