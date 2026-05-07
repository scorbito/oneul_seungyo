"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Inbox, Search, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { useAppState } from "@/lib/state/AppState";

type FriendRow = { id: string; name: string; teamId: string; desc: string };

export function FriendsScreen() {
  const { showToast } = useAppState();
  const [tab, setTab] = useState("요청");
  const [requests, setRequests] = useState<FriendRow[]>([]);
  const [query, setQuery] = useState("");
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  const trimmedQuery = query.trim();
  const searchResults = useMemo<FriendRow[]>(() => {
    return [];
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
    <AppShell activeTab="my" title="친구 관리" theme="dark">
      <a className="back-link" href="/my"><ArrowLeft size={18} /> 돌아가기</a>
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
            {requests.length === 0 ? (
              <div className="empty-state-large">
                <div className="empty-state-icon"><Inbox size={32} strokeWidth={1.8} /></div>
                <p>처리할 항목이 없어요.</p>
              </div>
            ) : null}
          </section>
        </>
      )}
    </AppShell>
  );
}
