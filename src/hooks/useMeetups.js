import { useState, useEffect } from 'react'
import {
  collection, addDoc, setDoc, updateDoc, deleteDoc, doc, getDoc,
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

// 내 모임 관련 목록 — 참여 중(joined)과 찜한(saved) 모임 id.
// 참가자 서브컬렉션을 전부 뒤지지 않도록 내 users 문서에 함께 기록해 둔다.
// 주최한 모임은 hostId로 구분되므로 joined에는 넣지 않는다.
export function useMyMeetupIds(user) {
  const [ids, setIds] = useState({ joined: [], saved: [] })

  useEffect(() => {
    if (!user) { setIds({ joined: [], saved: [] }); return }
    const unsub = onSnapshot(doc(db, 'users', user.uid),
      snap => setIds({
        joined: snap.exists() ? (snap.data().joinedMeetups ?? []) : [],
        saved: snap.exists() ? (snap.data().savedMeetups ?? []) : [],
      }),
      err => console.error('내 모임 목록 불러오기 실패:', err),
    )
    return unsub
  }, [user])

  const toggleSave = async (meetupId) => {
    if (!user || !meetupId) return
    const isSaved = ids.saved.includes(meetupId)
    // 응답을 기다리지 않고 먼저 반영해 하트가 즉시 바뀌게 한다
    setIds(prev => ({
      ...prev,
      saved: isSaved ? prev.saved.filter(id => id !== meetupId) : [...prev.saved, meetupId],
    }))
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { savedMeetups: isSaved ? arrayRemove(meetupId) : arrayUnion(meetupId) },
        { merge: true },
      )
    } catch (err) {
      console.error('모임 찜 저장 실패:', err)
    }
  }

  // 클럽 승인은 모임장이 하므로 신청자의 users 문서는 갱신되지 않는다.
  // 승인된 뒤 신청자가 상세를 볼 때 본인 문서에 참여 사실을 반영(자가 치유)한다.
  const syncJoined = async (meetupId, shouldBeJoined) => {
    if (!user || !meetupId) return
    const has = ids.joined.includes(meetupId)
    if (has === shouldBeJoined) return
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { joinedMeetups: shouldBeJoined ? arrayUnion(meetupId) : arrayRemove(meetupId) },
        { merge: true },
      )
    } catch (err) { console.error('참여 목록 동기화 실패:', err) }
  }

  return { joinedMeetups: ids.joined, savedMeetups: ids.saved, toggleSave, syncJoined }
}

// 모임장 관점: 내가 개설한 클럽들의 '대기 중인 가입 신청 수'를 실시간으로 센다.
// 모임 문서의 카운터는 신청자가 모임 문서를 수정할 권한이 없어 올릴 수 없으므로,
// 모임장이 자기 클럽의 requests 서브컬렉션을 직접 구독해 실제 신청 문서 수를 센다.
export function useHostedRequestCounts(user, meetups) {
  const [counts, setCounts] = useState({}) // { [meetupId]: number }

  // 내가 개설한 클럽 id — 문자열 키로 고정해 불필요한 재구독을 막는다
  const clubKey = user
    ? meetups.filter(m => m.hostId === user.uid && m.type === '클럽').map(m => m.id).join(',')
    : ''

  useEffect(() => {
    if (!user || !clubKey) { setCounts({}); return }
    const ids = clubKey.split(',')
    const unsubs = ids.map(id =>
      onSnapshot(collection(db, 'meetups', id, 'requests'),
        snap => setCounts(prev => ({ ...prev, [id]: snap.size })),
        err => console.error('가입 신청 수 불러오기 실패:', err),
      ),
    )
    return () => unsubs.forEach(u => u())
  }, [user, clubKey])

  return counts
}

// 신청자 관점: 내가 낸 클럽 가입 신청의 결과(승인/거절)를 추적한다.
// 모임장은 신청자 문서에 직접 쓸 수 없으므로, 신청자 본인 문서(requestedMeetups)에
// 신청 사실을 남겨두고 각 신청의 request/participant 문서를 읽어 결과를 판정한다.
//   - request 문서가 남아 있음        → 아직 대기 중 (결과 없음)
//   - request 사라짐 + 참여자 명단에 있음 → 승인됨
//   - request 사라짐 + 참여자 명단에 없음 → 거절됨
export function useJoinRequestOutcomes(user) {
  const [requestedIds, setRequestedIds] = useState([])
  const [outcomes, setOutcomes] = useState({}) // { [meetupId]: 'approved' | 'rejected' }

  useEffect(() => {
    if (!user) { setRequestedIds([]); return }
    const unsub = onSnapshot(doc(db, 'users', user.uid),
      snap => setRequestedIds(snap.exists() ? (snap.data().requestedMeetups ?? []) : []),
      err => console.error('내 가입 신청 목록 불러오기 실패:', err),
    )
    return unsub
  }, [user])

  useEffect(() => {
    if (!user || requestedIds.length === 0) { setOutcomes({}); return }
    const unsubs = requestedIds.map(id =>
      onSnapshot(doc(db, 'meetups', id, 'requests', user.uid), async reqSnap => {
        if (reqSnap.exists()) {
          // 아직 대기 중 — 결과 없음
          setOutcomes(prev => {
            if (!(id in prev)) return prev
            const next = { ...prev }; delete next[id]; return next
          })
          return
        }
        // 신청이 사라짐 → 참여자면 승인, 아니면 거절
        try {
          const pSnap = await getDoc(doc(db, 'meetups', id, 'participants', user.uid))
          setOutcomes(prev => ({ ...prev, [id]: pSnap.exists() ? 'approved' : 'rejected' }))
        } catch (err) { console.error('가입 결과 판정 실패:', err) }
      }),
    )
    return () => unsubs.forEach(u => u())
  }, [user, requestedIds])

  // 결과 확인(닫기) → 내 신청 추적 목록에서 제거
  const dismissOutcome = async (id) => {
    if (!user) return
    setOutcomes(prev => { const next = { ...prev }; delete next[id]; return next })
    setRequestedIds(prev => prev.filter(x => x !== id))
    try {
      await setDoc(doc(db, 'users', user.uid), { requestedMeetups: arrayRemove(id) }, { merge: true })
    } catch (err) { console.error('가입 신청 기록 삭제 실패:', err) }
  }

  return { outcomes, dismissOutcome }
}

export function useMeetup(meetupId, user) {
  const [meetup, setMeetup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState([])
  const [requests, setRequests] = useState([])
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

  // 가입 신청 목록 (클럽 승인제에서만 사용)
  useEffect(() => {
    if (!meetupId) return
    const unsub = onSnapshot(collection(db, 'meetups', meetupId, 'requests'),
      snap => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('가입 신청 불러오기 실패:', err),
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

  // 클럽은 모임장 승인 후 가입, 나머지는 즉시 참여
  const requiresApproval = meetup?.type === '클럽'
  const isJoined = !!user && participants.some(p => p.id === user.uid)
  const isPending = !!user && requests.some(r => r.id === user.uid)
  const isFull = !!meetup?.capacity && participants.length >= meetup.capacity

  const memberInfo = () => ({
    name: user.displayName || user.email?.split('@')[0] || '익명',
    photo: user.photoURL || null,
  })

  const addParticipantDoc = async (uid, info) => {
    await setDoc(doc(db, 'meetups', meetupId, 'participants', uid), { ...info, joinedAt: serverTimestamp() })
    try {
      await updateDoc(doc(db, 'meetups', meetupId), { participantCount: increment(1) })
    } catch { /* 카운터 실패가 참여 자체를 막지 않게 한다 */ }
  }

  // 즉시 참여(소셜링·원데이클래스) 또는 가입 신청(클럽)
  const join = async () => {
    if (!user || !meetupId) return
    if (requiresApproval) {
      await setDoc(doc(db, 'meetups', meetupId, 'requests', user.uid), {
        ...memberInfo(), requestedAt: serverTimestamp(),
      })
      // 신청자 본인 문서에 신청 사실을 남겨 결과(승인/거절)를 추적한다
      try {
        await setDoc(doc(db, 'users', user.uid), { requestedMeetups: arrayUnion(meetupId) }, { merge: true })
      } catch (err) { console.error('가입 신청 기록 실패:', err) }
      return
    }
    await addParticipantDoc(user.uid, memberInfo())
    try {
      await setDoc(doc(db, 'users', user.uid), { joinedMeetups: arrayUnion(meetupId) }, { merge: true })
    } catch (err) { console.error('참여 모임 기록 실패:', err) }
  }

  // 참여 취소 또는 신청 취소
  const leave = async () => {
    if (!user || !meetupId) return
    if (isPending) {
      await deleteDoc(doc(db, 'meetups', meetupId, 'requests', user.uid))
      // 본인이 취소한 신청은 '거절'로 오인되지 않도록 추적 목록에서 뺀다
      try {
        await setDoc(doc(db, 'users', user.uid), { requestedMeetups: arrayRemove(meetupId) }, { merge: true })
      } catch (err) { console.error('가입 신청 기록 삭제 실패:', err) }
      return
    }
    await deleteDoc(doc(db, 'meetups', meetupId, 'participants', user.uid))
    try {
      await setDoc(doc(db, 'users', user.uid), { joinedMeetups: arrayRemove(meetupId) }, { merge: true })
    } catch (err) { console.error('참여 모임 기록 실패:', err) }
    try {
      await updateDoc(doc(db, 'meetups', meetupId), { participantCount: increment(-1) })
    } catch { /* 위와 동일 */ }
  }

  // 모임장: 가입 신청 수락
  const approveRequest = async (req) => {
    if (!meetupId) return
    await addParticipantDoc(req.id, { name: req.name, photo: req.photo ?? null })
    await deleteDoc(doc(db, 'meetups', meetupId, 'requests', req.id))
  }

  // 모임장: 가입 신청 거절
  const rejectRequest = async (uid) => {
    if (!meetupId) return
    await deleteDoc(doc(db, 'meetups', meetupId, 'requests', uid))
  }

  const addComment = async (content, parentId = null) => {
    if (!meetupId || !content.trim()) return
    await addDoc(collection(db, 'meetups', meetupId, 'comments'), {
      content: content.trim(),
      parentId, // null이면 원댓글, 값이 있으면 대댓글
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

  return {
    meetup, loading, participants, requests, comments,
    requiresApproval, isJoined, isPending, isFull,
    join, leave, approveRequest, rejectRequest,
    addComment, deleteComment,
  }
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
