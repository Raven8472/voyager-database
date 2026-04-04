import { render, screen } from '@testing-library/react';
import App from './App';

test('renders voyager records console heading', () => {
  render(<App />);
  const heading = screen.getByText(/records console/i);
  expect(heading).toBeInTheDocument();
});
