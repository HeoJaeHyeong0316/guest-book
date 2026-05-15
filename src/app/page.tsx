'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import './globals.css';

interface Reply {
  id: number;
  username: string;
  avatar: string;
  content: string;
  date: string;
}

interface Post {
  id: number;
  username: string;
  avatar: string;
  content: string;
  date: string;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    username: '홍길동',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    content: '안녕하세요! 새로운 프로젝트 시작해서 너무 기대돼요 🚀\n모두 화이팅!',
    date: '2025.05.20',
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: 101,
        username: '이서준',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb',
        content: '저도 기대됩니다! 화이팅!',
        date: '2025.05.20'
      }
    ],
  },
  {
    id: 2,
    username: '김민지',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    content: '오늘 수업도 정말 재미있었어요!\n다음 프로젝트도 기대할게요 😊',
    date: '2025.05.20',
    likes: 8,
    isLiked: false,
    replies: [],
  },
  {
    id: 3,
    username: '이서준',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb',
    content: '새로운 프로젝트 성공적이에요!\n선생님 감사합니다 🙌',
    date: '2025.05.19',
    likes: 15,
    isLiked: true,
    replies: [],
  },
];

export default function GuestbookPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<string[]>(['홍길동님이 내 글에 좋아요를 눌렀습니다!']);
  const [showNotifications, setShowNotifications] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const router = useRouter();

  const currentUsername = user?.email?.split('@')[0] || '익명';

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev]);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleLike = (id: number) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isLiking = !post.isLiked;
        // 내 글에 다른 사람이 좋아요를 누르는 상황을 시뮬레이션 (데모에서는 자기 글에 눌러도 알림 뜨게 설정)
        if (isLiking && post.username === currentUsername) {
          addNotification(`${currentUsername}님이 회원님의 글에 좋아요를 눌렀습니다!`);
        }
        return {
          ...post,
          likes: isLiking ? post.likes + 1 : post.likes - 1,
          isLiked: isLiking
        };
      }
      return post;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const newPost: Post = {
      id: Date.now(),
      username: currentUsername,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      content: message,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, ''),
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setPosts([newPost, ...posts]);
    setMessage('');
  };

  const handleReplySubmit = (postId: number) => {
    if (!replyMessage.trim() || !user) return;

    const newReply: Reply = {
      id: Date.now(),
      username: currentUsername,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      content: replyMessage,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, ''),
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        // 내 글에 답글이 달리면 알림 (데모 시뮬레이션)
        if (post.username === currentUsername) {
          addNotification(`${currentUsername}님이 회원님의 글에 답글을 남겼습니다: "${replyMessage.substring(0, 10)}..."`);
        }
        return { ...post, replies: [...post.replies, newReply] };
      }
      return post;
    }));
    setReplyMessage('');
    setReplyingTo(null);
  };

  if (!user) return <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <div className="container">
      <header className="header">
        <button className="icon-btn" onClick={handleLogout}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
        <h1>우리 반 방명록</h1>
        <button className="icon-btn" onClick={handleNotificationClick} style={{ position: 'relative' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              minWidth: '16px',
              height: '16px',
              backgroundColor: '#ff4d4d',
              borderRadius: '50%',
              border: '2px solid white',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px'
            }}>
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="notification-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 8px', borderBottom: '1px solid #f0f0f0', marginBottom: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>알림</span>
              <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>모두 지우기</button>
            </div>
            {notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <div key={idx} className="notification-item">
                  {notif}
                </div>
              ))
            ) : (
              <div className="notification-empty">새로운 알림이 없습니다.</div>
            )}
          </div>
        )}
      </header>

      <nav className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체 글
        </button>
        <button 
          className={`tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          내 글
        </button>
      </nav>

      <main className="post-list">
        {posts
          .filter(post => activeTab === 'all' || post.username === (user.email?.split('@')[0] || '익명'))
          .map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="user-info">
                  <img src={post.avatar} alt={post.username} className="avatar" />
                  <span className="username">{post.username}</span>
                </div>
                <span className="date">{post.date}</span>
              </div>
              <div className="content">{post.content}</div>
              
              {/* Replies List */}
              {post.replies.length > 0 && (
                <div className="replies-list" style={{ marginLeft: '40px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid #f0f0f0', paddingLeft: '16px' }}>
                  {post.replies.map(reply => (
                    <div key={reply.id} className="reply-item">
                      <div className="post-header" style={{ marginBottom: '4px' }}>
                        <div className="user-info" style={{ gap: '8px' }}>
                          <img src={reply.avatar} alt={reply.username} className="avatar" style={{ width: '28px', height: '28px' }} />
                          <span className="username" style={{ fontSize: '14px' }}>{reply.username}</span>
                        </div>
                        <span className="date" style={{ fontSize: '11px' }}>{reply.date}</span>
                      </div>
                      <div className="content" style={{ fontSize: '14px' }}>{reply.content}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="post-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="like-btn"
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  style={{ fontSize: '13px', color: '#888' }}
                >
                  답글 달기
                </button>
                <button 
                  className={`like-btn ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="heart-icon">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{post.likes}</span>
                </button>
              </div>

              {/* Reply Input */}
              {replyingTo === post.id && (
                <div className="reply-input" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <div className="input-wrapper" style={{ flex: 1, padding: '8px 12px' }}>
                    <input 
                      type="text" 
                      placeholder="답글을 입력하세요..." 
                      autoFocus
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit(post.id)}
                    />
                  </div>
                  <button 
                    className="submit-btn" 
                    onClick={() => handleReplySubmit(post.id)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    등록
                  </button>
                </div>
              )}
            </div>
          ))}
      </main>

      <form className="input-container" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input 
            type="text" 
            placeholder="메시지를 입력하세요..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={!message.trim()}>
          등록
        </button>
      </form>
    </div>
  );
}
