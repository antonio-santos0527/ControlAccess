import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { store } from '../reducers/store';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(baseElement).toBeDefined();
  });
});
