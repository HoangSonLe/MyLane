# Known Gaps — logic chưa làm thật, cần quay lại

Danh sách các chỗ hiện tại vẫn là mock/local/prototype dù UI đã trông "thật" —
ghi lại để track, không phải bug cần fix ngay. Cập nhật danh sách này khi xử
lý xong một mục (đánh dấu hoặc xoá khỏi file).

---

## 🚀 Đã hoàn thành gần đây (Supabase Realtime & Friendships System):
- **Luồng Kết Bạn 2 Chiều Chuẩn Mực**: Quản lý lời mời kết bạn qua bảng `friendships` với các trạng thái `'pending'`, `'accepted'`, `'declined'`.
- **Cơ Chế Lọc 100% Tài Khoản Cá Nhân**: Đảm bảo không bao giờ gợi ý hoặc tìm kiếm ra tài khoản chính mình.
- **Hiển Thị Trạng Thái Lời Mời Realtime**: Khi tìm kiếm bạn bè, hiển thị chính xác các trạng thái `⏳ Đang chờ xác nhận`, `✓ Bạn bè`, `📩 Đã gửi lời mời` hoặc `+ Kết bạn`.
- **Trung Tâm Thông Báo (Bell Center 🔔)**: Modal thông báo chia làm 2 tab rõ ràng (**👥 Lời mời kết bạn** và **📢 Thông báo khác**).
- **Hệ Thống Presence Heartbeat (Online / In-game / Offline)**: Định kỳ 30s gửi heartbeat cập nhật trạng thái `online`, `in_game` và `updated_at`. Bạn bè tự động ngắt về `offline` nếu ngắt kết nối quá 2 phút.
- **Tự Động Làm Mới Ngầm (Silent Auto-Polling 10s)**: Tự động quét và cập nhật danh sách bạn bè và số lượng lời mời ở cả 3 trang: Trang Chủ, Lobby và Trang Profile.
- **Lưu Kết Quả Ranked & Elo Cloud**: Solo Ranked/Versus Ranked **và Solo Practice/Endless** đều ghi `match_history` + `category_bests` (`practice_score`/`practice_level`/`highest_level`); Versus Unranked vẫn không lưu. Elo (`category_elo`) vẫn chỉ đổi ở Versus Ranked theo công thức chess-Elo/K-factor trong gameplay docs, khởi điểm 1000 và sàn 100. **🚨 CẦN CHẠY MIGRATION**: `match_history.mode` CHECK constraint trong DB thật chưa cho phép `'solo_endless'` (có từ trước khi Endless Mode tồn tại) — mọi lượt Endless của tài khoản thật hiện **throw lỗi khi ghi `match_history`** thay vì lưu thành công. Đã thêm `database/migrations/20260804_add_solo_endless_match_history_mode.sql` (và cập nhật `schema.sql`) — **phải chạy migration này trên Supabase project thật** thì Endless mới thực sự lưu được, code không tự áp dụng migration.
- **Game Select — Stats Nối Supabase Thật**: `gameSelectService.getStats()` giờ đọc `category_bests`/`category_elo` thật theo `user_id` (trước đó luôn trả về seed cố định `GAME_STATS_SEED` bất kể tài khoản). Game chưa có Ranked/Practice/Endless nào trả `bestScore`/`highestLevel` là `null` → UI hiện "—"/"Level 1", không còn hiện cấp độ giả. Guest (không có phiên Supabase Auth thật) nhận mảng rỗng, ẩn cả hàng stat.
- **Game Select — Starting Level Selector**: Thêm bộ chọn "cấp độ bắt đầu" (1 → cấp cao nhất đã đạt) cho Solo Practice/Ranked, không áp dụng cho Endless và **chưa nối cho Versus** (chọn ở đó không có tác dụng — xem mục "Starting Level chưa nối Versus" bên dưới). Chưa có trong `docs/ui/screen-interface-spec.md`.
- **Endless Mode — Guest bị chặn hoàn toàn**: `SOLO_ENDLESS` đổi thành `requiresAccount: true`; guest luôn thấy khoá + dẫn tới màn login, không còn phụ thuộc `highestLevel`.
- **Hệ Thống Phòng Đấu 1v1 Realtime Cloud (`LobbyScreen` & `versus_rooms`)**: Tách biệt luồng kết nối tạo phòng, tìm phòng khả dụng (`getAvailableRooms`), Ghép trận nhanh (`quickJoinRoom`), Vào phòng (`joinRoom`), Rời phòng tự chuyển Host (`leaveRoom`), và Bật/tắt quyền riêng tư Public/Private (`toggleRoomPrivacy`) chạy trực tiếp trên Supabase Cloud.
- **Hệ Thống Thách Đấu 1v1 Realtime (`match_invites` & `ChallengeModal`)**: Khi bấm "Thách đấu", người thách đấu chọn môn thi đấu và mở **Modal Chờ Đối Thủ Xác Nhận (đếm ngược 30s)**. Phía bạn bè nhận **Pop-up Realtime Thông báo Lời mời Thách đấu (`IncomingInviteModal`)**. Khi đối thủ bấm **✓ Chấp nhận (Accept)**, cả 2 người chơi lập tức được chuyển thẳng vào Phòng đấu 1v1! Nếu từ chối hoặc hết 30s, hệ thống báo hủy mượt mà.
- **Tắt Lời Mời Đồng Bộ Theo Tài Khoản**: Mute 5/15/30 phút được lưu bằng profile ID trong `invite_mutes`, hydrate trước listener lời mời và đồng bộ thiết bị qua Supabase Realtime. Mute Hết phiên vẫn chỉ giữ trong phiên ứng dụng hiện tại.
- **Hệ Thống Bảng Xếp Hạng Realtime (`LeaderboardScreen`)**: Tải dữ liệu xếp hạng thực tế từ Supabase Cloud. Hỗ trợ lọc theo 5 thể loại game (`number`, `alphabet`, `grid`, `sequence`, `color`), 2 tiêu chí sắp xếp (**Điểm Elo** vs **Điểm Kỷ Lục**), và cả 6 tab board đều đã nối đúng dữ liệu (**Global All-Time, Weekly, Monthly, Friends, Top 100, Endless** — xem mục 18). Tự động ghim hàng **"Hạng Của Bạn" (`pinnedEntry`)** ở đáy bảng khi người chơi nằm ngoài Top 100. **Sửa bug**: `score` từng fallback về `practice_score` khi `ranked_score` bằng 0 — khiến người chỉ chơi Practice/Endless lọt vào bảng xếp hạng Score dù docs quy định "Only Ranked games count toward records/leaderboard"; đã bỏ fallback này. **Tab `Endless`**: trước đó dùng chung `ranked_score`/`category_elo` (sai hoàn toàn — Endless không ghi 2 cột này); giờ tổng hợp `MAX(rounds_cleared)` mỗi người chơi từ `match_history` (mode `solo_endless`) theo category. **Tab `Weekly`/`Monthly`**: trước đó không lọc thời gian, ra y hệt Global All-time; giờ lọc `match_history.played_at` theo tuần/tháng lịch UTC (xem mục 18 — mốc reset là giả định, chưa xác nhận thiết kế).
- **Shared Component `<CollapsibleCard>` UI Kit**: Tách thành phần Card thu gọn/mở rộng thành Component Dùng Chung (`components/ui/card/CollapsibleCard.tsx`), tích hợp **Icon SVG Chevron (`IconChevronDown`)** xoay 90° mượt mà, áp dụng cho `EloCard`, `BestScoresCard`, `RecordStatsCard`, `FriendsCard`, `MatchHistoryCard`, `AvailableRoomsCard`.
- **Trang Chỉnh Sửa Hồ Sơ (`EditProfileScreen`)**: Đã hoàn thiện giao diện và luồng chỉnh sửa thông tin cá nhân (Tên người chơi, Handle, Bio và Avatar cá nhân), cập nhật đồng bộ lên Supabase Cloud (`profiles` table).
- **Điều Khoản Dịch Vụ & Chính Sách Bảo Mật (`TermsOfServiceModal`, `PrivacyPolicyModal`)**: Đã hoàn thiện giao diện hiển thị văn bản Điều khoản dịch vụ và Chính sách bảo mật chi tiết, mở trực tiếp từ Trang Cài Đặt hoặc Hồ Sơ mà không còn thông báo tạm thời.
- **Chế Độ Chơi Không Giới Hạn (`Endless Mode` / `SOLO_ENDLESS`)**: Đã triển khai đầy đủ chế độ Không giới hạn cho cả 5 game trí nhớ (*Number, Alphabet, Grid, Sequence, Color*). Tự động mở khóa khi người chơi đạt Level 10, tăng dần độ khó/chiều dài chuỗi sau mỗi 3 ván thắng liên tiếp và kết thúc ván ngay khi sai 1 lần.

---

## 1. Các trang còn state-switcher prototype (`StatePill`)

Đã dọn xong: Landing, Login, Home, Game Select, Gameplay, Lobby, Versus
Room, Profile, Settings, Leaderboard, **Result** (theo đúng flow đầu tiên —
xem [mock-auth-api.md](mock-auth-api.md) cho Auth, phần chat trước đó cho
Home/Game Select/Gameplay).

**Lobby + Versus Room — đã làm:**
- Bỏ `StatePill`/`ScreenState` giả ở cả 2 trang.
- `isOffline` nối qua `useNetworkStatus()` thật (banner thật, không phải
  bấm tay), tách riêng khỏi `isGuest` — trước đây 2 khái niệm này bị lẫn vào
  nhau: component tên `OfflineWall` ở cả Lobby lẫn Versus Room nhưng nội
  dung thật ra luôn là "Account required" (yêu cầu đăng nhập), không liên
  quan gì tới mất mạng. Đã đổi tên đúng bản chất: Lobby →
  `FriendStateCards.GuestWall`, Versus Room →
  `components/AccountWall.tsx`, và trigger đúng bằng `isGuest` (từ
  `useAuthStore`) thay vì `isOffline`.
- Lobby: danh sách bạn bè + Elo của chính mình nối API thật
  (`lobbyService.getFriends()` → `GET /api/lobby/friends`, có
  loading/error/retry đúng pattern Home/Game Select; guest nhận `401`).
  Elo/tên hiển thị lấy thẳng từ `UserSession` (`useAuthStore`), không cần
  fetch riêng vì đã có sẵn trong session.
- Versus Room & Thách đấu 1v1: Create/Join nối API thật (`versusRoomService.createRoom/joinRoom/getRoom`). Form tạo phòng hỗ trợ chọn Môn thi đấu, Độ khó (`easy`, `medium`, `hard`, `super_hard`), Chế độ (Xếp hạng/Đấu thường), Quyền riêng tư (Công khai/Riêng tư) và Thẻ xem trước cấu hình phòng (`PreviewCard`).
- Hệ thống Thách đấu 1v1 thời gian thực (Hybrid Realtime + Active Auto-Polling 2s): Tự động nổ Pop-up lời mời thách đấu (`IncomingInviteModal`) trên toàn ứng dụng. Hỗ trợ xem thông tin bài học/môn thi đấu và click xem Pop-up Hồ Sơ đối thủ (`FriendProfileModal`). Hỗ trợ chuyển quyền Host tự động ngầm khi rời phòng.
- Đã sửa kèm 1 bug thật phát hiện khi test: `App.tsx` không truyền
  `initialTab` cho `VersusRoomScreen`, nên bấm "Join a room" ở Lobby luôn
  mở nhầm tab Create — thêm state `roomTab` để nhớ đúng tab.
- Verify bằng Playwright thật: đăng nhập tài khoản thật (không phải guest)
  → Lobby load đúng elo/tên/bạn bè thật → Create Room ra mã phòng thật →
  Join Room với mã sai báo lỗi đúng, mã đúng vào được Ready Room.

**Còn thiếu — chưa phải multiplayer thật:**
- Không có 2 người chơi thật nào cùng nối vào 1 phòng. Vì host đợi đối thủ
  vào phòng ("waiting for opponent…"), mà chưa có server thật/SignalR, fake
  backend **tự mô phỏng** một đối thủ giả (`Mia Torres`) tự "vào phòng"
  sau ~7 giây kể từ lúc tạo phòng — đứng thay cho việc một người bạn thật
  bấm vào link mời. Nhánh Join thật sự (nhập đúng mã người khác tạo) thì
  chạy thật (network round-trip thật), nhưng chỉ hoạt động đúng nghĩa
  2-người khi chạy `VITE_MOCK_MODE=server` (mock-server là 1 process Node
  dùng chung giữa các tab/trình duyệt) — với MSW mặc định, mỗi tab có state
  riêng (Service Worker relay message về đúng tab đó) nên 2 tab MSW không
  thấy phòng của nhau.
**Result — đã làm (đóng phần lớn mục 5 + phần "Scoring Formula" của mục 10):**
- Bỏ `StatePill`/`ScreenState` giả và toggle `showVersus` prototype (không
  vào được qua điều hướng thật). Xoá `services/result/result.mock.ts`
  (`MOCK_RESULTS`/`MOCK_VERSUS`) và `pages/result/components/StatePill.tsx`
  — không còn ai dùng.
- **Vòng lặp "chơi → gửi kết quả → hiển thị lại" giờ khép kín thật sự**:
  `GameplayScreen` track số liệu cả ván (không chỉ level hiện tại) — tổng
  round thắng, tổng giây dư khi trả lời đúng, có ăn gian/sai lần nào không,
  có hoàn thành level 10 không — đóng gói thành `GameResultInput`, truyền
  qua `onGameOver` (đổi từ `() => void` sang nhận payload) → `App.tsx` giữ
  tạm → `ResultScreen` tự gọi
  `resultService.submitResult()` → `POST /api/game/result`.
- **Công thức tính điểm dùng đúng công thức trong
  `docs/gameplay/README.md` § Scoring Formula** (trước đây bị đọc sót hoàn
  toàn dù đã có sẵn trong docs, ghi nhầm là "chưa có trong docs" ở mục 10
  cũ):
  ```
  Final Score = (Base Score + Speed Bonus) × Difficulty Multiplier × Perfect Bonus × Completion Multiplier
  ```
  Cài trong `computeScore()` (`services/gameplay/game-rules.ts`, mirror
  plain-JS ở `mock-server/scoring.mjs`) — dùng chung cho cả 2 nơi tính
  (fake backend tính "thật", client tự tính lại y hệt làm fallback khi lỗi
  mạng). Các tallies được giữ riêng theo đúng nghĩa trong docs:
  - `n` trong `Base Score = 100 × n × (n-1)` = số item đúng liên tiếp cao
    nhất đạt được trong một round (`maxConsecutiveItems`), không phải tổng
    số round đã thắng (`roundsCleared`).
  - "Completed" trong Completion Multiplier = đã hoàn thành đủ số round
    thắng yêu cầu ở level 10.
  - Docs ghi mục này "(Ranked games only)" nhưng không định nghĩa công
    thức riêng cho Practice — Practice dùng cùng Base Score + Speed Bonus,
    không nhân multiplier nào, khớp với cách `MOCK_RESULTS` cũ vẫn luôn có
    `score` cho cả Practice dù không có `rankedBreakdown`.
  - Sửa luôn 1 chỗ UI-vs-docs lệch nhau: `RankedBreakdownCard.tsx` trước
    giờ vẽ "Perfect Bonus" thành dòng cộng `+200`, nhưng docs định nghĩa nó
    là **hệ số nhân** (×1.25/×1.0) — đổi UI hiển thị đúng dạng `×`.
- Guest vẫn chơi được và vẫn thấy điểm tính ra (không chặn), nhưng
  `GAME_STATS_SEED`/`MOCK_LAST_PLAYED` **không bị ghi đè** cho guest — đúng
  "guest progress has no server-side save".
- Với tài khoản thật: nộp kết quả **ghi đè luôn** `GAME_STATS_SEED` (dùng
  bởi Game Select + `GameplayScreen`'s "bestLevel" stat) và
  `MOCK_LAST_PLAYED` (dùng bởi Home's Continue card) trong bộ nhớ fake
  backend — Home/Game Select giờ phản ánh đúng ván vừa chơi, không còn số
  tĩnh không đổi.
- Error: nếu submit lỗi mạng, không chặn màn hình — tự tính lại điểm y hệt
  công thức phía client, hiện banner nhỏ "chưa đồng bộ" + Retry, đúng docs
  ("vẫn hiện điểm số local... không chặn Play Again").
- **1 bug thật phát hiện qua Playwright**: React `StrictMode` (đang bật ở
  `main.tsx`) chạy `useEffect` 2 lần ở dev, khiến `submitResult()` bị gọi 2
  lần cho cùng 1 kết quả — lần gọi thứ 2 đọc `previousBestScore` SAU khi
  lần gọi thứ 1 đã ghi đè xong, nên "Previous Best" hiện sai (bằng chính
  điểm vừa đạt được thay vì điểm cũ thật). Sửa bằng 1 `useRef` chặn lần gọi
  tự động thứ 2 cho cùng 1 object `result` (nút Retry vẫn gọi thẳng
  `submit()`, không qua cờ chặn này).
- Verify bằng Playwright thật: chơi thắng 2 round rồi cố tình thua hết ở
  Number Memory/Solo Ranked → điểm cuối tính đúng khớp tay
  (200 base + 272 speed bonus) × 1.3 × 1.00 × 0.6 = 368, "Previous Best"
  hiện đúng giá trị cũ (14) chứ không phải giá trị vừa ghi; guest chơi thì
  thấy `GuestNotice`, không có `PERSONAL BEST`/`SCORE BREAKDOWN`; Home sau
  đó hiện đúng "Continue: Number Memory" vừa chơi.

**Result — đã làm (đóng phần lớn mục 5 + phần "Scoring Formula" của mục 10):**
- Bỏ `StatePill`/`ScreenState` giả và toggle `showVersus` prototype (không
  vào được qua điều hướng thật). Xoá `services/result/result.mock.ts`
  (`MOCK_RESULTS`/`MOCK_VERSUS`) và `pages/result/components/StatePill.tsx`
  — không còn ai dùng.
- **Vòng lặp "chơi → gửi kết quả → hiển thị lại" giờ khép kín thật sự**:
  `GameplayScreen` track số liệu cả ván (không chỉ level hiện tại) — tổng
  round thắng, tổng giây dư khi trả lời đúng, có ăn gian/sai lần nào không,
  có hoàn thành level 10 không — đóng gói thành `GameResultInput`, truyền
  qua `onGameOver` → `App.tsx` giữ tạm → `ResultScreen` tự gọi
  `resultService.submitResult()` → `POST /api/game/result`.
- **Profile's `matchHistory` và `categoryBests` đã được tự động đồng bộ khi nộp kết quả** (`src/mocks/result-handlers.ts` & `mock-server/index.mjs`) — nộp ván vừa chơi lập tức xuất hiện ở đầu lịch sử đấu Profile và cập nhật kỷ lục theo từng thể loại game.
- **Solo Practice "Reveal Answer" (Xem đáp án)**: Nút "Xem đáp án" đã được thêm vào `WrongToast` khi ở chế độ `SOLO_PRACTICE`, tự động hiển thị/nổi bật đáp án đúng trên bàn cờ.
- **Dọn dẹp `ProtoPill` ở `VersusGameplayScreen.tsx`**: Đã gỡ bỏ toàn bộ 4 thanh `ProtoPill` thử nghiệm, tự động hóa luồng đấu 1v1 mô phỏng mượt mà.

**Leaderboard — đã làm:**
- Bỏ `StatePill`/`ScreenState` giả. `isOffline`/`isGuest` nối thật
  (`useNetworkStatus`/`useAuthStore`) — trước đây cả 2 đều là state bấm tay
  qua `StatePill`, kể cả `isGuest`.
- Toàn bộ bảng xếp hạng (20 người chơi khác + rank/pinned của chính mình)
  chuyển từ hàm generate **chạy client-side, có `Math.random()`** (nghĩa là
  thứ hạng người khác đổi lung tung mỗi lần re-render) sang API thật
  (`leaderboardService.getBoard({board, category, metric})` →
  `GET /api/leaderboard`), dữ liệu người khác giờ **cố định** (không random
  nữa — bảng xếp hạng thật không tự xáo mỗi lần nhìn vào), chỉ có hàng của
  chính mình là động (tên/handle/elo lấy từ session thật). Guest nhận
  `401` (App.tsx vốn đã chặn guest vào thẳng Leaderboard, đây là phòng thủ
  thêm, giống Lobby/Versus Room).
- Thêm Color Memory (category thứ 5) vào `Category`, `CATEGORIES`, và toàn
  bộ bảng seed (`BASE_SCORE`, `RANK_SEED`) — trước đó bị bỏ sót.
- Verify bằng Playwright thật: hàng của tài khoản thật hiện đúng tên/elo,
  đổi category/board vẫn giữ đúng hàng của mình, Back trả về đúng Lobby
  (không phải Home).

**Profile + Settings — đã làm:**
- Bỏ `StatePill`/`ScreenState` giả ở cả 2 trang.
- Profile: stats (Elo, best scores, record, match history) nối API thật
  (`profileService.getProfile()` → `GET /api/profile`, có
  loading/error/retry đúng pattern Home/Game Select; guest nhận `401` —
  màn hình tự hiện `GuestWall` thay vì gọi API). `username`/`elo` lấy từ
  session thật của user đăng nhập, không còn hard-code "Alex Rivera".
- Friends trên Profile giờ dùng **chung 1 nguồn thật** với Lobby
  (`lobbyService.getFriends()`), thay vì 2 danh sách mock lệch nhau như
  trước (Lobby thiếu Lena Park, Sam Okafor lại có status khác nhau giữa 2
  nơi). Lobby lọc chỉ hiện bạn online (đúng tiêu đề "Online friends"),
  Profile hiện đầy đủ kể cả bạn offline — khác biệt hợp lý, không phải bug.
- Thêm state "New account, no games yet" đúng theo
  `docs/ui/screen-interface-spec.md` § Profile ("Empty: chưa có
  history/session nào (guest **hoặc tài khoản mới**)") — trước đây code chỉ
  xử lý case guest, bỏ sót case tài khoản thật nhưng chưa chơi ván nào.
  Chưa demo được bằng mock hiện tại (mock luôn có sẵn lịch sử), nhưng logic
  đã đúng, không phải bịa thêm nút bấm giả để ép hiện.
- **Chức năng chưa có (không có trong docs) → không còn no-op câm lặng,
  giờ hiện toast "This isn't available yet" khi bấm:** Edit Profile,
  Add login method, Language, Privacy policy, Terms of service, Reset all
  progress. Trước đây các nút này có `onClick={() => {}}` hoặc
  `console.log` — bấm vào không có phản hồi gì, giống app bị lỗi. Toast
  dùng chung 1 component mới `components/ui/Toast.tsx` (tổng quát hoá từ
  `Toast` cũ chỉ có trong Settings).
- Đã thêm Color Memory (game thứ 5) vào `Category` và toàn bộ mock data
  Profile (`categoryElo`, `categoryBests`, `matchHistory`) — trước đó bị bỏ
  sót hoàn toàn kể từ khi Color Memory được thêm vào app.
- **Settings**: bỏ hẳn nhánh Empty — theo đúng
  `docs/ui/screen-interface-spec.md` § Settings ("Empty: không áp dụng"),
  xoá luôn `components/EmptyState.tsx` (không dùng ở đâu khác). Linked
  methods + 3 toggle (Notifications/Sounds/Haptics) nối API thật
  (`settingsService.getSettings()` → `GET /api/settings`) thay vì hard-code
  `useState(true)`; guest vẫn dùng được Settings (không bị chặn `401`,
  chỉ không có linked method nào — hợp lý vì âm thanh/thông báo vẫn có ý
  nghĩa cả khi chưa đăng nhập). Sửa luôn 1 bug thật: header Settings
  hard-code `aria-label="Back to Home"` dù nút Back giờ có thể về Lobby/
  Profile/Game Select tuỳ nơi đến (xem mục back-navigation ở lịch sử chat) —
  đổi thành `"Back"` chung chung, không còn nói sai đích đến.
- Verify bằng Playwright thật (cả tài khoản guest lẫn tài khoản thật):
  Profile hiện đúng Elo/tên/bạn bè/Color Memory thật; Edit Profile hiện
  toast thay vì im lặng; Settings load linked methods thật (Google/Discord),
  toggle thật hiện toast "Saved", nút "Language" hiện toast "chưa có",
  label Back đúng.

**Còn thiếu (cố ý, ghi lại để track):**
- Việc lưu thay đổi Settings (toggle Notifications/Sounds/Haptics) chỉ là
  local-optimistic — không có `PATCH /api/settings` thật nào được gọi.
  Docs Settings có nhắc tới case "lưu setting thất bại → thông báo lỗi tại
  đúng row" nhưng chưa có network layer thật cho việc ghi để case đó có ý
  nghĩa — cần quyết định trước khi làm (giống gap #5, cần một dạng "submit"
  thật).
- Add login method, Language, Reset all progress: chỉ dừng ở mức "thông báo đang phát triển" (Edit Profile, Terms of service, Privacy policy đã được phát triển hoàn chỉnh).

**Versus Gameplay — đã dọn phần prototype:** 4 thanh `ProtoPill` đã bị gỡ;
game/mode/difficulty/seed/player được nhận từ phòng thật, năm game đều dùng
rule table chung, và kết quả được chuyển sang `ResultScreen` để submit.

**Cập nhật — dòng "opponentStatus/điểm đối thủ do state cục bộ điều khiển" ở
trên đã LỖI THỜI (đã sai từ trước lần sửa này, không phải do lần sửa này gây
ra):** `VersusGameplayScreen` từ trước đã có 1 vòng poll 800ms
(`versusRoomService.getRoom(room.code)`) đọc đúng điểm/round/trạng thái
`finished` từ `versus_rooms` — tức điểm đối thủ **đã là server-authoritative**
từ trước, chỉ là qua polling chứ không phải push. Comment cũ trong code
("Room polling is the durable recovery path for Realtime loss") cho thấy ý
định ban đầu là polling chỉ nên là lớp dự phòng, nhưng phần Realtime chính
chưa từng được nối.

**Đã làm (lần này):**
- Thêm `versusSupabaseService.subscribeToRoomUpdates(code, onChange)`
  (`services/supabase/versus.supabase.ts`) — `postgres_changes` lọc theo
  `code=eq.<room code>` trên bảng `versus_rooms`. Không cần migration DB mới:
  bảng này đã nằm trong `supabase_realtime` publication từ trước
  (`database/schema.sql` dòng 307). Expose qua `versusRoomService.subscribeToRoomUpdates()`.
- `VersusGameplayScreen` giờ gọi `subscribeToRoomUpdates` cùng lúc với vòng
  poll 800ms hiện có, cả 2 cùng gọi 1 hàm `syncRoom()` — bất kỳ round nào đối
  thủ nộp (`submit_versus_round` RPC ghi thẳng vào row) đẩy update gần như
  ngay lập tức qua WebSocket, còn poll 800ms **vẫn giữ nguyên** làm lớp dự
  phòng khi mất kết nối Realtime (đúng ý định ban đầu trong comment cũ, không
  xoá polling).
- Người tiêu thụ duy nhất của thay đổi này là `syncRoom()` đã có sẵn — không
  cần viết lại logic map điểm/outcome nào, chỉ thêm 1 tín hiệu kích hoạt sớm
  hơn cho đúng hàm đó.

**Đã làm thêm — disconnect detection thật (đóng nốt phần "dead code" ở trên):**
- Thêm `versusSupabaseService.subscribeToRoomPresence(code, userId, onSync)`
  (`services/supabase/versus.supabase.ts`) dùng **Supabase Presence** (khác
  `postgres_changes` ở trên) — mỗi client `track()` chính mình trên kênh
  `versus_room_presence:<code>`, `onSync` nhận đúng danh sách user id đang
  thật sự kết nối. Tab đóng/rớt mạng/crash tự động rời kênh, không cần bảng
  heartbeat mới, không cần polling `updated_at`. Expose qua
  `versusRoomService.subscribeToRoomPresence()`.
- `VersusGameplayScreen` giờ subscribe kênh này riêng (tách khỏi effect
  poll/push điểm số) và **thực sự set** `OpponentStatus.RECONNECTING` khi đối
  thủ vắng mặt liên tục quá 4 giây (grace period chống flash khi chỉ là
  WebSocket tự reconnect chớp nhoáng), rồi trả về `CONNECTED` ngay khi
  presence báo đối thủ có mặt lại. Thêm `opponentPresentRef` để vòng
  poll/push điểm số (effect khác) không ghi đè nhầm trạng thái RECONNECTING
  về CONNECTED/ANSWERED trước khi đối thủ thật sự quay lại.
- Đếm ngược 60s + `ReconnectingOverlay` (mục 9) giờ **tự kích hoạt thật** khi
  đối thủ mất kết nối thật, không còn là dead code.
- **Cố ý KHÔNG làm** (giữ nguyên đúng thiết kế + comment đã có sẵn trong
  code): khi đếm ngược hết 60s, client vẫn KHÔNG tự tuyên bố mình thắng —
  chuyển sang `ScreenState.ERROR` như cũ. Tự cho client quyền phán quyết thắng
  thua khi đối thủ mất kết nối là một quyết định bảo mật/toàn vẹn dữ liệu
  (client không được tự thưởng chiến thắng cho chính mình) — cần 1 RPC server
  mới (kiểu `claim_opponent_disconnect_forfeit`) xác thực độc lập việc mất kết
  nối rồi mới được xử thua hộ, đây là thay đổi database/migration, không tự
  làm khi chưa hỏi lại.
- `versusSupabaseService.subscribeToRoom()` (kênh `broadcast`, khác cả
  `subscribeToRoomUpdates()` lẫn `subscribeToRoomPresence()` ở trên) vẫn là
  code chưa từng được gọi ở đâu — không đụng vào, chỉ ghi chú để không nhầm
  3 cơ chế với nhau.

**Còn thiếu — chưa phải trận realtime "server làm nguồn sự thật" tuyệt đối:**
- Anti-cheat (rate-limit input, xác thực đáp án thật) vẫn cần dedicated Game
  API/WebSocket server — xem mục 11, ngoài phạm vi Supabase RPC hiện tại.

---

## 2. `pages/game/SequenceMemoryScreen.tsx` — file mồ côi

Không được `App.tsx` hay bất kỳ screen nào khác import. Là bản nháp Sequence
Memory độc lập từ trước khi có `GameplayScreen` dùng chung template cho cả 4
game. Chưa quyết định: xoá hẳn, hay giữ lại tham khảo rồi xoá sau. Cần hỏi lại
trước khi động vào (đã hỏi 1 lần, người dùng chọn sửa `GameplayScreen.tsx`
thật — file này chưa được xử lý).

---

## 3. Gameplay — timer chạy hoàn toàn client-side

`docs/technical/README.md` (Implementation-Critical Rules) yêu cầu:

> Viewing/Answering countdown timers must be server-controlled — the client
> only displays them; never trust client-side timing for scoring/anti-cheat.

Hiện tại `GameplayScreen.tsx` tự tạo timer bằng `setInterval` ngay trong
component, không có server nào kiểm soát.

**Đã làm một phần** (bản "thật nhất có thể" hiện giờ, chưa phải server-
controlled timer thật): khi mạng thật sự mất (`useNetworkStatus()`) trong
lúc `phase === 'answering'`, timer đếm ngược **tạm dừng** (không reset) và
hiện `OfflinePauseOverlay` — khi có mạng lại, đếm tiếp từ đúng giây đã dừng,
không mất round. Xem effect tách riêng "reset" vs "tick" trong
`GameplayScreen.tsx` và component
`pages/gameplay/components/OfflinePauseOverlay.tsx`. Đã test bằng Playwright
(`context.setOffline`): timer đứng yên khi mất mạng, chạy tiếp đúng giá trị
khi có mạng lại, không force thua, không reset round.

Vẫn còn thiếu so với docs — chỉ dùng tín hiệu mạng thật (`navigator.onLine`),
**không phải** server-controlled timer thật:
- Không chống được gian lận sửa đồng hồ máy/devtools (docs: "never trust
  client-side timing for scoring/anti-cheat") — vẫn hoàn toàn tin client.
- Chưa có khái niệm "mất kết nối tới server" thật vì chưa có server nào để
  mất kết nối tới — chỉ đang phát hiện "máy không có mạng" nói chung.
- Cần hạ tầng thật (SignalR/timer service phía backend) mới đóng được gap
  này hoàn toàn — ngoài phạm vi frontend-only hiện tại.

---

## 4. Versus — shared seed đã nối, nguồn sinh vẫn chưa authoritative

`docs/technical/README.md`:

> Versus matches must use a single server-generated `seed` so both players
> receive an identical puzzle.

`VersusGameplayScreen.tsx` không còn tự sinh seed. Seed được tạo cùng phòng,
persist trong `versus_rooms`, truyền qua Room → App → Gameplay, rồi dùng PRNG
xác định theo round/game nên hai client nhận cùng đề khi cùng đọc một phòng.

Phần còn thiếu: nhánh Supabase hiện vẫn sinh seed ở client tạo phòng trước khi
insert. Vì vậy đã đóng lỗi "mỗi client một seed", nhưng chưa đáp ứng tuyệt đối
yêu cầu **server-generated**. Cần database default/RPC hoặc match service phía
server cấp seed.

---

## 5. Pipeline kết quả — ĐÃ NỐI, còn thiếu server authority cho Versus

**Cập nhật:** đã làm — xem mục 1 "Result — đã làm" để biết chi tiết đầy đủ.
`GameplayScreen` giờ đóng gói kết quả, `ResultScreen` tự submit qua
`POST /api/game/result`, cả `GAME_STATS_SEED` (Game Select) lẫn
`MOCK_LAST_PLAYED` (Home) đều được cập nhật thật trong bộ nhớ fake backend.

`Profile.matchHistory`/`categoryBests` đã được cập nhật ở cả MSW và standalone
mock server. Versus cũng đóng gói outcome/opponent Elo và đi qua cùng pipeline;
chỉ Versus Ranked mới đổi Elo.

Còn thiếu: điểm/trạng thái đối thủ chưa do server authoritative xác nhận, nên
kết quả Versus hiện vẫn phụ thuộc mô phỏng client (xem mục 1).

---

## 6. Guest → tài khoản thật: chưa merge, đã bỏ hẳn UI (quyết định có chủ đích)

**Cập nhật:** trước đây `LoginScreen.tsx` có `MergeDialog` (khi `fromGuest`)
nhưng chỉ là UI rỗng — `handleMerge()` đóng dialog rồi gọi `onSuccess()`,
không so sánh/merge progress local nào thật. Đã quyết định **gỡ hẳn**
`MergeDialog`/`showMergeDialog`/`handleMerge`/`handleSkip` khỏi
`LoginScreen.tsx` thay vì giữ lại một UI không làm gì — không triển khai
merge ở bản hiện tại. `onSuccess()` giờ gọi thẳng sau khi login/register
thành công, bất kể `fromGuest`.

Component `MergeDialog.tsx` vẫn còn trong `pages/auth/components/` (không
xoá file) để tái sử dụng khi merge thật được làm.

Docs (`docs/gameplay/README.md` § Onboarding):

> On Guest → account conversion: offer to merge local best score/level (keep
> the higher value).

Dòng trên **chưa được triển khai** — không có bước sync/merge nào xảy ra khi
guest chuyển sang tài khoản thật, kể cả ở mức UI.

---

## 7. Game Select — Retry stats là retry cả loạt, không phải per-card

Mỗi `GameCard` có nút "Retry" riêng khi `statsError`, nhưng tất cả cùng gọi
chung `loadStats()` (fetch lại toàn bộ `/api/game-select/stats`), không có
cách retry riêng một game. Chấp nhận được cho hiện tại (chỉ 1 endpoint trả
cả 5 game cùng lúc), nhưng nếu sau này tách endpoint theo từng game thì nên
làm retry thật sự per-card.

---

## 8. Backend giả (MSW + mock-server) là dev-only, chưa có backend thật

Đã ghi chi tiết ở [mock-auth-api.md](mock-auth-api.md) — nhắc lại ở đây vì
mọi API mới (`/api/home`, `/api/game-select/stats`, và tương lai
`/api/game/result` ở mục 5) đều cần thêm vào **cả hai** nơi
(`src/mocks/*-handlers.ts` và `mock-server/*.mjs`) cho tới khi có ASP.NET
Core thật.

---

## 9. Reconnect window — state/UI đúng 60s, nhưng KHÔNG tự chuyển thành thắng

`docs/technical/README.md`:

> Reconnect window during Versus: **60 seconds**. Timing out while
> disconnected counts as a loss.

**Sửa lại mô tả cũ ở đây (trước ghi sai là "ĐÃ ĐÓNG"/"chuyển sang Result với
outcome thắng"):** State và vòng tròn overlay đều dùng đúng 60 giây, và trigger
này giờ đã thật (xem mục 1 "Versus Gameplay" — Supabase Presence phát hiện mất
kết nối thật, không còn là dead code). Nhưng khi countdown về 0,
`VersusGameplayScreen` **không** tự chuyển sang Result với outcome thắng —
chuyển sang `ScreenState.ERROR` (màn hình lỗi + nút Quit), đúng theo comment
sẵn có trong code: client không được tự thưởng chiến thắng cho chính mình khi
đối thủ mất kết nối, vì không có cách nào xác thực độc lập việc đó từ phía
client. Cần 1 RPC server mới xác nhận forfeit-do-disconnect rồi mới đóng được
đúng nghĩa "Timing out while disconnected counts as a loss" — đây là việc
backend/migration, chưa làm.

---

## 10. Rule 5 game — đã fix phần lớn, còn vài mục chưa làm

Đối chiếu `pages/gameplay/GameplayScreen.tsx` với
`docs/gameplay/{README,number-memory,alphabet-memory,grid-memory,sequence-memory,color-memory}.md`.
Sau khi audit (bảng lệch chi tiết ở lịch sử git của file này), đã **fix theo
yêu cầu rõ ràng của user** — xem `src/services/gameplay/game-rules.ts` (bảng
level cho cả 5 game, có comment trỏ tới đúng dòng doc nguồn) và
`GameplayScreen.tsx`. Đã verify bằng Playwright thật (không chỉ đọc code):
tự đọc số được gán cho từng ô trong lúc Viewing, tap lại đúng thứ tự, kiểm
tra thắng/thua/timer/level đúng như kỳ vọng.

**Đã fix:**
- Lên level cần thắng `roundsToWin` round liên tiếp cùng level (5 cho
  Number/Alphabet/Sequence, 3 cho Grid) — không còn lên ngay sau 1 round
  đúng.
- Game Over khi thua đủ `roundsToWin` round tại cùng level — áp dụng cho
  **mọi mode** (kể cả Solo Practice), không còn phân biệt Ranked-ends-on-
  first-mistake / Practice-retry-vô-hạn như trước. `PromptBar` nhận
  `isGameOver` thay vì tự suy từ `mode`.
- Difficulty (Easy/Medium/Hard/Super Hard) được nối từ Game Select →
  `App.tsx` → `GameplayScreen`, cộng đúng số giây vào viewTime/answerTime
  (Grid: 18s/40s base; Number/Alphabet/Sequence: xem ghi chú "còn thiếu" bên
  dưới về base time chưa có số cụ thể trong docs).
- Elo không còn bị cộng/trừ trong Solo (`GameplayScreen` chỉ phục vụ Solo —
  Versus có `VersusGameplayScreen` riêng) — đúng docs "Elo ... calculated
  only for Versus Ranked matches".
- **Number Memory**: độ dài theo bảng level thật (6→15 qua 10 level), digit
  chỉ 1–9 (bỏ 0).
- **Alphabet Memory**: độ dài theo cùng bảng Number Memory, bộ ký tự đúng
  36 ký tự (digit 0–9 + A–Z) — `AlphabetBoard` thêm hẳn 1 hàng phím số vì
  bàn phím cũ không có cách nào nhập digit dù sequence có thể chứa digit.
- **Sequence Memory**: board vẽ lại thành lưới 3×3 gồm 9 ô **giống hệt
  nhau, không màu riêng** (bản cũ chỉ có 4 ô, mỗi ô 1 màu khác nhau — sai
  hẳn cấu trúc bàn cờ so với docs "3×3 grid of blank, identical tiles"), độ
  dài theo bảng level thật (4→13), gap giữa các tile đổi từ 200ms sang
  300ms đúng doc. `VersusGameplayScreen` (dùng chung `SequenceBoard`) cũng
  được chỉnh phạm vi sinh số 0–3 → 0–8 cho khớp 9 ô mới, không đổi rule
  Versus nào khác.
- **Grid Memory** (game sai nhiều nhất): bảng 10 level đúng docs (kích
  thước lưới không-vuông tăng dần 5×5 → 10×10, `beginCount` 8 → 26), grid
  không còn bị chặn cứng ở tối đa 5×5. Thêm cơ chế wrong-tap-penalty đúng
  docs: tap sai → flash đỏ, trừ 3s khỏi giờ còn lại, đặt cờ "đã sai" —
  hoàn thành đúng hết phần còn lại vẫn tính thua nếu cờ đó bật. Sửa luôn 1
  bug phát hiện khi viết test: ô lưới trước đây luôn hiện SỐ VỊ TRÍ của
  chính nó (1..25 cho lưới 5×5) bất kể có phải ô "cần nhớ" hay không, và
  thứ tự đúng được tính theo **chỉ số ô** thay vì **số được gán ngẫu
  nhiên** — tức là chưa từng đúng game "Chimpanzee Memory" thật. Giờ chỉ
  đúng `beginCount` ô hiện số (1..beginCount theo thứ tự sinh ngẫu nhiên),
  ô còn lại luôn để trống, và thứ tự tap đúng theo số được gán, không theo
  chỉ số ô.

**Đã fix thêm (sau khi làm Result — xem mục 1 "Result — đã làm"):**
- **Scoring Formula** — đã cài đúng công thức trong docs, dùng thật khi
  submit kết quả. Trước đây ghi nhầm là "không có trong docs"; thật ra
  docs đã có sẵn đầy đủ công thức, chỉ là chưa đọc hết + chưa có pipeline
  để dùng tới.
- **Perfect Bonus tracking** — đã track (`perfectRef` trong
  `GameplayScreen.tsx`, reset mỗi khi `resetRound()`).
- **Pause/Resume/Reset** — Pause đóng băng cả timer lẫn callback chuyển phase;
  Resume tiếp tục đúng thời gian còn lại; Reset/Quit có xác nhận và huỷ callback
  cũ; Settings âm thanh/haptic mở dưới dạng sub-overlay.
- **Tutorial một lần mỗi game family** — hoàn thành hoặc Skip đều được lưu local
  để lần chơi sau không hiện lại.
- **Hoàn thành Level 10** — chỉ đánh dấu completed sau khi thắng đủ streak ở
  Level 10, không còn đánh dấu ngay lúc vừa bước vào level.
- **Versus Elo + Reveal Answer** — chess-Elo/K-factor đã dùng cho Versus Ranked;
  Solo Practice có thể reveal/replay đúng cho Number, Alphabet, Grid, Sequence
  và Color.

**Còn thiếu, chưa làm (cố ý, không tự bịa số)**:
- **Grid Memory Simple/Full display layout toggle** — chưa làm, tính năng
  phụ (settings trong lúc chơi), không phải core win/lose rule.
- **Endless Mode UI/unlock persistence** — rule cho Number/Alphabet/Grid/
  Sequence có trong gameplay docs nhưng Game Select chưa có entry/flow thật;
  Color ghi rõ chưa định nghĩa công thức Endless. **Missing in source
  documentation:** flow sản phẩm chính xác để chọn/tiếp tục Endless và rule
  Endless cho Color.
- **Base viewTime/answerTime cho Number/Alphabet/Sequence** — khác Grid
  Memory (có số cụ thể 18s/40s trong docs), 3 game này chỉ nói tên biến
  `viewTime`/`answerTime` mà **không cho số mặc định**. Difficulty-seconds
  đã được cộng đúng vào, nhưng con số NỀN (trước khi cộng difficulty) vẫn
  là công thức tự chọn cũ (scale theo độ dài), không có nguồn từ docs — ghi
  rõ trong comment code, không tự bịa số thay cho docs.

---

## 11. Anti-cheat và tunable numbers — mới có authority ở lifecycle

Migration `20260803_atomic_versus_flows.sql` đã chuyển các phần sau về server:
shared seed, `start_at`, queue pairing, round submission idempotent/theo thứ tự,
winner, forfeit và category Elo. Vì vậy client không còn tự sinh điểm đối thủ
hay tự quyết định Elo.

`docs/technical/README.md` (Implementation-Critical Rules) vẫn còn 2 yêu cầu
chưa thể hoàn tất trong frontend/Supabase lifecycle RPC:

> Basic anti-cheat: rate-limit input speed, detect abnormal/bot-like input
> patterns.

> All tunable numbers (level count, timers, mode coefficients, K-factor,
> etc.) live in server-side config, not hard-coded in core logic.

Viewing/Answering timer, xác thực đáp án và reconnect timeout vẫn cần dedicated
Game API/WebSocket server; client hiện vẫn chạy timer hiển thị/gameplay. Nhiều
con số (base timer cho một số game, level tables, difficulty multiplier...)
vẫn hard-code trong frontend. Đây là yêu cầu ở tầm backend/hạ tầng
(server-side config service, rate limiting), không phải thứ frontend tự làm
được — cần triển khai cùng ASP.NET Core/Go Game Server đã mô tả trong kiến trúc.

---

## 12. Hai contract dữ liệu Ranked cần quyết định schema

- Gameplay docs yêu cầu overall Elo là **weighted average** của 5 category
  Elo, nhưng không định nghĩa trọng số. Matchmaking và Versus hiện đã dùng
  category Elo authoritative; match finalizer cố ý chưa tự cập nhật
  `profiles.overall_elo`. **Missing in source documentation:** trọng số và
  cách xử lý category chưa từng chơi.
- Gameplay docs yêu cầu best score theo `category + mode`, trong khi
  `category_bests` hiện chỉ có một cặp `ranked_score/ranked_level`, nên Solo
  Ranked và Versus Ranked dùng chung kỷ lục. Cần migration/schema contract
  riêng cho từng mode trước khi tách mà không làm mất dữ liệu hiện có.
- Result của Versus ghi nút Tái đấu, nhưng `App.tsx` hiện đưa người chơi về
  Quick Match; flow gửi/accept/decline rematch với đúng đối thủ chưa có API
  hoặc event contract phía server.

---

## 13. Đề xuất cải tiến thiết kế Độ khó trong tương lai (Backlog)

Ghi nhận đề xuất nâng cao ý nghĩa và sức nặng cho lựa chọn Độ khó (Difficulty Mode):
- **Tốc độ hiển thị & chớp sáng (Preview & Flash Tempo)**: Điều chỉnh `flashDuration` và `gapDuration` theo độ khó (Easy chớp chậm ~0.8s, Super Hard chớp nhanh ~0.35s) để tăng áp lực nhịp độ xử lý.
- **Độ phức tạp phân bố mẫu (Pattern & Position Complexity)**: Ở Hard/Super Hard, tăng độ phân tán ô (nằm ở các góc/rải rác) hoặc các bước nhảy ít dự đoán được.
- **Tăng khoảng cách phần thưởng (Risk & Reward Scaling)**: Nâng hệ số điểm và thưởng Elo cho Super Hard (ví dụ: nâng hệ số từ ×2.2 lên ×3.0+) để tạo động lực chọn thử thách mạo hiểm.
- **Cơ chế Cực Hạn (Extreme / Hardcore Mechanics)**:
  - Visual Distractors: Ký tự màu ngẫu nhiên / xoay góc nghiêng 15°–45°, bộ ký tự phân biệt Hoa/Thường (`A-z`) hoặc ký tự đặc biệt (`@#$%`).
  - Dynamic Grid & Traps: Xoay lật layout bàn phím 180° / lật gương ở pha Answering, hoặc ô bẫy giả mạo.
  - Variable Tempo & Ghost Flashes: Nhịp chớp không đều (0.15s vs 0.7s) và hiệu ứng chớp bóng mờ giả.
  - Reverse Recall: Yêu cầu nhập ngược chuỗi từ cuối lên đầu.
- **Tăng độ dài chuỗi theo Độ khó trong Versus (Difficulty-Based Length Scaling)**: Cho phép độ khó phòng Versus tác động cộng thêm độ dài ký tự/ô số vào chuỗi gốc của từng round (ví dụ: Easy = độ dài chuẩn, Super Hard = cộng thêm +3 đến +4 ký tự ngay từ Round 1) cho các đối thủ muốn trận đấu căng thẳng kéo dài hơn.

---

## 14. Resume-on-reload — ĐÃ ĐÓNG

**Vấn đề gốc:** Trước đây toàn bộ điều hướng màn hình (`App.tsx`'s `history`)
và tiến trình ván đấu (`level`/`winStreak`/board state trong
`GameplayScreen.tsx`) chỉ sống trong React `useState`/`useRef` thuần — không
có URL routing, không có `localStorage`/`sessionStorage` nào lưu lại. Bất kỳ
reload thật sự nào (F5 vô tình, mobile tab bị OS thu hồi bộ nhớ khi chuyển
app rồi quay lại, Vite full-reload khi dev) đều đưa app về `LandingScreen`,
và nếu còn phiên đăng nhập hợp lệ thì tự nhảy thẳng vào Home — mất hẳn màn
hình/tiến trình đang chơi (Solo lẫn Versus), kể cả khi phòng Versus vẫn còn
sống trên Supabase.

**Đã làm:**
- `lib/utils/session-resume.ts`: snapshot `{screen, session, roomCode,
  roomEntrySource}` vào `sessionStorage` (không phải `localStorage` — đây là
  state của phiên hiện tại, không phải progress cần giữ vĩnh viễn). `App.tsx`
  tự đồng bộ snapshot này mỗi khi `screen` đổi: còn ở 1 trong 3 màn hình
  "đang chơi dở" (`game`, `versus-room`, `versus-game`) thì lưu, rời khỏi thì
  xoá — nên snapshot luôn tự dọn sạch sau khi ván kết thúc/Quit/logout, không
  cần xử lý riêng từng nơi.
- `LandingScreen` (nơi mọi reload luôn đi qua đầu tiên) nhận thêm
  `resumeTarget`/`onResume`: sau khi `checkSession()` xác nhận có tài khoản
  thật (không phải guest) VÀ có snapshot chờ sẵn, gọi `onResume` thay vì
  `onPlayNow()` mặc định.
- **Solo (`game`)**: khôi phục thẳng `session` (game/mode/difficulty) và vào
  lại màn Gameplay.
- **Versus (`versus-room`/`versus-game`)**: KHÔNG tin thẳng màn hình đã lưu —
  gọi lại `versusRoomService.getRoom(roomCode)` để lấy trạng thái thật từ
  server rồi tự quyết định đích đến theo `room.status`
  (`in_progress` → vào thẳng ván đấu, `waiting` → Ready Room, đã
  `finished`/không tìm thấy → về Lobby). Đúng tinh thần server-authoritative
  đã có sẵn từ migration `20260803_atomic_versus_flows.sql` — client chỉ cache
  1 `roomCode`, không tự dựng lại state phòng.
- **Solo Gameplay checkpoint** (`lib/utils/gameplay-checkpoint.ts`): riêng
  `GameplayScreen.tsx` tự lưu tiến trình chi tiết hơn (level, win-streak, loss
  count, và toàn bộ tally dùng cho Scoring Formula — `roundsCleared`,
  `maxConsecutiveItems`, `bonusSeconds`, `perfect`, `reachedMaxLevel`) mỗi khi
  qua 1 round, khoá theo đúng `(gameType, mode, difficulty)` để không lỡ khôi
  phục nhầm game khác. Xoá khi ván kết thúc tự nhiên (`finishGame`) hoặc khi
  người chơi chủ động Reset/Quit (`resetRound`).
- **Cố ý (không phải sót)**: bấm nút Back ở header (`GameplayHeader`, khác với
  nút Back trong `WrongToast` — cái đó có gọi `resetRound()`) KHÔNG xoá
  checkpoint. Quay lại đúng game/mode/difficulty đó trong cùng phiên (chưa
  reload) sẽ tự tiếp tục đúng level/streak cũ thay vì bắt đầu lại từ đầu — coi
  đây là tiện ích phụ của cùng cơ chế (không chỉ chống reload, còn giữ tiến
  trình khi đi lui/tới trong Game Select), không phải lỗi.

**Cố ý KHÔNG resume (ghi lại để không ai tưởng nhầm là bug):**
- **Guest chơi Solo**: không resume — guest không có identity bền vững qua
  reload (đúng nguyên tắc đã ghi ở mục 6 "guest progress has no server-side
  save"), nên `LandingScreen` chỉ gọi `onResume` khi `checkSession()` xác
  nhận tài khoản thật.
- **Matchmaking**: không resume — hàng đợi đã tự hết hạn phía server sau
  60 giây (mục 1 trong audit matchmaking bên dưới), tìm trận lại từ đầu rẻ
  hơn và an toàn hơn là cố khôi phục 1 attempt có thể đã hết hạn.
- **Result**: không resume — điểm đã được `submitResult()` ghi server-side
  trước khi tới màn Result, nên reload ở đây không mất dữ liệu thật, chỉ mất
  màn hình tóm tắt (chấp nhận được, quay về Home).
- **Board state giữa round** (chuỗi đang xem, ô đang sáng, số giây còn lại
  của timer) KHÔNG được khôi phục — chỉ khôi phục tiến trình bền
  (level/streak/tally) ở ranh giới round. Vào lại sẽ bắt đầu round mới ở đúng
  level đã dừng, thay vì cố dựng lại 1 chuỗi đang xem dở — an toàn hơn nhiều
  (không phát lại 1 phần chuỗi, không đồng bộ lại timer client-side, xem thêm
  mục 3 "timer chạy hoàn toàn client-side" — vẫn còn nguyên, không liên quan
  tới thay đổi này).

**Còn thiếu (ngoài phạm vi, cần hạ tầng khác):**
- Đây vẫn là resume phía client — không chống được việc user cố tình sửa
  `sessionStorage`. Không phải anti-cheat, chỉ là UX chống mất tiến trình do
  reload ngoài ý muốn. Cụ thể hơn: checkpoint Solo Gameplay lưu thẳng cả các
  tally dùng cho Scoring Formula (`roundsCleared`, `maxConsecutiveItems`,
  `bonusSeconds`, `perfect`, `reachedMaxLevel`), nên sửa tay `sessionStorage`
  rồi thua 1 round để nộp kết quả là có thể nộp điểm giả — **cùng mức rủi ro
  đã có sẵn từ trước** ở mục 3/11 (toàn bộ Solo scoring vốn đã 100% client-side,
  không có xác thực server), chỉ là bề mặt sửa dễ hơn (sửa 1 chuỗi JSON trong
  DevTools Application tab, không cần đụng tới JS runtime). Không tự vá ở đây
  — chờ chung 1 đợt với mục 11 (server-side config/anti-cheat) khi có Game API
  thật, tránh vá nửa vời riêng lẻ.
- Không giải quyết mất tiến trình khi đóng hẳn tab/trình duyệt (khác PWA/app
  gốc) — `sessionStorage` bị xoá cùng tab, đúng chủ đích (đây là resume "reload
  giữa chừng", không phải "tiếp tục ván cũ ngày mai").
- `RESUMABLE_SCREENS` (`App.tsx`) là 1 danh sách hard-code riêng, không tự suy
  ra từ đâu khác — thêm 1 màn hình "đang chơi dở" mới trong tương lai (nếu có)
  cần nhớ thêm tay vào đây. Chấp nhận được ở quy mô 3 màn hình hiện tại; chưa
  đáng để dựng 1 cơ chế metadata-per-screen tổng quát hơn cho 3 mục.

---

## 15. RPC forfeit-do-disconnect (thiết kế backlog, CHƯA LÀM)

**Mục tiêu:** đóng đúng nghĩa yêu cầu trong `docs/technical/README.md`:

> Reconnect window during Versus: **60 seconds**. Timing out while
> disconnected counts as a loss.

Hiện tại (sau khi làm xong phần Presence ở mục 1 "Versus Gameplay"): đếm
ngược 60s đã **kích hoạt thật** khi đối thủ mất kết nối thật, nhưng khi hết
giờ, client chỉ chuyển sang `ScreenState.ERROR` (màn lỗi + Quit) — KHÔNG tự
xử đối thủ thua/mình thắng. Đây là chủ đích, không phải thiếu sót: client
không được quyền tự phán quyết thắng-thua khi đối thủ mất kết nối, vì không
có gì ngăn 1 client gian lận tự gọi thẳng RPC hiện có
(`forfeit_versus_match`) để cướp thắng trong khi đối thủ vẫn đang chơi bình
thường — RPC đó chỉ cho tự khai bản thân thua (`p_forfeiter_id := auth.uid()`
= chính người gọi), không có nhánh nào cho "khai hộ" người khác.

**Thiết kế đề xuất (cần làm ở đợt sau, có động tới migration/schema):**

1. **Heartbeat ghi xuống database, không chỉ Presence trong bộ nhớ Realtime
   server.** Presence hiện tại (mục 1) chỉ tồn tại phía Realtime server, DB
   không biết gì về nó — không dùng để RPC xác thực được. Cần 1 trong 2:
   - Thêm cột kiểu `host_last_seen_at`/`guest_last_seen_at` (hoặc 1 bảng
     `versus_room_presence` riêng) trên `versus_rooms`, cập nhật qua 1 RPC nhỏ
     (`ping_versus_room(code)`) mà mỗi client tự gọi định kỳ (5-10s) trong khi
     còn ở màn `VersusGameplayScreen` — tương tự cơ chế heartbeat 30s đã có
     sẵn cho Lobby (`lobbyService.updatePresence`), chỉ scope hẹp hơn cho 1
     trận đấu.
   - Hoặc dùng Supabase Edge Function lắng nghe Presence phía server (không
     qua client) rồi tự ghi DB khi phát hiện leave — "sạch" hơn vì hoàn toàn
     không đi qua client, nhưng phức tạp hạ tầng hơn (cần deploy Edge
     Function riêng).
2. **RPC mới**, ví dụ `claim_opponent_disconnect_forfeit(p_code TEXT)`:
   - Người chơi CÒN LẠI gọi (không phải người mất kết nối).
   - Bên trong, server tự so `now() - <heartbeat cuối của đối thủ>` — chỉ
     finalize nếu **server** thấy đã quá 60 giây thật (dùng đồng hồ server,
     tuyệt đối không tin bất kỳ tham số "đã đủ 60s" nào client gửi lên).
     Chưa đủ thời gian → raise lỗi, từ chối.
   - Nếu đủ điều kiện: gọi `finalize_versus_room(code, 'disconnect',
     <id người mất kết nối>)` — hàm này đã tồn tại sẵn (dùng bởi
     `forfeit_versus_match`), chỉ cần forfeiter là đối thủ thay vì bản thân.
   - Trả về outcome/eloChange giống hệt shape `forfeitMatch()` hiện có, để
     `VersusGameplayScreen` chỉ cần đổi 1 chỗ gọi RPC khi countdown về 0
     (thay vì chuyển `ScreenState.ERROR`, gọi RPC này rồi xử lý kết quả y hệt
     đường `onMatchEnd` hiện có).
3. **Không làm nếu chưa xác nhận lại**: đây là thay đổi migration/schema thật
   (cột mới hoặc bảng mới + RPC mới có logic chống gian lận), ảnh hưởng tới
   bảng điểm/Elo thật — rủi ro cao hơn hẳn 2 việc realtime/presence vừa làm
   (thuần frontend). Cần duyệt kỹ RPC (đặc biệt phần "chỉ tin đồng hồ server,
   không tin client") trước khi viết migration.

---

## 16. Phòng `waiting` mồ côi khi Logout/đóng tab — ĐÃ FIX TTL server-side

**Bug đã báo cáo:** Phòng được tạo từ nhánh “Tự Tạo Phòng Chờ Đối Thủ” hoặc
Custom Room có thể còn `status='waiting'` vô thời hạn nếu người chơi đóng tab,
rớt mạng hoặc đăng xuất mà không hoàn tất `leave_versus_room`.

**Đã fix đường logout chủ động:** `leaveActiveWaitingRoom()` gọi
`versusRoomService.leaveRoom(room.code)` best-effort trước khi sign-out, trong
lúc `auth.uid()` còn hợp lệ. Trận `in_progress` vẫn phải đi qua đường forfeit.

**Đã fix TTL server-side (2026-08-04):**

- `versus_rooms.expires_at` đặt hạn **10 phút** cho trạng thái `waiting`; trigger
  gia hạn bằng đồng hồ database khi có participant heartbeat hoặc room-state
  mutation thành công, và xóa deadline khi phòng chuyển sang trạng thái khác.
- `VersusRoomScreen` gửi `heartbeat_versus_room` mỗi 60 giây khi người tham gia
  đang mở phòng. Poll đọc 800 ms, Realtime và Presence không gia hạn deadline.
- RLS không cho đọc phòng `waiting` đã hết hạn. `expire_stale_waiting_rooms()`
  xóa vật lý các bản ghi mồ côi; Lobby gọi cleanup có throttle để tránh cleanup
  storm. `join_versus_room` xóa và trả kết quả hết hạn atomically nếu deadline
  vừa trôi qua trong lúc join.
- UI đóng Ready Room cũ và hiện lỗi `room-expired` thay vì nuốt lỗi poll rồi mắc
  kẹt trong “phòng zombie”. Phòng `in_progress`/`finished` không chịu TTL này.
- Contract thời gian độc lập: Quick Match queue **60 giây**, pending challenge
  invite **30 giây**, waiting room inactivity **10 phút**.

Migration: `database/migrations/20260804_waiting_room_ttl.sql`.
Smoke coverage: `database/tests/waiting_room_ttl.smoke.sql`.

---

## 17. Game Select — Starting Level selector: mới, chưa nối Versus

`GameSelectScreen` (Solo Practice/Ranked) có bộ chọn "cấp độ bắt đầu" (1 →
`highestLevel` đã đạt), truyền qua `App.tsx`'s `session.startLevel` →
`GameplayScreen`'s `initialLevel` prop. Chưa có trong bất kỳ doc UI/gameplay
nào (`docs/ui/screen-interface-spec.md` § Game Select chưa nhắc tới) — cần
viết doc chính thức nếu giữ tính năng này lâu dài.

- Chỉ hiện cho Solo Practice/Ranked (`!currentMode.versusFlow &&
  selectedMode !== SOLO_ENDLESS`) — ẩn hẳn ở Versus vì **chưa wire**:
  `VersusGameplayScreen` không nhận `initialLevel`, chọn gì cũng không có
  tác dụng nếu lỡ hiện ra.
- `GameplayScreen` ưu tiên `initialLevel` tường minh hơn checkpoint cũ — nếu
  checkpoint đang dở ở level khác, chọn Starting Level mới sẽ **bỏ qua toàn
  bộ checkpoint** (streak/loss/tally cũ), không chỉ đổi level, tránh trộn
  tiến độ ván cũ với level mới chọn.

---

## 18. Leaderboard — Weekly/Monthly ĐÃ NỐI (giả định lịch reset UTC, cần xác nhận)

**Cập nhật:** đã làm. `gameSupabaseService.getLeaderboard()` giờ có nhánh
riêng cho `weekly`/`monthly` — tính động từ `match_history` (không snapshot),
lọc `played_at >= mốc đầu kỳ`, chỉ tính trận Ranked (`solo_ranked`/
`versus_ranked`, đúng "Only Ranked games count toward records/leaderboard"),
lấy điểm cao nhất mỗi người trong kỳ (`getPeriodStart()` trong
`game.supabase.ts`). `LeaderboardScreen`'s `effectiveMetric` giờ ép về
`score` cho cả Weekly/Monthly (giống Endless) — khớp với `FilterRow` vốn đã
ẩn nút chuyển Score/Elo cho 2 tab này (Elo không có khái niệm "reset theo
tuần/tháng").

**Giả định chưa xác nhận** (docs không nói rõ): mốc reset là **tuần lịch
(Thứ 2 00:00 UTC)** và **tháng lịch (ngày 1 00:00 UTC)** — không phải giờ
Việt Nam, không phải rolling 7 ngày. Nếu muốn giờ VN hoặc rolling window,
cần đổi `getPeriodStart()`.

Board rỗng thật (chưa ai chơi Ranked trong kỳ) giờ hiện đúng Empty state,
không còn fallback nhầm sang danh sách toàn thời gian theo Elo.

`top100` vẫn dùng chung nhánh "Sort by High Score" với `global-alltime`
(`.limit(100)` giống nhau) — chấp nhận được nếu ý định là "Top 100 =
All-time giới hạn 100 dòng", nhưng đang là 2 tab trùng nhau hoàn toàn, chưa
xử lý trong lượt này.

Do tính động mỗi lần tải (không cache/snapshot), quy mô lớn nên cân nhắc
snapshot theo kỳ thay vì quét `match_history` trực tiếp mỗi lần mở màn.

Ngoài ra: `pinnedEntry` (hàng ghim khi người chơi ngoài Top 100) luôn trả
`score: 0` bất kể board/metric nào — không tính điểm thật của người chơi ở
board đó, tồn tại từ trước, chưa sửa trong lượt này.
