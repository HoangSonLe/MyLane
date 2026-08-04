# Screen Interface Spec Draft

Tài liệu này chuyển các yêu cầu từ product, gameplay, và design bible thành một draft giao diện cho từng màn hình.

Mục tiêu là để Claude và team review nhanh theo cùng một khung nhìn:
- Màn hình này tồn tại để làm gì
- Người dùng cần làm gì ở đây
- Giao diện nên ưu tiên thành phần nào
- Workflow đi tiếp là gì
- Vì sao layout đó phù hợp với My Lane

Nguồn gốc quyết định:
- Product docs là nguồn ưu tiên cao nhất
- Gameplay docs quyết định phần chơi
- Design bible quyết định bố cục, độ ưu tiên, và cách trình bày
- UI docs chỉ chuẩn hóa screen và flow

## Nguyên tắc chung

1. Mỗi screen chỉ có một primary action.
2. Home không được biến thành dashboard thống kê.
3. Gameplay phải giữ phần chơi là trung tâm, HUD tối thiểu.
4. Leaderboard phải luôn làm nổi rank của chính người chơi.
5. Settings chỉ là cấu hình, không trộn gameplay.
6. Dialog chỉ xử lý một quyết định.
7. Mobile là chuẩn chính, desktop chỉ là bản mở rộng.

## Screen-by-screen spec

### Landing / First Run

**Purpose**: Cho người chơi chọn Guest hoặc Login.

**Primary action**: Continue as Guest.

**Interface**:
- Hero ngắn với product promise.
- Một nút Guest thật nổi bật để vào app nhanh.
- Sign in đặt như secondary action nhưng vẫn nhìn rõ.
- Một note nhỏ giải thích Guest chỉ dùng Solo Practice.

**Trạng thái** (theo yêu cầu bắt buộc của `11-screen-guidelines.md`; suy ra từ nguyên tắc chung, chưa có trong source docs — cần xác nhận nếu muốn khác):
- Loading: skeleton nhẹ cho hero trong lúc asset load, tránh blank screen.
- Empty: không áp dụng, màn hình không phụ thuộc dữ liệu.
- Error: lỗi mạng khi load asset không chặn nút Guest; phần asset lỗi có Retry riêng.

**Why this layout**:
- Đây là màn đầu tiên nên cần ít lựa chọn nhất có thể.
- User chỉ cần hiểu nhanh: vào chơi ngay hay đăng nhập để mở thêm tính năng.
- Tách lựa chọn sớm giúp giảm cognitive load.

**Workflow**:
- Landing → Guest → Home
- Landing → Login → Auth

---

### Login / Auth

**Purpose**: Đăng nhập tài khoản hiện có hoặc tạo tài khoản mới với intent rõ ràng.

**Primary action**: Đăng nhập hoặc Tạo tài khoản theo mode đang chọn.

**Interface**:
- Header ngắn.
- Social sign-in buttons cho Google và Discord.
- Form email/password đặt dưới social options.
- Link chuyển mode `Đăng nhập` ↔ `Tạo tài khoản`; hai mode dùng chung layout và component, nhưng submit vào hai service/API riêng.
- Back action rõ ràng để quay lại Landing.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: nút social/sign-in chuyển trạng thái loading (disable + spinner) khi đang xác thực, không đổi layout.
- Empty: không áp dụng.
- Error: sai email/password, email đã tồn tại khi đăng ký hoặc social login thất bại → thông báo lỗi ngắn ngay dưới form, giữ nguyên email đã nhập, có Retry.

**Why this layout**:
- Xác thực là bước hỗ trợ, không phải trải nghiệm chính.
- Đưa social login lên trước giúp thao tác nhanh hơn trên mobile.
- Form gọn giữ nhịp vào app không bị ngắt quá lâu.

**Workflow**:
- Login → Home
- Register → Home
- Login ↔ Register ngay trong Auth screen; không tự động đăng ký khi đăng nhập thất bại.
- Guest mở Auth → mặc định Register; sau khi xác thực thành công → prompt merge tiến trình → Home.
- Login → Back → Landing

---

### Home

**Purpose**: Khuyến khích chơi tiếp, không phải hiển thị thống kê như dashboard.

**Primary action**: Play.

**Interface**:
- Header với greeting và avatar/profile access.
- Một hero card kiểu Continue / Last Played.
- Nút Play lớn là điểm nhìn đầu tiên.
- Một hàng shortcut nhỏ cho Profile, Lobby, Settings, Leaderboard nếu cần.
- Bottom navigation chỉ giữ các điểm đến chính.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho hero/Continue card; nút Play vẫn hiện và bấm được ngay cả khi phần còn lại đang tải.
- Empty: người chơi chưa có ván nào → hero card đổi thành lời mời chơi ván đầu tiên, dẫn thẳng vào Game Select.
- Error: dữ liệu Home tải lỗi → phần bị lỗi hiện Retry tại chỗ, không chặn nút Play.

**Why this layout**:
- Design bible yêu cầu Home không lấy stats làm trung tâm.
- Continue card tạo cảm giác quay lại đúng chỗ, không cần nghĩ nhiều.
- Một primary CTA duy nhất giúp màn hình rõ ràng trên mobile.

**Workflow**:
- Home → Play → Game Select
- Home → Profile
- Home → Lobby
- Home → Settings
- Home → Leaderboard

---

### Lobby

**Purpose**: Trung tâm cho social và multiplayer, tách biệt với Home.

**Primary action**: Quick Join / Quick Match.

**Interface**:
- Header với back về Home.
- Một card **Quick Match** và **Quick Join** (Tham gia nhanh phòng Public khả dụng mà không cần tự tạo phòng mới) thật nổi bật.
- Danh sách **Phòng khả dụng (Available Public Rooms)**: hiển thị danh sách các phòng Public đang mở với tên chủ phòng, chế độ game, số người (1/2), và nút "Tham gia" trực tiếp.
  - **Public Room Detail Modal**: Khi người chơi nhấp vào một card phòng trong danh sách Public, một modal nhỏ hiện ra hiển thị chi tiết tên phòng, danh mục game, thông tin chủ phòng (Avatar/Name/Elo Rating), số slot người chơi, cùng 2 nút "Vào phòng ngay" (Join) và "Đóng" (Close).
- Create Room (kèm toggle **Public / Private**) và Join Room (nhập mã phòng) đặt thành secondary actions cùng cụm.
- **Trung Tâm Thông Báo (Bell Icon 🔔)**: Icon Cái Chuông ở Header (Home & Lobby) với Badge số đỏ. Bấm vào mở Modal 2 Tab:
  - 👥 **Lời mời kết bạn**: Danh sách người chơi gửi lời mời kết bạn kèm nút **`✓ Đồng ý`** & **`✕ Từ chối`**.
  - 📢 **Thông báo khác**: Danh sách thông báo hệ thống, cập nhật Elo và thách đấu.
- **Modal Tìm Kiếm Bạn Bè (`AddFriendModal`)**: Cho phép tìm kiếm người chơi theo tên/handle. Nút bấm tự động chuyển trạng thái `⏳ Đang chờ xác nhận`, `✓ Bạn bè`, `📩 Đã gửi lời mời` hoặc `+ Kết bạn`.
- **Modal QR Kết Bạn (`FriendQrModal`)**: Có hai tab Quét mã/Mã của tôi; hỗ trợ camera sau, chọn ảnh QR dự phòng, xem trước hồ sơ trước khi gửi lời mời, và hiển thị trạng thái quan hệ hiện tại. Link `?friend=<id>&v=1` tiếp tục đúng luồng sau khi đăng nhập.
- **Màn Hình Xem Trước Hồ Sơ (`FriendProfileModal`)**: Khi bấm vào tên/avatar của bất kỳ người chơi nào (trong kết quả tìm kiếm, lời mời, hoặc danh sách bạn bè), Modal chi tiết hồ sơ sẽ hiển thị thông số Elo, Win Rate %, Kỷ lục game và nút Thách đấu 1v1.
- **Hệ Thống Presence & Auto-Refresh**: Tự động cập nhật trạng thái `online`, `in_game` (khi vào ván), `offline` qua Heartbeat 30s. Danh sách bạn bè tự động làm mới ngầm 10s/lần.
- Một cụm shortcut cho Profile, Leaderboard, Settings nếu người chơi muốn đi sâu.
- Không dùng layout giống Home để tránh nhầm vai trò.

**Versus room flow UI**:
- Quick Join: nút tham gia ngay phòng Public mở mà không cần tạo phòng.
- Available Rooms List: danh sách phòng Public có sẵn để chọn tham gia.
- Quick Match: card chính, mô tả ngắn về Elo-based matchmaking.
- Create Room: form gồm game category, mode, privacy setting (Public/Private), room name optional, và nút tạo room.
- Join Room: input room code (6 ký tự) hoặc link, nút join rõ ràng, feedback lỗi nếu code sai hoặc room đầy.
- Nếu đã có phòng, room state nên hiển thị host badge, player slot, game category, mode, privacy status, và trạng thái ready.
- Nếu chủ phòng (Host) bấm rời phòng: hiển thị **Confirm Modal xác nhận rời phòng** cảnh báo chuyển quyền chủ phòng cho người còn lại.
- **Match Challenge Invite Toast & Mute UI**:
  - **Incoming Challenge Toast/Modal**: Banner/modal nổi khi nhận lời mời thách đấu từ người chơi khác (gồm Avatar/Tên người mời, Elo, danh mục game, mã phòng, nút Accept, Decline, và Mute).
  - **Mute Duration Selector**: Khi bấm "Tắt nhận lời mời", hiển thị menu/modal cho phép chọn thời gian tạm tắt lời mời từ người đó: 5 phút, 15 phút, 30 phút, hoặc Hết phiên (End of session).
  - **Mute Sync State**: Các lựa chọn 5/15/30 phút được lưu theo profile ID trong `invite_mutes` và đồng bộ qua Supabase Realtime; lựa chọn Hết phiên chỉ được giữ trong memory của phiên hiện tại.
- **Public Friend Profile Popup**:
  - Khi nhấp vào bạn bè bất kỳ trong danh sách Lobby/Online friends, một Modal xem hồ sơ cá nhân công khai (`FriendProfileModal`) sẽ hiện ra.
  - Hiển thị Avatar, tên người chơi, handle, trạng thái Online/In-game, điểm Elo tổng, tổng số trận đấu, tỉ lệ thắng %, và kỷ lục các danh mục game.
  - Chứa nút **Thách đấu** (Challenge) và nút **Tắt/Mở lời mời** (Mute/Unmute) trực tiếp từ popup.
- **Centralized Modal Backdrop Component (`ModalBackdrop.tsx`)**:
  - Tất cả các Modal và Dialog (`FriendProfileModal`, `PublicRoomDetailModal`, `MuteInviteModal`, `ConfirmDialog`, `LogOutDialog`, `WrongToast`) đều được bọc bởi component `ModalBackdrop` chung.
  - Tự động đóng gói logic cô lập sự kiện click (`e.stopPropagation()` & `e.preventDefault()`), đảm bảo 100% không bao giờ xảy ra lỗi click-through xuyên nền sang các phần tử phía dưới.
- **Solo Practice Reveal Answer (Xem đáp án)**:
  - Khi ở chế độ Luyện tập Solo (Solo Practice), trên màn hình báo sai `WrongToast` xuất hiện nút **Xem đáp án** (Reveal Answer). Bấm vào nút này sẽ làm nổi bật đáp án đúng (Number/Alphabet: dòng đáp án; Grid: ô màu xanh; Color/Sequence: chớp lại chuỗi nốt).
- **Haptic Vibration Feedback**:
  - Khi người chơi tương tác với các ô bàn cờ (Grid/Sequence), nút chọn màu (Color), nút chọn chữ cái (Alphabet) hoặc bàn phím nhập số (Number), thiết bị sẽ phát xung rung nhẹ Haptic (`12ms`).
  - Khi trả lời sai hoặc chọn sai chuỗi, thiết bị phát nhịp rung cảnh báo (`[30ms, 40ms, 50ms]`).
  - Có nút gạt Tắt/Bật rung (Toggle Switch) trong mục **Cài đặt (Settings) > Game > Phản hồi rung (Haptic Feedback)** giúp người chơi chủ động bật hoặc tắt rung theo ý muốn.
- **Web Audio Sound Effects**:
  - Phát âm thanh tổng hợp Web Audio API (không tốn dung lượng tải file audio) cho các thao tác chọn đáp án (tiếng click nhẹ), trả lời đúng (hợp âm chiến thắng), và trả lời sai (tiếng buzz cảnh báo).
  - Có nút gạt Tắt/Bật âm thanh (Toggle Switch) trong mục **Cài đặt (Settings) > Game > Âm thanh hiệu ứng (Sound Effects)**.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho danh sách phòng khả dụng / danh sách bạn online / trạng thái phòng.
- Empty: không có phòng Public khả dụng → hiển thị nút Quick Join fallback tự tạo phòng mới hoặc bấm Create Room.
- Error: mất kết nối tới lobby service → banner lỗi phía trên với Retry/Reload, không chặn thao tác Quick Match nếu service đó vẫn khả dụng.

**Why this layout**:
- Lobby là nơi xử lý social intent, nên cần cảm giác riêng.
- Tách khỏi Home giúp Home vẫn giữ vai trò “quay lại chơi” thay vì “điều khiển mọi thứ”.
- Room entry là bước trung gian giữa ý định social và gameplay, nên cần được tách khỏi Home/Game Select để không làm dày các màn chính.
- Quick Join và Quick Match cần là primary vì đây là đường đi nhanh nhất; Create Room và Join Room là nhánh có chủ đích hơn.

**Workflow**:
- Home → Lobby → Game Select hoặc Matchmaking
- Lobby → Quick Join → Tham gia phòng Public khả dụng
- Lobby → Available Rooms List → Select Room → Versus Room
- Lobby → Back → Home
- Lobby → Create Room → Room Ready (Host) → Game Select hoặc Gameplay start
- Lobby → Join Room → Room Ready → Game Select hoặc Gameplay start
- Lobby → Quick Match → Matchmaking Queue

### Versus Room / Create Room / Join Room

**Purpose**: Cho người chơi tạo phòng, chọn chế độ Public/Private, nhập phòng bằng code/link, hoặc xác nhận phòng đã sẵn sàng.

**Primary action**: Create Room / Join Room / Start Match, tùy trạng thái.

**Interface**:
- Header với back về Lobby.
- Mode summary card cho Versus Ranked hoặc Versus Unranked.
- Create room form với category, difficulty selector (Dễ, Trung bình, Khó, Siêu khó), privacy setting (Public / Private), room name optional, Thẻ Xem Trước Cấu Hình Phòng (Preview Card), và nút tạo phòng.
- Join room form với code/link input và nút join.
- Link chia sẻ dùng dạng `/?room={CODE}`; khi mở link, ứng dụng giữ mã qua bước đăng nhập và mở trực tiếp form Join đã điền sẵn. Link cũ `/versus-room/{CODE}` và `/r/{CODE}` vẫn được hỗ trợ.
- Ready room state với Host badge, slot người chơi, privacy badge, share code/link, và nút start cho Host.
- **1v1 Challenge Modal & Incoming Invite Modal**: Cho phép thách đấu chọn cấu hình Game trước khi gửi. Người nhận thách đấu có thể click mở rộng xem chi tiết luật chơi/môn đấu và click vào thẻ người mời để xem trước Pop-up Hồ Sơ (`FriendProfileModal`).
- **Host Leave Confirm Modal**: Tự động đóng phòng mượt mà khi chỉ có 1 mình trong phòng; chỉ mở Modal xác nhận rời phòng khi phòng ĐÃ có đối thủ (thông báo quyền Host sẽ tự động chuyển ngầm cho người còn lại).
- Inline error state cho code sai, phòng đầy, phòng `waiting` hết hạn sau 10 phút không hoạt động, hoặc mất kết nối. Khi một Ready Room đang mở bị hết hạn, UI bỏ room state cũ và quay về form với lỗi `room-expired`.
- Ready Room gửi participant heartbeat mỗi 60 giây khi đang mở. Heartbeat là lifecycle action riêng; poll đọc room, Realtime và Presence không gia hạn TTL.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: trạng thái "Đang tạo phòng…" / "Đang tìm phòng…" rõ ràng khi chờ phản hồi server.
- Empty: room chưa có player thứ 2 → hiển thị rõ "đang chờ đối thủ" (đã mô tả ở Interface).
- Error: code sai / phòng đầy / phòng hết hạn / mất kết nối đã mô tả ở Interface; bổ sung nút Retry cho join room khi lỗi.

**Why this layout**:
- Đây là bước riêng giữa ý định Versus và trận đấu, nên tách thành một screen/state rõ ràng.
- Người chơi cần thấy ngay mình đang tạo phòng, đang join, hay đã ở trạng thái chờ bắt đầu.
- Tách form create/join khỏi gameplay giúp giữ các màn chính nhẹ hơn.

**Workflow**:
- Lobby → Create Room → Ready room state → Gameplay
- Lobby → Join Room → Ready room state → Gameplay
- Ready room → Start → Gameplay
- Ready room → TTL hết hạn → Form Create/Join với inline error

---

### Game Select

**Purpose**: Cho người chơi chọn game và mode.

**Primary action**: Choose Game.

**Interface**:
- Back row ở phía trên.
- Game cards cho 5 game theo thứ tự: Color, Number, Alphabet, Grid, Sequence. Color được chọn mặc định khi mở màn lần đầu.
- Tên game, chế độ và độ khó luôn lấy từ locale hiện tại; ID ổn định (`GameId`, `ModeId`, `DifficultyId`) không được hiển thị trực tiếp.
- Mode selector đặt gần đầu màn để người chơi biết ngữ cảnh trước khi chọn game.
- Lock state rõ cho mode cần account.
- Hint hoặc metadata nhỏ cho best score / difficulty / eligibility.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho game card trong lúc tải best score / lock state.
- Empty: không áp dụng, 5 game luôn cố định.
- Error: không tải được lock-state/best-score → vẫn cho chọn game, ẩn metadata lỗi, hiện Retry nhỏ trên card đó.

**Why this layout**:
- Progressive disclosure: chọn mode rồi chọn game, không ném tất cả vào một màn dày đặc.
- Game card phù hợp với cách người chơi nhận biết nhanh hơn là đọc danh sách chữ.
- Lock state phải rõ vì một phần mode cần account, một phần không.

**Workflow**:
- Home → Game Select → Gameplay
- Lobby → Game Select → Versus flow
- First time game family → Tutorial 3 bước → Gameplay

---

### Gameplay

**Purpose**: Hỗ trợ gameplay, không làm phiền gameplay.

**Primary action**: Game-specific only.

**Interface**:
- HUD rất gọn ở phía trên hoặc góc trên.
- Vùng chơi chiếm phần lớn màn hình.
- Controls chỉ xuất hiện khi thật cần thiết.
- Pause / quit / settings chỉ là overlay, không phá route chính.
- HUD stat row (Solo): Level, Streak, Elo, và **Best** (kỷ lục — highest level reached của game đó, theo `docs/gameplay/README.md#accounts`). Ô "Best" chỉ hiện với tài khoản đã đăng nhập; ẩn hoàn toàn với Guest hoặc khi chưa tải được dữ liệu, thay vì hiện số cũ/sai.

**Versus 1v1 gameplay UI**:
- Hai người chơi được hiển thị đối xứng theo vai trò hoặc tên.
- Timer / round progress phải là điểm nhìn dễ thấy, vì thắng thua trong Versus phụ thuộc tốc độ và độ chính xác.
- Trạng thái đối thủ cần rõ: connected, disconnected, answered, locked-in, or waiting.
- Không để UI che vùng chơi; phần game vẫn phải chiếm đa số màn hình.
- Nếu là shared-seed round, UI chỉ nên nhắc nhẹ rằng cả hai đang giải cùng một đề.
- Kết quả round cần phản hồi ngay bằng feedback ngắn gọn, không mở một dashboard giữa trận.

**Versus-specific actions**:
- Nếu source rules cho phép pause ở Versus thì phải là trạng thái rất hạn chế; mặc định draft này không bật pause để tránh exploit.
- Quit phải là hành động rõ ràng khi người chơi rời trận.
- Nếu mất kết nối, UI phải chuyển sang reconnect state với countdown còn lại.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: countdown/pha chuẩn bị trước Viewing thay cho loading truyền thống.
- Empty: không áp dụng.
- Error: mất kết nối tới server timer (Solo) → banner Reconnect/Retry, giữ tiến trình ván hiện tại nếu có thể.

**Why this layout**:
- Design bible yêu cầu gameplay dominate, khoảng 80% màn hình cho game.
- Memory games không nên bị UI biến thành bài kiểm tra thứ hai.
- Tách HUD mỏng giúp người chơi tập trung vào nhớ, không phải dò UI.
- Trong Versus, UI còn phải giảm đọc hiểu thêm một bậc nữa: người chơi cần biết ngay đối thủ đang ở trạng thái nào, không phải tìm thông tin đó qua nhiều lớp.
- Shared seed + speed-based win condition làm thời gian và trạng thái đối thủ trở thành thông tin cốt lõi, nên chúng phải nằm ở HUD chứ không phải trong modal hay panel phụ.

**Workflow**:
- Gameplay → Pause Overlay → Resume / Reset / Settings / Quit
- Gameplay → Finish → Result
- Gameplay (Versus) → Reconnect state if disconnected → Resume or loss timeout
- Gameplay (Versus) → Finish → Result → Rematch or back to Lobby/Home

### Versus Gameplay / 1v1 Match

**Purpose**: Hỗ trợ một trận 1v1 thời gian thực với seed dùng chung và trạng thái đối thủ rõ ràng.

**Primary action**: Answer the round input as fast and accurately as possible.

**Interface**:
- Header nhỏ gọn hiển thị hai người chơi.
- Shared timer hoặc round progress rõ ràng.
- Opponent state indicator: connected, disconnected, answered, locked-in, waiting, or reconnecting.
- HUD hiển thị trực tiếp kết quả đúng và số round đã hoàn thành của cả hai người chơi; tiến độ đối thủ được cập nhật trong khi trận đang diễn ra.
- Game board hoặc input area vẫn phải là vùng lớn nhất.
- Vòng đầu và các vòng kế tiếp tự động bắt đầu; không hiển thị nút “Bắt đầu vòng” riêng cho từng người chơi.
- Feedback correct / wrong / timeout chỉ hiển thị inline; không dùng `WrongToast` hoặc modal trong mode Thi đấu.
- Sau feedback, trận tự chuyển tiếp sang round kế tiếp.
- Khi đối thủ bỏ cuộc, client nhận kết quả server, thông báo ngắn “Đối thủ đã bỏ cuộc” và tự chuyển sang Result.
- Quit action luôn có; pause chỉ xuất hiện nếu source rules cho mode đó cho phép.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: "Đang đồng bộ trận đấu…" trước khi cả hai người chơi bắt đầu round.
- Empty: không áp dụng.
- Error: đã có Reconnect state (60s, theo `docs/gameplay/README.md`) mô tả ở Interface — không cần thêm error state khác.

**Why this layout**:
- Versus match cần cho người chơi biết ngay đối thủ đang ở trạng thái nào, không làm họ phải mở một lớp UI khác.
- Timer và opponent status là tín hiệu cốt lõi của trận đấu, nên phải nằm ở HUD mỏng.
- Board vẫn phải dominate để không làm loãng gameplay.

**Workflow**:
- Waiting for opponent → Gameplay
- Gameplay → Next round in same match
- Gameplay → Result when match ends
- Disconnect → Reconnect state → Resume or timeout loss

---

### Result

**Purpose**: Ăn mừng tiến bộ và kéo người chơi vào lượt tiếp theo.

**Primary action**: Play Again.

**Interface**:
- Hero score card làm visual anchor.
- Summary ngắn về tiến bộ, round, mode, và trạng thái thắng/thua nếu có.
- Với Versus, hiển thị card so sánh gọn gồm tên hai người chơi, số round đúng, trạng thái thắng/thua/hòa và lý do bỏ cuộc nếu có.
- Nút Play Again đặt nổi bật nhất.
- Secondary actions chỉ là đổi game, quay về Home, hoặc xem chi tiết nếu cần.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho score card trong lúc server tính điểm/Elo.
- Empty: không áp dụng.
- Error: không lưu được kết quả lên server → vẫn hiện điểm số local, banner nhỏ "chưa đồng bộ" + Retry, không chặn Play Again.

**Why this layout**:
- Result phải reward frequent, không nên biến thành bảng phân tích dài.
- Người chơi vừa kết thúc một vòng nên CTA tiếp theo phải cực rõ.
- Giữ màn hình nhẹ để tránh cảm giác “đã xong việc”.

**Workflow**:
- Gameplay → Result → Play Again
- Result → Home

---

### Profile

**Purpose**: Danh tính, tiến bộ, và lịch sử.

**Primary action**: Edit Profile.

**Interface**:
- Player card ở đầu màn.
- Avatar thật nếu có; nếu chưa có thì dùng initials làm fallback.
- Các stat card nhỏ, mỗi card một metric quan trọng.
- Recent history hoặc session list ở phần dưới.
- Mỗi lịch sử Versus hiển thị riêng điểm đạt được và tỉ số đúng-round của bản thân với đối thủ; không dùng một số cho cả hai ý nghĩa.
- Thời gian trong lịch sử trận đấu dùng timestamp thật từ backend: dưới 7 ngày hiển thị tương đối theo locale (ví dụ “2 giờ trước”), cũ hơn hiển thị ngày và giờ địa phương; dữ liệu mock cũ như `Today`/`Yesterday` vẫn được chuẩn hóa.
- Edit Profile là hành động nổi bật, nhưng không lấn át phần tiến bộ.
- Nút QR kết bạn đặt cạnh Edit Profile để mở mã cá nhân; luồng quét cũng có thể mở từ modal tìm bạn.
- Edit Profile mở màn riêng gồm ảnh đại diện, tên hiển thị và handle; ảnh chỉ nhận JPEG/PNG/WebP tối đa 2 MB và được thu về tối đa 512 px trước khi upload.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho player card, stat card, và history.
- Empty: chưa có history/session nào (guest hoặc tài khoản mới) → thông báo ngắn kèm gợi ý đi chơi.
- Error: tải profile thất bại → Retry/Reload, Back luôn khả dụng.
- Edit error: handle trùng hoặc upload/lưu thất bại → giữ nguyên form và hiển thị lỗi tại chỗ; rời form khi chưa lưu phải xác nhận.

**Why this layout**:
- Profile trả lời câu hỏi “Tôi là ai và tôi tiến bộ thế nào?”.
- Tách player identity khỏi history giúp đọc nhanh trên mobile.
- Chỉ nên hiển thị số liệu có ý nghĩa, không biến màn này thành dashboard.

**Workflow**:
- Home → Profile
- Profile → Edit Profile
- Profile/Add Friend → QR Kết Bạn → xem trước hồ sơ → gửi lời mời
- Profile → Back → Home

---

### Settings

**Purpose**: Cấu hình duy nhất, không trộn gameplay.

**Primary action**: Done / Back.

**Interface**:
- Sectioned list của toggles, rows, và preferences.
- Header rõ ràng, không dùng hero lớn.
- Các nhóm cài đặt nên tách theo chủ đề để quét nhanh.
- Không đưa game content hay stats vào đây.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho danh sách setting rows.
- Empty: không áp dụng.
- Error: lưu setting thất bại → thông báo lỗi tại đúng row, có Retry, không rời khỏi Settings.

**Why this layout**:
- Settings là công cụ hỗ trợ, nên layout phải cực kỳ rõ và yên tĩnh.
- Section list phù hợp vì người dùng thường tìm đúng một cài đặt, không đọc theo kiểu tuyến tính.

**Workflow**:
- Home → Settings
- Gameplay Pause → Settings (solo only, theo draft flow hiện tại)

---

### Leaderboard

**Purpose**: So sánh, nhưng không được che rank của chính người chơi.

**Primary action**: View leaderboard / switch scope.

**Interface**:
- Thanh filter hoặc segmented control ở phía trên.
- Top area luôn ghim vị trí hoặc rank của người chơi.
- Danh sách thứ hạng chạy theo card hoặc row rõ ràng.
- Nếu người chơi không có rank, phải có fallback state dễ hiểu.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho danh sách rank.
- Empty: người chơi chưa có rank (chưa chơi Ranked) → fallback state giải thích "chơi Ranked để có rank" kèm nút dẫn tới Game Select.
- Error: tải bảng xếp hạng thất bại → Retry/Reload, giữ nguyên filter/scope đã chọn.

**Why this layout**:
- Leaderboard chỉ có ý nghĩa khi người chơi thấy mình ở đâu.
- Ghim rank của user giúp tránh cảm giác bị “chôn” ở dưới danh sách dài.
- Filter bar nên đơn giản để đổi scope mà không làm loạn màn.

**Workflow**:
- Home → Leaderboard
- Leaderboard → Back → Home

---

### Dialog

**Purpose**: Một quyết định duy nhất.

**Primary action**: Context-dependent confirm.

**Interface**:
- Title ngắn.
- Nội dung cực súc tích.
- Một nút confirm nổi bật và một nút cancel thứ cấp.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: nếu confirm cần gọi server, nút confirm chuyển trạng thái loading (disable + spinner), dialog không tự đóng cho tới khi có phản hồi.
- Empty: không áp dụng.
- Error: action thất bại → thông báo lỗi ngắn ngay trong dialog, giữ dialog mở, cho phép Retry hoặc Cancel.

**Why this layout**:
- Dialog không được tạo thêm gánh nặng nhận thức.
- Một quyết định một lúc là đúng với design principle về progressive disclosure.

**Workflow**:
- Bất kỳ screen nào cần xác nhận → Dialog → quay lại screen gốc

## Workflow tổng hợp

```text
Landing / First Run
→ Login / Auth hoặc Guest
→ Home
→ Game Select hoặc Lobby
→ Tutorial 3 bước nếu game family đó được mở lần đầu
→ Gameplay
→ Result
→ Play Again hoặc Home
```

### Solo flow

```text
Home
→ Game Select
→ Tutorial 3 bước nếu cần
→ Gameplay
→ Result
→ Play Again hoặc Home
```

### Versus flow

```text
Home
→ Lobby
→ Quick Match / Create Room / Join Room
→ Matchmaking / Room
→ Gameplay
→ Result
→ Rematch hoặc Home / Lobby
```

### Versus room flow

```text
Lobby
→ Quick Match
→ Matchmaking Queue
→ Gameplay

Lobby
→ Create Room
→ Room Ready
→ Share code/link
→ Gameplay when both players are ready

Lobby
→ Join Room
→ Room Ready
→ Gameplay when host starts
```

### Versus in-match flow

```text
Gameplay (Versus)
→ Connected / Waiting / Opponent answered / Reconnect / Timeout loss
→ Result
→ Rematch or Back to Lobby/Home
```

### Gameplay phụ

```text
Gameplay
→ Pause Overlay
→ Resume / Reset / Settings / Quit
```

## Review checklist cho Claude

- Mỗi screen có đúng một primary action chưa.
- Home có đang nghiêng về stats quá mức không.
- Gameplay có giữ HUD tối thiểu chưa.
- Leaderboard có làm nổi rank của người chơi chưa.
- Settings có bị trộn với gameplay không.
- Lobby đã đủ rõ cho Quick Match, Create Room, Join Room chưa.
- Versus gameplay đã hiển thị trạng thái đối thủ, timer, và reconnect đủ rõ chưa.
- Mỗi screen đã có Loading/Empty/Error state theo yêu cầu bắt buộc của `11-screen-guidelines.md` chưa.
- Workflow có giữ đúng draft flow từ UI docs không.
- Có phần nào cần xác nhận từ source documentation thay vì tự suy diễn không.

## Ghi chú

Đây là draft giao diện để review. Những chỗ source documentation chưa chốt chi tiết, tài liệu này cố tình giữ ở mức layout và hành vi tổng quát, không tự phát minh rule mới.
