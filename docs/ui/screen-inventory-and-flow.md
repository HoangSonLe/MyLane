# Screen Inventory and Flow

Tài liệu này chốt lại cách đếm màn hình và flow tổng thể của Memory Arena để Claude đọc nhanh, không lẫn giữa screen chính, overlay, và trạng thái trong gameplay.

Nguồn tham chiếu chính:
- [docs/ui/README.md](README.md)
- [docs/ui/screen-interface-spec.md](screen-interface-spec.md)
- [docs/design/design-bible/11-screen-guidelines.md](../design/design-bible/11-screen-guidelines.md)
- [docs/MEMORY_ARENA_GAME_DESIGN.md](../MEMORY_ARENA_GAME_DESIGN.md)

## Cách đếm

### Screen chính

Đây là các màn hình độc lập, có thể tách thành route hoặc view riêng.

1. Home
2. Game Select
3. Gameplay
4. Result
5. Profile
6. Settings
7. Leaderboard
8. Dialog

### Screen/entry bổ sung từ flow sản phẩm

Các mục này có cơ sở trong GDD và flow người dùng, nhưng chưa được UI docs chuẩn hóa thành inventory riêng.

9. Landing / First Run
10. Login / Auth
11. Lobby

### Trạng thái phụ trong flow

Các mục này nên hiểu là overlay hoặc state của flow, không nhất thiết là screen độc lập.

- Pause Overlay
- Matchmaking Queue
- Versus Room / Create Room / Join Room
- Tutorial 3 bước
- Versus Gameplay / 1v1 Match (state của Gameplay template, code hiện tách thành component riêng — xem [`screen-interface-spec.md`](screen-interface-spec.md#versus-gameplay--1v1-match))

## Inventory chuẩn hóa

### 1. Landing / First Run

Màn hình mở app lần đầu.

Nhiệm vụ:
- Cho chọn Guest hoặc Login
- Không dẫn vào tutorial ở đây — tutorial 3 bước chạy riêng theo từng game family, xem [Tutorial 3 bước](#tutorial-3-bước) trong Flow phụ.

### 2. Login / Auth

Màn hình xác thực tài khoản.

Nhiệm vụ:
- Google
- Discord
- Email/Password

### 3. Home

Màn hình chính sau khi vào app — điểm hạ cánh mặc định sau Landing/Login, tách biệt với Lobby.

Nhiệm vụ:
- Khuyến khích chơi tiếp
- Không đặt stats làm trung tâm
- Có nút riêng dẫn sang Lobby khi cần Versus/social (không tự động vào Lobby)

### 4. Game Select

Màn hình chọn game và mode.

Nhiệm vụ:
- Chọn game
- Chọn mode: Solo Practice, Solo Ranked, Versus Ranked, Versus Unranked

### 5. Gameplay

Màn hình chơi game dùng chung template.

Nhiệm vụ:
- Support gameplay, không ôm thêm chức năng phụ

Game con trong cùng template:
- Number Memory
- Alphabet Memory
- Grid Memory
- Sequence Memory

### 6. Result

Màn hình kết thúc ván.

Nhiệm vụ:
- Hiển thị kết quả
- Khuyến khích chơi lại

### 7. Profile

Màn hình thông tin người chơi.

Nhiệm vụ:
- Danh tính
- Tiến bộ
- Lịch sử

### 8. Settings

Màn hình cấu hình.

Nhiệm vụ:
- Chỉ chứa cấu hình, không trộn gameplay

### 9. Leaderboard

Màn hình xếp hạng.

Nhiệm vụ:
- So sánh
- Không che rank của người chơi

### 10. Dialog

Overlay một quyết định.

Nhiệm vụ:
- Chỉ xử lý một quyết định tại một thời điểm

### 11. Lobby

Điểm trung tâm cho các luồng social và multiplayer, **tách biệt với Home** — vào từ Home qua một nút riêng, không phải điểm hạ cánh mặc định sau login.

Nhiệm vụ:
- Vào Versus
- Mời bạn
- Quick Match
- Đi tới Profile, Leaderboard, Settings nếu cần

## Flow chuẩn hóa

### Flow tổng quát

```text
Landing / First Run
→ Login / Auth hoặc Guest
→ Home
→ (nếu cần Versus/social) Lobby
→ Game Select
→ (nếu lần đầu chọn game này) Tutorial 3 bước
→ Gameplay
→ Result
→ Home hoặc Play Again (chơi lại cùng game + mode)
```

### Flow solo

```text
Home
→ Game Select
→ (nếu lần đầu chọn game này) Tutorial 3 bước
→ Gameplay
→ Result
→ Play Again (chơi lại cùng game + mode) hoặc Home
```

### Flow versus

```text
Home
→ Lobby
→ Game Select
→ Versus Room hoặc Quick Match
→ Matchmaking Queue
→ Gameplay
→ Result
→ Rematch hoặc Home / Lobby
```

### Tutorial 3 bước

Trigger theo từng game family, **không** phải bước cố định ngay sau Login.

```text
Game Select (lần đầu chọn game X)
→ Tutorial 3 bước (skippable): xem pattern → pattern ẩn → nhập lại đúng thứ tự
→ Gameplay (game X)
```

Chạy riêng cho mỗi game family (Number/Alphabet/Grid/Sequence Memory) — chọn game khác lần đầu vẫn kích hoạt lại tutorial của game đó.

### Flow phụ trong Gameplay

```text
Gameplay
→ Pause Overlay
→ Resume / Reset / Settings / Quit
```

Settings mở như overlay chồng lên Pause (không rời khỏi route Gameplay), gameplay vẫn ở trạng thái đóng băng; đóng Settings quay lại Pause Overlay.

**Lưu ý:** Nhánh Pause → Settings này áp dụng cho **Solo (Practice/Ranked)**. Với **Versus**, khuyến nghị không cho Pause (đúng quy ước game PvP thời gian thực khác — tránh lợi dụng pause để câu giờ khi seed dùng chung và thắng thua tính theo tốc độ); người chơi Versus chỉ có Quit, xử lý theo luật Reconnect 60s sẵn có. Đây là **giả định/đề xuất** dựa trên tiêu chuẩn game khác, không có trong nguồn tài liệu gốc — cần xác nhận nếu muốn khác đi.

## Quy ước chốt

- Nếu cần đếm screen cho UI map, dùng 8 screen chính.
- Nếu cần đếm trải nghiệm đầu-cuối của app, thêm Landing / First Run, Login / Auth, Lobby.
- Pause Overlay, Matchmaking Queue, Versus Room, Tutorial nên được coi là state/overlay trước khi tách thành screen riêng.
- 4 game không phải 4 screen khác nhau; chúng dùng chung một Gameplay template.

## Kết luận ngắn

Nếu hỏi “cần bao nhiêu màn hình để làm app hoàn chỉnh”, câu trả lời thực dụng là:

- 8 screen chính
- 3 screen/entry bổ sung
- 5 trạng thái phụ

Tổng cộng: 16 mục để Claude hiểu đầy đủ, nhưng chỉ 11 mục đầu là ứng viên để vẽ UI/screen map độc lập.