# Báo Cáo Audit & Danh Sách Lỗi Logic Flow / Quick Match Matchmaking (đã lưu trữ)

**Đã lưu trữ:** cả 13 lỗi bên dưới đều ở trạng thái "Đã fix" (xem bảng trạng thái triển khai cuối file) — giữ lại vì phần phân tích kỹ thuật (race condition, atomic guard...) còn giá trị tham khảo, không phải vì còn việc tồn đọng. Việc còn phải làm nằm ở [`known-gaps.md`](../known-gaps.md).

Tài liệu này tổng hợp toàn bộ 13 lỗi logic flow, race condition và bất cập được phát hiện khi đối chiếu mã nguồn ứng dụng với tài liệu chuẩn (`docs/ui/screen-inventory-and-flow.md` và `docs/technical/`). Tài liệu này dành cho các AI Agent hoặc lập trình viên tiếp quản sửa lỗi và hoàn thiện.

---

## 📋 Danh Sách Tổng Quan Các Lỗi

| STT | Phân Loại | File Ảnh Hưởng | Mức Độ | Tóm Tắt Lỗi |
|:---:|:---|:---|:---:|:---|
| 1 | **Matchmaking Logic** | `services/supabase/matchmaking.supabase.ts` | 🔴 Critical | **Ghép trận giả (False Match):** Row `status='matched'` từ phiên cũ không bị lọc mốc thời gian `updated_at`, dẫn đến việc vừa bấm Tìm Trận là báo ghép thành công ngay dù không có đối thủ. |
| 2 | **Race Condition** | `pages/matchmaking/MatchmakingScreen.tsx` | 🔴 Critical | **Xung đột Mount/Cleanup:** `clearStaleQueueRows()` và `pollQueue()` chạy song song bất đồng bộ khi mount, `pollQueue()` có thể đọc dữ liệu trước khi cleanup hoàn tất. |
| 3 | **Race Condition** | `services/supabase/matchmaking.supabase.ts` | 🔴 Critical | **Double-Match Race Condition:** Khi 2 người dùng cùng bấm ghép trận đồng thời, cả 2 `pollQueue()` đều nhìn thấy đối phương ở trạng thái `searching` và cùng tạo 2 phòng riêng biệt (`versus_rooms`), khiến 2 người bị kẹt ở 2 phòng khác nhau. |
| 4 | **Memory Leak** | `pages/matchmaking/MatchmakingScreen.tsx` | 🔴 Critical | **Re-subscribe WebSocket liên tục:** `useEffect` lắng nghe queue bị phụ thuộc vào `eloDelta`. Mỗi 10s `eloDelta` thay đổi khiến Supabase Channel bị hủy diệt và khởi tạo lại liên tục, gây leak socket connection. |
| 5 | **Navigation Flow** | `App.tsx` | 🔴 Critical | **Thoát trận sai màn hình (Versus Gameplay):** Bấm Quit trong ván đấu gọi `back('versus-room')` thay vì `resetTo('lobby')` theo đúng quy định tài liệu Flow 6. |
| 6 | **Navigation Flow** | `App.tsx` | 🔴 Critical | **Kết thúc trận bỏ qua ResultScreen:** Ván đấu kết thúc (`onMatchEnd`) gọi thẳng `push('lobby')` thay vì chuyển sang `ResultScreen` để cập nhật điểm Elo. |
| 7 | **Realtime Invite** | `App.tsx` | 🔴 Critical | **Accept 1v1 Invite bị lỗi UI trống:** Khi chấp nhận thách đấu từ `IncomingInviteModal`, ứng dụng navigate tới `versus-room` nhưng không fetch thông tin phòng (`matchedVersusRoom` bị `null`), làm người dùng thấy form tạo/nhập phòng rỗng. |
| 8 | **Network / Sync** | `pages/versus-room/VersusRoomScreen.tsx` | 🔴 Critical | **Host/Guest Desync khi DB Update Fail:** Hàm `handleStartMatch` tự chuyển Host sang màn hình Game ngay cả khi `updateRoomStatus` DB thất bại, làm Host vào game còn Guest kẹt lại ở phòng chờ. |
| 9 | **UX / Unmount** | `pages/matchmaking/MatchmakingScreen.tsx` | 🟡 High | **Unmount Callback Leaks (`onMatched` timeout):** Trong `handleFoundMatch`, callback `setTimeout` 600ms không kiểm tra component đã unmount hay chưa, dẫn tới rò rỉ state và navigate sai sau khi bấm Cancel/Back. |
| 10 | **UI / Timer** | `pages/matchmaking/MatchmakingScreen.tsx` | 🟡 Medium | **Timer đếm ngược `matchCountdown` bị cứng:** Giao diện hiển thị "Vào trận trong 3s..." nhưng không đếm ngược thực tế (3 -> 2 -> 1 -> 0). |
| 11 | **Error Handling** | `services/versus-room/versus-room.service.ts` | 🟡 Medium | **Không phân loại `RoomFullError`:** Khi nhập mã phòng đầy (2/2 người), ứng dụng báo lỗi chung "Lỗi kết nối" thay vì thông báo "Phòng đã đầy". |
| 12 | **UX Flow** | `pages/versus-room/components/ReadyRoomView.tsx` | 🟡 Medium | **Quick Match không tự đếm ngược bắt đầu:** Luồng Quick Match bắt buộc Host phải bấm "Bắt đầu ván đấu" thủ công (giống Custom Room), gây nhầm lẫn vì 2 người chơi Quick Match không có khái niệm Host. |
| 13 | **Performance** | `pages/versus-room/VersusRoomScreen.tsx` | 🟡 Medium | **Polling Effect Restart Liên Tục:** `useEffect` kiểm tra trạng thái phòng phụ thuộc `onNavigate` (hàm ẩn danh thay đổi mỗi lần render), gây reset `setInterval` liên tục trên mỗi frame. |

---

## 🛠️ Phân Tích Chi Tiết & Hướng Dẫn Sửa Lỗi (Specs for AI Agents)

### Lỗi 1 & 2: Ghép Trận Giả & Race Condition Cleanup
- **Vấn đề:** Trong `matchmaking.supabase.ts`, hàm `pollQueue` thực hiện:
  ```ts
  const { data: myQueueRows } = await supabase.from('matchmaking_queue').select('*').eq('user_id', userId)
  const matchedRow = myQueueRows?.find((r) => r.status === 'matched' && r.room_code)
  ```
  Code này **không kiểm tra thời gian** (`updated_at`). Nếu user rời ứng dụng hoặc bị đứt mạng từ phiên trước mà row `status = 'matched'` vẫn nằm trong database, lần tìm trận tiếp theo sẽ lập tức ghép thành công vào phòng rác/cũ.
- **Giải pháp:**
  1. Thêm mốc thời gian lọc: `updated_at >= 3 phút trước` (`threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString()`).
  2. Thêm state `isCleanupDone`: Trong `MatchmakingScreen.tsx`, gọi `clearStaleQueueRows()` trước, chỉ khi promise này hoàn thành (`setIsCleanupDone(true)`) thì mới bắt đầu chạy effect `pollQueue()`.

### Lỗi 3: Double-Match Race Condition
- **Vấn đề:** Khi Player A và Player B cùng gọi `pollQueue()` đồng thời:
  1. A thấy B đang `searching`.
  2. B cũng thấy A đang `searching`.
  3. Cả A và B đều tưởng mình tìm thấy đối phương trước, dẫn đến việc A tự tạo Room 1 (B là host, A là guest), B tự tạo Room 2 (A là host, B là guest).
- **Giải pháp (Atomic Guard):**
  Trước khi tạo phòng `versus_rooms`, client thắng phải cập nhật nguyên tử row của đối phương từ `searching` sang `matched`:
  ```ts
  const { count } = await supabase
    .from('matchmaking_queue')
    .update({ status: 'matched', room_code: 'PENDING', matched_with_id: userId })
    .eq('id', matchedOpponent.id)
    .eq('status', 'searching') // Chỉ thành công nếu chưa có ai khác claim đối thủ này
    .select('id', { count: 'exact' })
  ```
  Nếu `count === 0` (đã bị client khác claim), bỏ qua và tiếp tục `searching`.

### Lỗi 4: WebSocket Re-subscription Leak
- **Vấn đề:** `useEffect` lắng nghe kênh `matchmaking_queue` chứa `eloDelta` trong dependency array. Vì `eloDelta` thay đổi mỗi 10 giây (100 -> 150 -> 200 -> 300), mỗi 10 giây WebSocket channel cũ bị unsubscribed và tạo channel mới.
- **Giải pháp:** Sử dụng `eloDeltaRef = useRef(100)` để cập nhật giá trị `eloDelta` theo thời gian thực mà không làm trigger re-run `useEffect`. Loại bỏ `eloDelta` khỏi dependency array của `useEffect`.

### Lỗi 5 & 6: Luồng Navigation Sai Quy Định (App.tsx)
- **Vấn đề:**
  - `VersusGameplayScreen`: Bấm Quit hiện tại gọi `back('versus-room')`. Theo `docs/ui/screen-inventory-and-flow.md` (Flow 6), việc thoát giữa chừng được tính là xử thua và phải reset về `LobbyScreen` (`resetTo('lobby')`).
  - `onMatchEnd`: Kết thúc trận hiện tại gọi `push('lobby')`. Cần đổi thành `push('result')` và xóa `matchedVersusRoom`.
  - `IncomingInviteModal`: Khi Accept lời mời 1v1, cần gọi `versusRoomService.getRoom(invite.roomCode)` rồi gán cho `matchedVersusRoom` trước khi navigate tới `versus-room`.

### Lỗi 7: Quick Match Auto-Start UX
- **Vấn đề:** Luồng Quick Match hiện dùng chung `ReadyRoomView` với Custom Room. Người chơi Quick Match không chủ động chọn Host, do đó hiển thị nút "Bắt đầu ván đấu" cho một bên và "Đang chờ chủ phòng..." cho bên kia tạo UX xấu và bất tiện.
- **Giải pháp:** Thêm prop `isQuickMatch={isQuickMatch}` vào `ReadyRoomView`. Khi `isQuickMatch === true` và cả 2 người chơi đã vào phòng (`opponentJoined === true`), tự động đếm ngược 3 giây (3 -> 2 -> 1 -> 🚀) rồi tự động gọi `onStart()` để vào game.

### Lỗi 8: Fast Polling Effect Restart (VersusRoomScreen)
- **Vấn đề:** `useEffect` polling phòng có dependency `[roomCode, onNavigate]`. Vì `onNavigate` là hàm callback được tạo mới mỗi lần parent render, effect bị cleanup & restart liên tục.
- **Giải pháp:** Sử dụng `onNavigateRef = useRef(onNavigate)` và cập nhật ref trên từng render. Đưa `onNavigate` ra khỏi dependency array của `useEffect`.

---

## Trạng thái triển khai — 2026-08-03

| Lỗi | Trạng thái | Cách xử lý đã áp dụng |
|---:|---|---|
| 1 | Đã fix | Mỗi lần tìm trận có `attempt_id` mới và `expires_at` 60 giây; kết quả của attempt cũ không còn được đọc lại. |
| 2 | Đã fix | Bỏ chuỗi `clearStaleQueueRows()` rồi mới poll. RPC `enter_matchmaking_queue` upsert attempt mới trong một transaction; cleanup chỉ xóa đúng attempt của effect cũ. |
| 3 | Đã fix | Ghép hai queue row và tạo một room trong RPC `poll_matchmaking`, dùng row lock theo thứ tự UUID và `FOR UPDATE SKIP LOCKED`. Không còn client-side claim/room creation. |
| 4 | Đã fix | Realtime channel sống theo `attempt_id`; việc nới Elo window không recreate channel. |
| 5 | Đã fix | Quit trong gameplay gọi `forfeit_versus_match`, server ghi loss/Elo một lần rồi App reset về Lobby. |
| 6 | Đã fix | Kết thúc tự nhiên chuyển thẳng Gameplay → Result; overlay Result cục bộ từng làm mất kết quả đã được bỏ khỏi flow. |
| 7 | Đã fix | Accept invite dùng RPC atomic để kiểm tra expiry + join room; App nhận `Room` thật trước khi navigate. |
| 8 | Đã fix | Start dùng RPC và lỗi Supabase được throw; navigation chỉ xảy ra khi room đã có `status=in_progress` và đạt server `start_at`. |
| 9 | Đã fix | Không còn timeout navigate ở Matchmaking; callback có mounted/dedup guard. |
| 10 | Đã fix | Chỉ còn một countdown tại Ready Room, tính từ timestamp `start_at` của server. |
| 11 | Đã fix | `join_versus_room` khóa row và trả lỗi `ROOM_NOT_FOUND`/`ROOM_FULL`, service map sang error UI tương ứng. |
| 12 | Đã fix | Quick Match tự gọi start qua coordinator nội bộ; cả hai phía hiển thị cùng countdown server, không lộ khái niệm Host trong UX. |
| 13 | Đã fix | Room polling chỉ phụ thuộc `roomCode`; callback navigation được giữ ổn định bằng ref. |

Các sửa lỗi mở rộng đi kèm:

- Quick Join/Available Room/Invite đều truyền `Room` và `RoomEntrySource` qua App, không còn navigate vào form phòng rỗng.
- Nút Thách đấu từ `ProfileScreen` mở cùng `ChallengeModal` với Lobby và chuyển room code đã accept qua App; không còn điều hướng nhầm sang Quick Match mà không tạo invite.
- Custom Room có ready state thật cho từng participant; host không còn bị deadlock do `opponent.ready` suy từ `status`.
- Invite hết hạn sau 30 giây ở database; chỉ còn một global incoming-invite listener/modal.
- Phòng còn ở `waiting` hết hạn sau 10 phút không có participant heartbeat hoặc room-state mutation; RLS ẩn phòng hết hạn ngay theo đồng hồ database và RPC cleanup xóa bản ghi mồ côi.
- Mute `session` chỉ tồn tại trong memory của phiên hiện tại, không còn được lưu giả thành 24 giờ.
- Score đối thủ không còn sinh bằng `Math.random()` ở production flow. Round, winner, forfeit và category Elo được chốt idempotent phía database.
- RLS không còn cho client ghi trực tiếp `versus_rooms`, `matchmaking_queue`, `match_invites` hoặc `category_elo`; mutation đi qua RPC kiểm tra `auth.uid()`.

### Phần chưa thể đóng chỉ bằng frontend/Supabase hiện tại

Viewing/Answering timer vẫn chạy trong client. Docs kỹ thuật yêu cầu timer và anti-cheat do dedicated Game Server điều khiển; migration mới chỉ authoritative hóa match start, thứ tự/độ duy nhất của round, outcome và Elo. Việc xác thực đáp án, tốc độ input, reconnect/disconnect timeout cần Game API/WebSocket server theo kiến trúc đã duyệt. Không tự thay kiến trúc trong đợt fix này.
