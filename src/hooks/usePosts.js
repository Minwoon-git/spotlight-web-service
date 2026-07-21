import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDoc,
  onSnapshot, query, orderBy, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from '../firebase'

export const POST_CATEGORIES = ['모임', '클래스', '자유']

const authorFields = (user) => ({
  author: user?.displayName || user?.email?.split('@')[0] || '익명',
  authorId: user?.uid || null,
  authorPhoto: user?.photoURL || null,
})

// 커뮤니티 글 목록 (공개 — 로그인 여부와 무관하게 구독)
export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q,
      snapshot => {
        setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => { console.error('커뮤니티 글 불러오기 실패:', err); setLoading(false) },
    )
    return unsub
  }, [])

  const addPost = async (data, user) => {
    const ref = await addDoc(collection(db, 'posts'), {
      title: data.title,
      content: data.content,
      category: data.category,
      // 모임 카테고리에서만 사용하는 선택 필드
      meetupDate: data.meetupDate ?? '',
      meetupPlace: data.meetupPlace ?? '',
      commentCount: 0,
      views: 0,
      ...authorFields(user),
      createdAt: serverTimestamp(),
    })
    return { id: ref.id }
  }

  const updatePost = async (postId, data) => {
    await updateDoc(doc(db, 'posts', postId), {
      title: data.title,
      content: data.content,
      category: data.category,
      meetupDate: data.meetupDate ?? '',
      meetupPlace: data.meetupPlace ?? '',
    })
  }

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, 'posts', postId))
  }

  return { posts, loading, addPost, updatePost, deletePost }
}

// 단건 글 + 댓글
export function usePost(postId, user) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (!postId) return
    const unsub = onSnapshot(doc(db, 'posts', postId),
      snap => {
        setPost(snap.exists() ? { id: snap.id, ...snap.data() } : null)
        setLoading(false)
      },
      err => { console.error('글 불러오기 실패:', err); setLoading(false) },
    )
    return unsub
  }, [postId])

  useEffect(() => {
    if (!postId) return
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q,
      snapshot => setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('댓글 불러오기 실패:', err),
    )
    return unsub
  }, [postId])

  const addComment = async (content) => {
    if (!postId || !content.trim()) return
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      content: content.trim(),
      ...authorFields(user),
      createdAt: serverTimestamp(),
    })
    // 목록에 댓글 수를 보여주기 위한 카운터
    try {
      await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) })
    } catch { /* 카운터 실패는 댓글 작성 자체를 막지 않는다 */ }
  }

  const deleteComment = async (commentId) => {
    if (!postId) return
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
    try {
      await updateDoc(doc(db, 'posts', postId), { commentCount: increment(-1) })
    } catch { /* 위와 동일 */ }
  }

  return { post, loading, comments, addComment, deleteComment }
}

// 상세 진입 시 조회수 1 증가 (실패해도 무시)
export async function bumpViews(postId) {
  try {
    const ref = doc(db, 'posts', postId)
    if ((await getDoc(ref)).exists()) await updateDoc(ref, { views: increment(1) })
  } catch { /* 권한 없거나 실패하면 조용히 넘어감 */ }
}
