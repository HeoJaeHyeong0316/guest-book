'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import '../globals.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage('확인 이메일을 보냈습니다. 이메일을 확인해 주세요!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
      }
    } catch (error: any) {
      setMessage(error.message || '인증 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ justifyContent: 'center', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>학과 방명록</h1>
        <p style={{ color: '#666' }}>우리 학과만의 소중한 공간에 오신 것을 환영합니다.</p>
      </div>

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="input-wrapper" style={{ padding: '16px' }}>
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-wrapper" style={{ padding: '16px' }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          style={{ padding: '18px', fontSize: '16px', borderRadius: '16px' }}
          disabled={loading}
        >
          {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
        </button>

        {!isSignUp && (
          <button 
            type="button"
            className="submit-btn" 
            onClick={async () => {
              setLoading(true);
              try {
                // 먼저 로그인을 시도합니다.
                let { error: signInError } = await supabase.auth.signInWithPassword({
                  email: 'test@example.com',
                  password: 'password123',
                });

                // 계정이 없으면 새로 생성합니다.
                if (signInError) {
                  const { error: signUpError } = await supabase.auth.signUp({
                    email: 'test@example.com',
                    password: 'password123',
                  });
                  if (signUpError) throw signUpError;
                  setMessage('데모 계정이 생성되었습니다! 다시 버튼을 눌러 로그인해 주세요.');
                } else {
                  router.push('/');
                }
              } catch (e: any) {
                setMessage(e.message || '오류가 발생했습니다.');
              } finally {
                setLoading(false);
              }
            }}
            style={{ 
              padding: '18px', 
              fontSize: '16px', 
              borderRadius: '16px', 
              backgroundColor: '#f5f5f5', 
              color: '#333',
              border: '1px solid #ddd'
            }}
            disabled={loading}
          >
            데모 계정으로 바로 시작하기
          </button>
        )}

        {message && (
          <p style={{ 
            textAlign: 'center', 
            fontSize: '14px', 
            color: message.includes('확인') ? '#2e7d32' : '#d32f2f',
            backgroundColor: message.includes('확인') ? '#e8f5e9' : '#ffebee',
            padding: '12px',
            borderRadius: '12px'
          }}>
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {isSignUp ? '이미 계정이 있으신가요? 로그인' : '처음이신가요? 회원가입'}
        </button>
      </form>

      <div style={{ position: 'absolute', bottom: '40px', left: '0', width: '100%', textAlign: 'center', color: '#ccc', fontSize: '12px' }}>
        &copy; 2025 Department Guestbook. All rights reserved.
      </div>
    </div>
  );
}
