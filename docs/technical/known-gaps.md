# Known Gaps — logic chưa làm thật, cần quay lại

Danh sách các chỗ hiện tại vẫn là mock/local/prototype/thiếu, dù UI đã trông
"thật". Đây là danh sách việc **còn phải làm**, không phải changelog — khi
một mục xong, xoá hẳn khỏi file này (lịch sử "đã sửa gì, sửa thế nào" nằm ở
git log, không lặp lại ở đây).

---

## ⚠️ Cần làm thủ công trên Supabase/hạ tầng thật (code đã sẵn sàng, chưa tự áp dụng)

- Áp lại `database/schema.sql` (SQL Editor) trên Supabase project thật — file
  này giờ là nguồn schema duy nhất (đã gộp toàn bộ migration cũ, kể cả 3 thay
  đổi còn thiếu trên production: `match_history` cho phép mode
  `solo_endless`, `category_bests` tách `solo_ranked_*`/`versus_ranked_*`, và
  `create_match_invite` nhận `p_rematch_room_code`). An toàn chạy lại nhiều
  lần (idempotent).
- Cấu hình Google/Discord OAuth provider trong Supabase Dashboard
  (Authentication → Providers, cần Client ID/Secret + đúng Callback URL) để
  đăng nhập OAuth chính và "Add login method" chạy thật.
- Bật **"Allow manual linking"** trong Supabase Dashboard → Authentication →
  Settings — thiếu bật thì "Add login method" báo lỗi
  `manual_linking_disabled`.

---

## 1. Gameplay — timer vẫn client-side, không chống gian lận đồng hồ

`docs/technical/README.md`: "Viewing/Answering countdown timers must be
server-controlled ... never trust client-side timing for scoring/anti-cheat."

`GameplayScreen.tsx` tự chạy `setInterval`, không server nào kiểm soát. Đã
có xử lý mất mạng (`useNetworkStatus()` tạm dừng timer, không mất round —
xem `OfflinePauseOverlay`), nhưng đó chỉ là UX chống mất tiến trình do rớt
mạng, **không phải** anti-cheat: sửa đồng hồ máy/devtools vẫn gian lận được
vì mọi tính điểm Solo hiện 100% client-side. Cần Game API/WebSocket server
thật mới đóng được — ngoài phạm vi frontend-only hiện tại.

---

## 2. Guest → tài khoản thật: chưa merge tiến trình (có chủ đích)

`docs/gameplay/README.md` § Onboarding: "On Guest → account conversion:
offer to merge local best score/level (keep the higher value)." — chưa
triển khai, kể cả ở mức UI. `MergeDialog.tsx` (`pages/auth/components/`)
còn trong code nhưng không được dùng ở đâu — giữ lại để tái sử dụng khi làm
thật. Đã hỏi lại 1 lần (2026-08-05), người dùng chọn để sau.

---

## 3. Game Select — Retry stats vẫn là retry cả loạt, không phải per-card

Màn hình: **Game Select** (`GameSelectScreen.tsx` → `GameCard`,
`components/ui/game/GameCard.tsx`). **Đã sửa (2026-08-05)** bug chính:
`gameSupabaseService.getStats()` trước đó nuốt hết lỗi Supabase (chỉ đọc
`{ data }`, bỏ qua `error`) nên nút Retry gần như không bao giờ có cơ hội
hiện ra — giờ đã đọc `error` và throw đúng, `statsError`/nút Retry hoạt
động đúng khi query thật sự lỗi.

Còn lại 1 giới hạn nhỏ, chấp nhận được: cả 5 `GameCard` vẫn dùng chung 1
`statsError`/`loadStats()` (1 endpoint trả cả 5 game cùng lúc), nên bấm
Retry ở bất kỳ card nào cũng fetch lại toàn bộ 5 game, không có cách retry
riêng 1 game. Chỉ đáng làm per-card thật nếu sau này tách endpoint theo
từng game.

---

## 4. Backend giả (MSW + mock-server) — dev-only, chưa có backend thật

Chi tiết ở [mock-auth-api.md](mock-auth-api.md). Mọi API mới đều cần thêm
vào cả `src/mocks/*-handlers.ts` và `mock-server/*.mjs` cho tới khi có
backend thật (ASP.NET Core theo kiến trúc đã chọn, hoặc Supabase thay thế
hoàn toàn — xem mục 6 về phần vẫn cần dedicated Game API).

---

## 5. Reconnect 60s không tự xử thua khi đối thủ mất kết nối thật

`docs/technical/README.md`: "Reconnect window during Versus: 60 seconds.
Timing out while disconnected counts as a loss."

Presence thật đã phát hiện đúng lúc đối thủ mất kết nối và đếm ngược 60s
chạy đúng. Hành vi hiện tại (đã sửa 2026-09-08): trong 60s đó bàn chơi
**không bị chặn** — chỉ có banner đếm ngược, người còn kết nối vẫn nộp
round bình thường; hết 60s hiện `OpponentLeftOverlay` với đúng 1 lối ra là
**về Lobby không forfeit** (`onAbandon`, không gọi RPC nào) — phòng giữ
`in_progress`, ván không tính, không đổi Elo. Client không tự tuyên bố mình
thắng: không có RPC nào cho phép 1 client "khai hộ" đối thủ thua
(`forfeit_versus_match` chỉ cho tự khai bản thân thua), nên cho phép tự xử
thắng ở đây sẽ mở lỗ hổng gian lận. **Xác nhận (2026-08-05, giữ nguyên
2026-09-08):** chưa làm RPC bên dưới ngay.

**Thiết kế đề xuất (backlog, chưa làm, cần duyệt kỹ trước khi viết migration):**
1. Heartbeat ghi xuống DB (không chỉ Presence trong bộ nhớ Realtime) — thêm
   cột `host_last_seen_at`/`guest_last_seen_at` trên `versus_rooms`, cập
   nhật qua 1 RPC `ping_versus_room(code)` gọi định kỳ 5-10s từ
   `VersusGameplayScreen` (giống heartbeat Lobby đã có, scope hẹp hơn).
2. RPC mới `claim_opponent_disconnect_forfeit(p_code)`: người chơi CÒN LẠI
   gọi, server tự so `now() - heartbeat cuối của đối thủ` bằng đồng hồ
   server (không tin tham số từ client) — đủ 60s thật mới cho finalize qua
   `finalize_versus_room(code, 'disconnect', <id đối thủ>)` (hàm đã có sẵn).
3. Đây là thay đổi migration/schema ảnh hưởng bảng điểm/Elo thật — không tự
   làm khi chưa hỏi lại.

---

## 6. Anti-cheat và tunable numbers — chưa có server-side config

`docs/technical/README.md`: cần rate-limit input/phát hiện bot, và mọi con
số điều chỉnh được (level count, timer, K-factor...) phải sống ở server-side
config, không hard-code. Migration `20260803_atomic_versus_flows.sql` đã đưa
seed, pairing, round submission, winner, forfeit, category Elo về server —
nhưng 2 yêu cầu trên vẫn cần dedicated Game API/WebSocket server, ngoài phạm
vi Supabase RPC hiện tại. Nhiều con số (base timer, level table, difficulty
multiplier...) vẫn hard-code ở frontend.

---

## 7. Game Select — Starting Level selector chưa nối Versus

Bộ chọn "cấp độ bắt đầu" (Solo Practice/Ranked) chưa có tác dụng ở Versus
(`VersusGameplayScreen` không nhận `initialLevel`) nên bị ẩn hẳn ở đó. Chưa
có trong `docs/ui/screen-interface-spec.md` — cần viết doc chính thức nếu
giữ tính năng này lâu dài.

---

## 8. Leaderboard — vài điểm còn treo

- **Mốc reset Weekly/Monthly là giả định chưa xác nhận**: tuần lịch (Thứ 2
  00:00 UTC) và tháng lịch (ngày 1 00:00 UTC) — không phải giờ Việt Nam,
  không phải rolling window. Đổi ở `getPeriodStart()` (`game.supabase.ts`)
  nếu muốn khác.
- `top100` dùng chung nhánh sort với `global-alltime` — 2 tab hiện trùng
  nhau hoàn toàn, chưa tách riêng ý nghĩa "Top 100" thật sự khác gì.

**Đã sửa (2026-08-05):** `pinnedEntry` (hàng ghim khi ngoài Top 100) trước
đó luôn trả `score: 0` và `elo: overall_elo` (sai hẳn metric — các hàng khác
trên cùng board dùng category score/elo) bất kể board/metric nào. Giờ tính
đúng theo từng nhánh board (`endless`/`weekly`/`monthly`/metric Elo/mặc
định High Score), y hệt logic dùng để dựng `entries` phía trên, chỉ scope
riêng cho user hiện tại.

---

## 9. Resume-on-reload — giới hạn còn lại (đã đóng phần chính, đây là rủi ro chấp nhận được)

Cơ chế resume dùng `sessionStorage` phía client thuần — không chống được
việc user tự sửa tay `sessionStorage` rồi nộp kết quả giả (cùng mức rủi ro
đã có ở mục 1/6, chỉ là bề mặt sửa dễ hơn). Không tự vá riêng lẻ — chờ
chung đợt với mục 6 khi có Game API thật. Không giải quyết mất tiến trình
khi đóng hẳn tab (đúng chủ đích — đây là resume "reload giữa chừng", không
phải "chơi tiếp ngày mai").

---

## 10. Backlog: đề xuất thiết kế Độ khó (chưa quyết định làm hay không)

Ghi nhận, chưa triển khai:
- Tốc độ chớp sáng theo độ khó (Easy ~0.8s, Super Hard ~0.35s).
- Tăng độ phân tán vị trí ô ở Hard/Super Hard.
- Nâng hệ số điểm/Elo cho Super Hard (vd ×2.2 → ×3.0+).
- Cơ chế Cực Hạn: ký tự nhiễu/xoay góc, lật layout bàn phím, nhịp chớp
  không đều, nhập ngược chuỗi (Reverse Recall).
- Difficulty cộng thêm độ dài chuỗi gốc trong Versus (Easy = chuẩn, Super
  Hard = +3–4 ký tự từ Round 1).

---

## 11. Còn treo sau đợt rà lỗi logic 2026-09-08 (chưa quyết định)

Đợt 2026-09-08 đã sửa: checkpoint rò rỉ qua nút Back, timeout Solo đếm 2
lần trong StrictMode, Endless dùng level rò rỉ, Profile chỉ đếm 30 trận,
Versus resume sai round / overlay chặn bàn / thoát bị forfeit, đua Accept
lời mời, ChallengeModal xử lý `accepted` nhiều lần, kênh Realtime chết khi
subscribe lại cùng topic (`openRealtimeChannel`), tie-break Versus, Quick
Match chọn difficulty, Endless mở khi hoàn thành level 10
(`completed_level_10`), Reset chỉ chơi lại round, Solo win chỉ khi hoàn
thành level 10. Lịch sử chi tiết nằm ở git log; phần dưới là việc **còn
lại**, mỗi mục cần chọn hướng trước khi làm:

- **Back trong 3s đếm ngược ở phòng chờ** (`VersusRoomScreen` →
  `handleHeaderBack`): trận đã `in_progress` nhưng thoát không forfeit
  (`leave_versus_room` ném `MATCH_IN_PROGRESS`, client nuốt lỗi rồi rời).
  Hướng 1: hiện confirm rồi gọi `forfeitMatch`. Hướng 2: coi 3s đó chưa
  phải trận thật, cho phép rời — cần ghi rõ vào docs/gameplay.
- **`match_history.score` lệch đơn vị giữa 2 người cùng trận Versus**:
  server ghi số round đúng (0..5), client ghi đè bằng điểm công thức chỉ
  khi bên đó vào màn Result. Bảng tuần/tháng đang xếp lẫn 2 loại. Hướng 1:
  `finalize_versus_room` tự tính điểm công thức cho cả 2 (cần chuyển
  `computeScore` sang SQL). Hướng 2: leaderboard Versus chỉ dùng số round.
- **Guest vẫn mở kênh Realtime `friendships:`** (`lobby.queries.ts` key
  theo `userId`, không theo `enabled`) — chỉ tốn tài nguyên.
- **Lời mời còn treo khi người gửi reload**: `ChallengeModal` không cancel
  khi unmount, đối thủ có thể accept vào phòng host đã đi. Bị chặn bởi hạn
  30s của invite + TTL 10 phút của phòng.
- **RPC xử thắng khi đối thủ mất kết nối**: vẫn là mục 5 ở trên.

**Chưa test tay** (mới có type-check + lint), cần chạy app thật trước khi
commit đợt này:
1. Solo: hết giờ chỉ tính 1 lần thua trong dev; Reset trong Pause chơi lại
   round nhưng giữ level/streak.
2. Endless Color và Grid: bàn 6 màu và 10×10 dù trước đó đã chọn level
   thấp ở Practice.
3. Versus: reload giữa trận vào đúng round kế tiếp; đối thủ tắt app → banner
   đếm ngược, bàn vẫn chơi được, hết 60s về Lobby không mất Elo; đối thủ
   quay lại rồi rớt lần 2 → đếm lại từ 60.
4. Lobby: gửi/nhận lời mời, modal không hiện lại sau khi Accept.
5. Supabase: đã apply `database/schema.sql` (hoặc `database/delta-2026-09-08.sql`)
   chưa — kiểm tra bằng `completed_level_10` tồn tại và
   `finalize_versus_room` có chứa `submitted_at`.
