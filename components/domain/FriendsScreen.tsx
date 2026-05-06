"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Search, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { useAppState } from "@/lib/state/AppState";

const initialRequests = [
  { id: "req-1", name: "야구광이123", teamId: "lg", desc: "서로 48명, LG" },
  { id: "req-2", name: "두산팬94", teamId: "doosan", desc: "서로 68명, 두산" },
  { id: "req-3", name: "직관러", teamId: "hanwha", desc: "추천 친구" }
];

const searchablePool = [
  { id: "user-1", name: "잠실직관러", teamId: "lg", desc: "LG 트윈스 · 직관 92경기" },
  { id: "user-2", name: "부산갈매기", teamId: "lotte", desc: "롯데 자이언츠 · 직관 41경기" },
  { id: "user-3", name: "이글스불꽃", teamId: "hanwha", desc: "한화 이글스 · 직관 67경기" },
  { id: "user-4", name: "수원성주민", teamId: "kt", desc: "KT 위즈 · 직관 23경기" },
  { id: "user-5", name: "고척돔단골", teamId: "kiwoom", desc: "키움 히어로즈 · 직관 38경기" },
  { id: "user-6", name: "랜더스1번", teamId: "ssg", desc: "SSG 랜더스 · 직관 51경기" },
  { id: "user-7", name: "타이거즈홀릭", teamId: "kia", desc: "KIA 타이거즈 · 직관 88경기" },
  { id: "user-8", name: "다이노스영원히", teamId: "nc", desc: "NC 다이노스 · 직관 19경기" },
  { id: "user-9", name: "베어스맨", teamId: "doosan", desc: "두산 베어스 · 직관 102경기" },
  { id: "user-10", name: "삼성팬예진", teamId: "samsung", desc: "삼성 라이온즈 · 직관 35경기" }
];

export function FriendsScreen() {
  const { showToast } = useAppState();
  const [tab, setTab] = useState("요청");
  const [requests, setRequests] = useState(initialRequests);
  const [query, setQuery] = useState("");
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  const trimmedQuery = query.trim();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    const lower = trimmedQuery.toLowerCase();
    return searchablePool.filter((user) => user.name.toLowerCase().includes(lower));
  }, [trimmedQuery]);

  const act = (id: string, message: string) => {
    setRequests((current) => current.filter((item) => item.id !== id));
    showToast(message);
  };

  const sendFriendRequest = (id: string) => {
    setRequestedIds((current) => (current.includes(id) ? current : [...current, id]));
    showToast("친구 요청을 보냈어요.");
  };

  return (
    <AppShell activeTab="my" title="친구 관리">
      <a className="back-link" href="/my"><ArrowLeft size={18} /> 마이로 돌아가기</a>
      <div className="friend-search">
        <Search size={16} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="닉네임으로 친구 찾기"
          aria-label="친구 닉네임 검색"
        />
      </div>
      {trimmedQuery ? (
        <section className="friend-list">
          <h3 className="friend-section-title">검색 결과 ({searchResults.length})</h3>
          {searchResults.map((user) => {
            const requested = requestedIds.includes(user.id);
            return (
              <article className="friend-row" key={user.id}>
                <TeamBadge teamId={user.teamId} size="md" />
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.desc}</span>
                </div>
                {requested ? (
                  <button type="button" className="friend-action-done" disabled>
                    <Check size={14} /> 신청됨
                  </button>
                ) : (
                  <button type="button" onClick={() => sendFriendRequest(user.id)}>
                    <UserPlus size={14} /> 신청하기
                  </button>
                )}
              </article>
            );
          })}
          {searchResults.length === 0 ? <p className="empty-inline">일치하는 사용자가 없어요.</p> : null}
        </section>
      ) : (
        <>
          <div className="segmented-control">
            {["친구", "요청", "추천"].map((item) => (
              <button className={tab === item ? "segment segment-active" : "segment"} key={item} type="button" onClick={() => setTab(item)}>{item}</button>
            ))}
          </div>
          <section className="friend-list">
            {requests.map((friend) => (
              <article className="friend-row" key={friend.id}>
                <TeamBadge teamId={friend.teamId} size="md" />
                <div>
                  <strong>{friend.name}</strong>
                  <span>{friend.desc}</span>
                </div>
                {tab === "요청" ? (
                  <>
                    <button type="button" onClick={() => act(friend.id, "친구 요청을 수락했어요.")}>수락</button>
                    <button type="button" onClick={() => act(friend.id, "친구 요청을 거절했어요.")}>거절</button>
                  </>
                ) : (
                  <button type="button" onClick={() => act(friend.id, "친구를 추가했어요.")}><UserPlus size={14} /> 추가</button>
                )}
              </article>
            ))}
            {requests.length === 0 ? <p className="empty-inline">처리할 항목이 없어요.</p> : null}
          </section>
        </>
      )}
    </AppShell>
  );
}
