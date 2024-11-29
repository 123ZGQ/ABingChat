'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Message } from './types/chat';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('API error:', data.error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '抱歉，发生了一些错误，请稍后再试。'
        }]);
        return;
      }
      
      if (data.choices?.[0]?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '网络错误，请检查您的连接并重试。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        const cleanLine = line
          .replace(/^#+ /, '')
          .replace(/`{3}.*/, '')
          .replace(/`/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .trim();

        if (!cleanLine) {
          return <p key={index} className={styles.emptyLine}></p>;
        }

        const isCode = line.startsWith('    ') || line.startsWith('\t');
        
        return (
          <p 
            key={index} 
            className={`${styles.messageLine} ${isCode ? styles.codeLine : ''}`}
          >
            {cleanLine}
          </p>
        );
      });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>ABingChat</h1>
      </header>

      <main className={styles.chatContainer}>
        <div className={styles.messageArea}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className={styles.markdown}>
                  {formatMessage(msg.content)}
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {isLoading && <div className={styles.loading}>正在思考...</div>}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputContainer}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入您的问题..."
            className={styles.input}
            disabled={isLoading}
          />
          <button type="submit" className={styles.sendButton} disabled={isLoading}>
            发送
          </button>
        </form>
      </main>
    </div>
  );
}
