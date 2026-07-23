import { useState, useEffect } from 'react'
import {
  collection, addDoc, setDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, increment,
  arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from '../firebase'

export const MEETUP_TYPES = ['소셜링', '클럽', '원데이클래스']

export const TYPE_INFO = {
  소셜링: {
    desc: '하루 함께 출사 나갈 사람을 구해요',
    hint: '어떤 사진을 찍으러 가는지, 준비물이 있는지 적어주세요.',
    // 유형마다 참여의 성격이 달라 호칭을 나눈다
    member: '참여자', join: '참여하기', leave: '참여 취소하기',
    closed: '모집이 마감됐어요', hostRole: '호스트',
  },
  클럽: {
    desc: '정기적으로 함께 활동할 사진 모임이에요',
    hint: '활동 방식, 모임 분위기, 어떤 분과 함께하고 싶은지 적어주세요.',
    member: '멤버', join: '가입하기', leave: '탈퇴하기',
    closed: '정원이 찼어요', hostRole: '모임장',
  },
  원데이클래스: {
    desc: '작가님께 배우는 하루 강좌예요',
    hint: '수업 내용, 준비물, 수강 대상을 적어주세요.',
    member: '수강생', join: '수강 신청하기', leave: '신청 취소하기',
    closed: '신청이 마감됐어요', hostRole: '개설자',
  },
}

const hostFields = (user) => ({
  host: user?.displayName || user?.email?.split('@')[0] || '익명',
  hostId: user?.uid || null,
  hostPhoto: user?.photoURL || null,
})

const toDocData = (data) => ({
  type: data.type,
  title: data.title,
  description: data.description,
  image: data.image ?? '',
  region: data.region ?? '',
  place: data.place ?? '',
  // 지도에서 고른 경우에만 좌표가 있다 (클럽은 활동 범위라 좌표 없음)
  lat: data.lat ?? null,
  lng: data.lng ?? null,
  // 소셜링·원데이클래스는 특정 일시, 클럽은 활동 주기를 쓴다
  date: data.date ?? '',
  time: data.time ?? '',
  schedule: data.schedule ?? '',
  capacity: Number(data.capacity) || 0, // 0 = 인원 제한 없음
  fee: data.fee ?? '',
  instructor: data.instructor ?? '',
})

export function useMeetups() {
  const [meetups, setMeetups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'meetups'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q,
      snap => { setMeetups(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) },
      err => { console.error('모임 불러오기 실패:', err); setLoading(false) },
    )
    return unsub
  }, [])

  const addMeetup = async (data, user) => {
    const ref = await addDoc(collection(db, 'meetups'), {
      ...toDocData(data),
      ...hostFields(user),
      participantCount: 1, // 주최자가 첫 참여자
      commentCount: 0,
      createdAt: serverTimestamp(),
    })
    // 주최자를 참여자 명단에 넣어 인원수와 목록이 실제와 맞게 한다
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'meetups', ref.id, 'participants', user.uid), {
          name: user.displayName || user.email?.split('@')[0] || '익명',
          photo: user.photoURL || null,
          joinedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('주최자 참여자 등록 실패:', err)
      }
    }
    return { id: ref.id }
  }

  const updateMeetup = async (id, data) => {
    await updateDoc(doc(db, 'meetups', id), toDocData(data))
  }

  const deleteMeetup = async (id) => {
    await deleteDoc(doc(db, 'meetups', id))
  }

  return { meetups, loading, addMeetup, updateMeetup, deleteMeetup }
}

// 내가 참여 중인 모임 id 목록 (주최한 모임은 별도로 구분하므로 여기 포함하지 않는다)
export function useJoinedMeetups(user) {
  const [joinedMeetups, setJoinedMeetups] = useState([])

  useEffect(() => {
    if (!user) { setJoinedMeetups([]); return }
    const unsub = onSnapshot(doc(db, 'users', user.uid),
      snap => setJoinedMeetups(snap.exists() ? (snap.data().joinedMeetups ?? []) : []),
      err => console.error('참여 모임 불러오기 실패:', err),
    )
    return unsub
  }, [user])

  return joinedMeetups
}

export function useMeetup(meetupId, user) {
  const [meetup, setMeetup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState([])
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (!meetupId) return
    const unsub = onSnapshot(doc(db, 'meetups', meetupId),
      snap => { setMeetup(snap.exists() ? { id: snap.id, ...snap.data() } : null); setLoading(false) },
      err => { console.error('모임 불러오기 실패:', err); setLoading(false) },
    )
    return unsub
  }, [meetupId])

  useEffect(() => {
    if (!meetupId) return
    const unsub = onSnapshot(collection(db, 'meetups', meetupId, 'participants'),
      snap => setParticipants(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('참가자 불러오기 실패:', err),
    )
    return unsub
  }, [meetupId])

  useEffect(() => {
    if (!meetupId) return
    const q = query(collection(db, 'meetups', meetupId, 'comments'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q,
      snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('댓글 불러오기 실패:', err),
    )
    return unsub
  }, [meetupId])

  const isJoined = !!user && participants.some(p => p.id === user.uid)
  const isFull = !!meetup?.capacity && participants.length >= meetup.capacity

  const join = async () => {
    if (!user || !meetupId) return
    await setDoc(doc(db, 'meetups', meetupId, 'participants', user.uid), {
      name: user.displayName || user.email?.split('@')[0] || '익명',
      photo: user.photoURL || null,
      joinedAt: serverTimestamp(),
    })
    // '참여한 모임' 목록용 — 참가자 서브컬렉션을 전부 뒤지지 않도록 내 문서에도 기록한다
    try {
      await setDoc(doc(db, 'users', user.uid), { joinedMeetups: arrayUnion(meetupId) }, { merge: true })
    } catch (err) { console.error('참여 모임 기록 실패:', err) }
    try {
      await updateDoc(doc(db, 'meetups', meetupId), { participantCount: increment(1) })
    } catch { /* 카운터 실패가 참가 자체를 막지 않게 한다 */ }
  }

  const leave = async () => {
    if (!user || !meetupId) return
    await deleteDoc(doc(db, 'meetups', meetupId, 'participants', user.uid))
    try {
      await setDoc(doc(db, 'users', user.uid), { joinedMeetups: arrayRemove(meetupId) }, { merge: true })
    } catch (err) { console.error('참여 모임 기록 실패:', err) }
    try {
      await updateDoc(doc(db, 'meetups', meetupId), { participantCount: increment(-1) })
    } catch { /* 위와 동일 */ }
  }

  const addComment = async (content) => {
    if (!meetupId || !content.trim()) return
    await addDoc(collection(db, 'meetups', meetupId, 'comments'), {
      content: content.trim(),
      author: user?.displayName || user?.email?.split('@')[0] || '익명',
      authorId: user?.uid || null,
      authorPhoto: user?.photoURL || null,
      createdAt: serverTimestamp(),
    })
    try {
      await updateDoc(doc(db, 'meetups', meetupId), { commentCount: increment(1) })
    } catch { /* 위와 동일 */ }
  }

  const deleteComment = async (commentId) => {
    if (!meetupId) return
    await deleteDoc(doc(db, 'meetups', meetupId, 'comments', commentId))
    try {
      await updateDoc(doc(db, 'meetups', meetupId), { commentCount: increment(-1) })
    } catch { /* 위와 동일 */ }
  }

  return { meetup, loading, participants, comments, isJoined, isFull, join, leave, addComment, deleteComment }
}

export function formatMeetupDate(createdAt) {
  if (!createdAt) return ''
  const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
  if (Number.isNaN(d.getTime())) return ''
  const min = Math.floor((Date.now() - d.getTime()) / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  if (min < 1440) return `${Math.floor(min / 60)}시간 전`
  const day = Math.floor(min / 1440)
  if (day < 7) return `${day}일 전`
  return d.toLocaleDateString('ko-KR')
}

// 목록에 짧게 보여줄 지역명. 전체 주소에서 시/군/구 단위만 뽑는다.
// 예) "서울 중구 청계천로 1길" → "중구", 못 찾으면 앞 두 토큰
export function shortRegion(place) {
  if (!place) return ''
  const tokens = place.trim().split(/\s+/)
  const unit = tokens.find(t => /(시|군|구)$/.test(t) && t.length > 1)
  if (unit) return unit
  return tokens.slice(0, 2).join(' ')
}

// 모임 일정 표기: 클럽은 활동 주기, 나머지는 날짜(+시간)
export function scheduleText(m) {
  if (m.type === '클럽') return m.schedule || ''
  if (!m.date) return ''
  const d = new Date(`${m.date}T00:00:00`)
  const label = Number.isNaN(d.getTime())
    ? m.date
    : d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  return m.time ? `${label} ${m.time}` : label
}
