import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Chatbot } from '../Chatbot';

function renderChatbot() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Chatbot />
    </MemoryRouter>
  );
}

describe('Chatbot', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders floating launch button initially', () => {
    renderChatbot();
    expect(screen.getByTitle('Open Happy Coffee AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Ask DeepSeek AI')).toBeInTheDocument();
  });

  it('opens chat window when clicking floating launcher button', async () => {
    renderChatbot();
    const button = screen.getByTitle('Open Happy Coffee AI Assistant');
    fireEvent.click(button);

    expect(screen.getByText('Coffee AI Copilot')).toBeInTheDocument();
    expect(screen.getByText('DeepSeek V3')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask DeepSeek about Happy Coffee/i)).toBeInTheDocument();
  });

  it('allows typing and sending a message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => {
          let called = false;
          return {
            read: () => {
              if (!called) {
                called = true;
                const encoder = new TextEncoder();
                const chunk = encoder.encode('data: {"text":"Coffee quality is high!"}\n\ndata: [DONE]\n\n');
                return Promise.resolve({ done: false, value: chunk });
              }
              return Promise.resolve({ done: true, value: undefined });
            },
          };
        },
      },
    });

    renderChatbot();
    fireEvent.click(screen.getByTitle('Open Happy Coffee AI Assistant'));

    const input = screen.getByPlaceholderText(/Ask DeepSeek about Happy Coffee/i);
    await userEvent.type(input, 'What is our quality score?{enter}');

    expect(screen.getByText('What is our quality score?')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Coffee quality is high!/)).toBeInTheDocument();
    });
  });
});


