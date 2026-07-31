# Screen Interface Spec Draft

Tài liệu này chuyển các yêu cầu từ product, gameplay, và design bible thành một draft giao diện cho từng màn hình.

Mục tiêu là để Claude và team review nhanh theo cùng một khung nhìn:
- Màn hình này tồn tại để làm gì
- Người dùng cần làm gì ở đây
- Giao diện nên ưu tiên thành phần nào
- Workflow đi tiếp là gì
- Vì sao layout đó phù hợp với Memory Arena

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

**Purpose**: Xác thực tài khoản.

**Primary action**: Sign in.

**Interface**:
- Header ngắn.
- Social sign-in buttons cho Google và Discord.
- Form email/password đặt dưới social options.
- Back action rõ ràng để quay lại Landing.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: nút social/sign-in chuyển trạng thái loading (disable + spinner) khi đang xác thực, không đổi layout.
- Empty: không áp dụng.
- Error: sai email/password hoặc social login thất bại → thông báo lỗi ngắn ngay dưới form, giữ nguyên input đã nhập, có Retry.

**Why this layout**:
- Xác thực là bước hỗ trợ, không phải trải nghiệm chính.
- Đưa social login lên trước giúp thao tác nhanh hơn trên mobile.
- Form gọn giữ nhịp vào app không bị ngắt quá lâu.

**Workflow**:
- Login → Home
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

**Primary action**: Quick Match.

**Interface**:
- Header với back về Home.
- Một card Quick Match thật nổi bật.
- Create Room và Join Room đặt thành secondary actions cùng cụm.
- Một cụm shortcut cho Profile, Leaderboard, Settings nếu người chơi muốn đi sâu.
- Không dùng layout giống Home để tránh nhầm vai trò.

**Versus room flow UI**:
- Quick Match: card chính, mô tả ngắn về Elo-based matchmaking.
- Create Room: form tối giản gồm game category, mode, room name optional, và nút tạo room.
- Join Room: input room code/link, nút join rõ ràng, feedback lỗi nếu code sai hoặc room đầy.
- Nếu đã có phòng, room state nên hiển thị host, player slot, game category, mode, và trạng thái ready.
- Nếu chưa đủ người, màn phải nói rõ đang chờ đối thủ hay đang chia sẻ phòng.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho danh sách bạn online / trạng thái phòng.
- Empty: không có bạn nào online → thông báo ngắn, Quick Match/Create Room vẫn hoạt động bình thường.
- Error: mất kết nối tới lobby service → banner lỗi phía trên với Retry/Reload, không chặn thao tác Quick Match nếu service đó vẫn khả dụng.

**Why this layout**:
- Lobby là nơi xử lý social intent, nên cần cảm giác riêng.
- Tách khỏi Home giúp Home vẫn giữ vai trò “quay lại chơi” thay vì “điều khiển mọi thứ”.
- Room entry là bước trung gian giữa ý định social và gameplay, nên cần được tách khỏi Home/Game Select để không làm dày các màn chính.
- Quick Match cần là primary vì đây là đường đi nhanh nhất; Create Room và Join Room là nhánh có chủ đích hơn.

**Workflow**:
- Home → Lobby → Game Select hoặc Matchmaking
- Lobby → Back → Home
- Lobby → Create Room → Room Ready → Game Select hoặc Gameplay start
- Lobby → Join Room → Room Ready → Game Select hoặc Gameplay start
- Lobby → Quick Match → Matchmaking Queue

### Versus Room / Create Room / Join Room

**Purpose**: Cho người chơi tạo phòng, nhập phòng bằng code/link, hoặc xác nhận phòng đã sẵn sàng.

**Primary action**: Create Room / Join Room / Start Match, tùy trạng thái.

**Interface**:
- Header với back về Lobby.
- Mode summary card cho Versus Ranked hoặc Versus Unranked.
- Create room form với category, room name optional, và nút tạo.
- Join room form với code/link input và nút join.
- Ready room state với host, slot người chơi, share code/link, và nút start cho host.
- Inline error state cho code sai, phòng đầy, hoặc mất kết nối.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: trạng thái "Đang tạo phòng…" / "Đang tìm phòng…" rõ ràng khi chờ phản hồi server.
- Empty: room chưa có player thứ 2 → hiển thị rõ "đang chờ đối thủ" (đã mô tả ở Interface).
- Error: code sai / phòng đầy / mất kết nối đã mô tả ở Interface; bổ sung nút Retry cho join room khi lỗi.

**Why this layout**:
- Đây là bước riêng giữa ý định Versus và trận đấu, nên tách thành một screen/state rõ ràng.
- Người chơi cần thấy ngay mình đang tạo phòng, đang join, hay đã ở trạng thái chờ bắt đầu.
- Tách form create/join khỏi gameplay giúp giữ các màn chính nhẹ hơn.

**Workflow**:
- Lobby → Create Room → Ready room state → Gameplay
- Lobby → Join Room → Ready room state → Gameplay
- Ready room → Start → Gameplay

---

### Game Select

**Purpose**: Cho người chơi chọn game và mode.

**Primary action**: Choose Game.

**Interface**:
- Back row ở phía trên.
- Game cards cho 4 game: Sequence, Number, Alphabet, Grid.
- Mode selector đặt gần đầu màn để người chơi biết ngữ cảnh trước khi chọn game.
- Lock state rõ cho mode cần account.
- Hint hoặc metadata nhỏ cho best score / difficulty / eligibility.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho game card trong lúc tải best score / lock state.
- Empty: không áp dụng, 4 game luôn cố định.
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
- Game board hoặc input area vẫn phải là vùng lớn nhất.
- Feedback ngắn cho correct / wrong / complete.
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
- Các stat card nhỏ, mỗi card một metric quan trọng.
- Recent history hoặc session list ở phần dưới.
- Edit Profile là hành động nổi bật, nhưng không lấn át phần tiến bộ.

**Trạng thái** (suy ra từ nguyên tắc chung — cần xác nhận nếu muốn khác):
- Loading: skeleton cho player card, stat card, và history.
- Empty: chưa có history/session nào (guest hoặc tài khoản mới) → thông báo ngắn kèm gợi ý đi chơi.
- Error: tải profile thất bại → Retry/Reload, Back luôn khả dụng.

**Why this layout**:
- Profile trả lời câu hỏi “Tôi là ai và tôi tiến bộ thế nào?”.
- Tách player identity khỏi history giúp đọc nhanh trên mobile.
- Chỉ nên hiển thị số liệu có ý nghĩa, không biến màn này thành dashboard.

**Workflow**:
- Home → Profile
- Profile → Edit Profile
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