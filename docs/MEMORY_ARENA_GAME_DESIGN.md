# MEMORY ARENA – Game Design Document

**Phiên bản:** 1.1 (Version 1 – MVP)  
**Mục đích:** Tài liệu thiết kế đầy đủ để AI hoặc lập trình viên có thể hiểu và triển khai thành web game hoàn chỉnh, ưu tiên mobile.

---

## 1. Tầm nhìn và Tổng quan

**Memory Arena** là web game rèn luyện trí nhớ ngắn hạn (working memory) theo phong cách competitive.

Người chơi phải xem một mẫu thông tin trong thời gian ngắn, sau đó mẫu bị ẩn đi, và phải tái hiện lại chính xác theo trí nhớ.

Game có **3 thể loại** khác nhau nhưng dùng chung một khung hệ thống lớn (tài khoản, bạn bè, ranked, leaderboard, elo, kỷ lục…).

Người chơi có thể chơi một mình (**Solo**) hoặc đối kháng trực tiếp 1vs1 (**Versus**).

Mọi dữ liệu quan trọng (kỷ lục, elo, lịch sử trận đấu, bạn bè) đều được lưu trên server gắn với tài khoản người chơi.

**Nền tảng:** Web (Mobile-first, responsive, hỗ trợ tốt cả desktop và mobile, có PWA).

---

## 2. Ba thể loại game cốt lõi

### 2.1. Numbers Game (`/games/numbers`)

**Mục tiêu:** Nhớ và nhập lại đúng thứ tự một dãy số.

**Bộ ký tự nguồn:** Các số từ 1 đến 9. Có thể lặp lại trong cùng một dãy (random có hoàn lại).

**Giao diện trả lời:** Lưới bàn phím số 3×3 (giống bàn phím điện thoại).

**Quy trình một lượt chơi:**

1. **Pha Viewing:** Hệ thống hiện dãy số ngẫu nhiên trong khoảng thời gian `viewTime` giây. Người chơi chỉ được nhìn, không được nhập.
2. **Pha Answering:** Dãy số bị ẩn (hiện dấu `?`). Người chơi phải bấm các số theo đúng thứ tự đã thấy trong `answerTime` giây.
3. Hệ thống so khớp toàn bộ chuỗi người chơi nhập với chuỗi gốc ngay khi nhập đủ số lượng hoặc hết giờ.

**Điều kiện thắng lượt:** Nhập đúng 100% thứ tự và độ dài của dãy.
**Điều kiện thua lượt:** Sai ít nhất 1 vị trí, hoặc hết giờ mà chưa nhập đủ.

**Hệ thống level:**
- Có 10 level.
- Level 1 bắt đầu với 6 ký tự.
- Mỗi level tăng thêm 1 ký tự (lên đến 15 ký tự ở level 10).
- Mỗi level yêu cầu thắng liên tiếp `times` lượt (mặc định **5 lượt**) mới được lên level tiếp theo.
- Nếu thua đủ `times` lượt trong cùng một level → **Game Over**.

**Bảng level mặc định:**

| Level | Số ký tự cần nhớ | Số lượt cần thắng |
|-------|------------------|-------------------|
| 1     | 6                | 5                 |
| 2     | 7                | 5                 |
| 3     | 8                | 5                 |
| 4     | 9                | 5                 |
| 5     | 10               | 5                 |
| 6     | 11               | 5                 |
| 7     | 12               | 5                 |
| 8     | 13               | 5                 |
| 9     | 14               | 5                 |
| 10    | 15               | 5                 |

**Mode độ khó thời gian** (cộng thêm vào `viewTime` và `answerTime`):

| Mode       | Số giây cộng thêm |
|------------|-------------------|
| Easy       | +5s               |
| Medium     | +4s               |
| Hard       | +3s               |
| Super Hard | +2s               |

Người chơi có thể **Pause** giữa ván và Resume đúng trạng thái đang chơi, hoặc **Reset** toàn bộ ván bất cứ lúc nào.

---

### 2.2. Alphabet Game (`/games/alphabet`)

Hoạt động **gần như giống hệt** Numbers Game về mọi luật thắng/thua, lên level, mode thời gian và số lượt.

**Điểm khác biệt duy nhất:**

- **Bộ ký tự nguồn:** Số 0–9 và toàn bộ chữ cái A–Z (tổng cộng 36 ký tự). Random có hoàn lại.
- **Bàn phím trả lời:** Layout QWERTY chia thành 4 hàng:
  - `1234567890`
  - `QWERTYUIOP`
  - `ASDFGHJKL`
  - `ZXCVBNM`

Toàn bộ logic còn lại (Viewing → Answering → thắng/thua lượt → lên level → Game Over) giống hệt Numbers Game.

---

### 2.3. Grid Number Game – Chimpanzee Memory (`/games/grid`)

**Mục tiêu:** Nhớ vị trí các số trên lưới và bấm theo đúng thứ tự tăng dần từ 1 đến n.

**Cơ chế chính:**

- Lưới hình chữ nhật kích thước `x_Axis × y_Axis`.
- Một số ô trong lưới chứa các số từ 1 đến `beginCount` (số lượng ô cần nhớ), các ô còn lại trống.
- **Pha Viewing:** Các số hiện rõ ràng trên đúng vị trí trong `viewTimeSeconds` giây (mặc định 18 giây).
- **Pha Answering:** Các số bị ẩn. Người chơi phải bấm lần lượt vào đúng ô chứa số 1, rồi 2, rồi 3… trong `answerTimeSeconds` giây (mặc định 40 giây).

**Xử lý khi bấm sai:**

- Ô bị bấm sai sẽ có hiệu ứng nhấp nháy báo lỗi trong thời gian ngắn.
- Trừ thêm `wrongAnswerPenaltySeconds` giây vào thời gian trả lời còn lại (mặc định 3 giây).
- Lượt đó bị đánh dấu `hasWrongSelect = true`.
- **Quan trọng:** Dù sau đó người chơi bấm đúng hết các số còn lại, lượt vẫn bị tính là **thua** nếu đã từng bấm sai ít nhất một lần.

**Điều kiện thắng lượt:** Bấm đúng toàn bộ vị trí theo thứ tự tăng dần **và** không hề bấm sai lần nào.
**Điều kiện thua lượt:** Hết giờ trả lời, hoặc đã từng bấm sai ít nhất 1 lần trong lượt.

**Cách tăng độ khó (2 trục độc lập):**

1. Tăng số lượng số cần nhớ (`beginCount`).
2. Khi `beginCount` đạt tối đa bằng tổng số ô của lưới hiện tại (`x_Axis × y_Axis`) và người chơi thắng đủ số lượt quy định → chuyển sang **level lưới lớn hơn**, đồng thời reset `beginCount` về giá trị khởi đầu của level mới.

**Bảng level lưới mặc định (10 level):**

| Level | Kích thước lưới | Số lượt cần thắng | beginCount khởi đầu gợi ý |
|-------|-----------------|-------------------|---------------------------|
| 1     | 5 × 5           | 3                 | 8                         |
| 2     | 6 × 5           | 3                 | 10                        |
| 3     | 6 × 6           | 3                 | 12                        |
| 4     | 7 × 6           | 3                 | 14                        |
| 5     | 7 × 7           | 3                 | 16                        |
| 6     | 8 × 8           | 3                 | 18                        |
| 7     | 9 × 8           | 3                 | 20                        |
| 8     | 9 × 9           | 3                 | 22                        |
| 9     | 10 × 9          | 3                 | 24                        |
| 10    | 10 × 10         | 3                 | 26                        |

**Thông số thời gian mặc định:**
- Viewing: 18 giây
- Answering: 40 giây
- Phạt khi bấm sai: 3 giây

Trong lúc chơi, người chơi có thể mở panel cài đặt nhanh để đổi level (kích thước lưới) và số ô cần nhớ tối đa cho ván hiện tại. Có thể chuyển giữa 2 layout hiển thị:
- **Đơn giản:** Chỉ hiện những ô có số.
- **Đầy đủ:** Hiện toàn bộ lưới (kể cả ô trống).

Cũng hỗ trợ Pause và Reset giống hai game còn lại.

---

## 3. Hệ thống Tài khoản

- Người chơi **bắt buộc đăng nhập** để sử dụng đầy đủ tính năng (Versus, lưu kỷ lục, Elo, bạn bè, leaderboard).
- Hỗ trợ các phương thức đăng nhập: Google, Discord, Email/Password.
- Cho phép chế độ **Guest**: chỉ được chơi Solo Practice, không lưu dữ liệu lên server, không chơi được Versus.

**Dữ liệu lưu cho mỗi tài khoản:**

- Username (duy nhất trên hệ thống)
- Avatar
- Elo của từng thể loại (Numbers / Alphabet / Grid) + Elo tổng
- Best Score của từng thể loại và từng Mode
- Level cao nhất đạt được ở mỗi thể loại
- Tổng số trận đã chơi, số trận thắng / thua / hòa
- Danh sách bạn bè
- Lịch sử khoảng 100 trận gần nhất (có thể xem lại chi tiết)

---

## 4. Hệ thống Bạn bè

- Người chơi có thể tìm kiếm người khác theo **username** hoặc **ID**.
- Gửi lời mời kết bạn → đối phương có thể chấp nhận hoặc từ chối.
- Trong danh sách bạn bè hiển thị trạng thái **online / offline** gần realtime.
- Có nút **“Mời đấu”** ngay cạnh mỗi người bạn để tạo phòng Versus nhanh chóng.
- Có thể xem Best Score và Elo hiện tại của bạn bè.

---

## 5. Các chế độ chơi

### 5.1. Solo Practice
- Luyện tập tự do, không áp lực.
- Không lưu kỷ lục.
- Không ảnh hưởng Elo.
- Có thể bật tùy chọn xem đáp án sau khi trả lời xong lượt.

### 5.2. Solo Ranked
- Chơi một mình để leo rank và phá kỷ lục.
- Kết quả được lưu vào kỷ lục cá nhân.
- Ảnh hưởng đến Elo Solo và xuất hiện trên Leaderboard.

### 5.3. Versus Ranked
- Đối kháng 1vs1 có tính Elo.
- Hai người chơi phải cùng một thể loại, cùng Mode độ khó.
- Hệ thống dùng **cùng một seed** để sinh đề bài giống hệt nhau cho cả hai.
- Người hoàn thành đúng và có thời gian nhanh hơn sẽ thắng.
- Nếu cả hai đều sai → hòa, hoặc so sánh số item đúng nhiều hơn (tùy cách implement chi tiết).

### 5.4. Versus Unranked
- Đối kháng 1vs1 mang tính vui vẻ.
- Không ảnh hưởng Elo và không lưu vào kỷ lục xếp hạng.

**Cách tạo trận Versus:**
- Mời bạn bè trực tiếp từ danh sách.
- Tạo phòng riêng và chia sẻ **mã phòng** hoặc **link**.
- Sử dụng **Quick Match** (ghép tự động theo Elo).

---

## 6. Matchmaking theo Elo (Quick Match)

Khi người chơi chọn Quick Match:

1. Hệ thống tìm những người đang online, cùng thể loại game, và có Elo gần nhất với người chơi hiện tại.
2. **Khoảng Elo ban đầu** cho phép ghép: **±100 điểm**.
3. Nếu sau **10 giây** không tìm được đối thủ, hệ thống tự động mở rộng khoảng thêm **±50 điểm**.
4. Cứ mỗi 10 giây không ghép được thì tiếp tục mở rộng, tối đa đến **±300 điểm**.
5. Thời gian chờ tối đa khoảng **60–90 giây**. Hết thời gian sẽ thông báo “Không tìm thấy đối thủ” và cho phép thử lại.
6. **Ưu tiên** ghép bạn bè đang online trước nếu họ nằm trong khoảng Elo hợp lệ.
7. Mỗi thể loại có **hàng đợi riêng** (Numbers Queue, Alphabet Queue, Grid Queue) để tránh ghép nhầm thể loại.

---

## 7. Công thức tính điểm (Score)

Điểm số được tính sau mỗi ván chơi ở chế độ Ranked (Solo Ranked hoặc Versus Ranked).

### Công thức tổng

```
Final Score = (Base Score + Speed Bonus) × Difficulty Multiplier × Perfect Bonus × Completion Multiplier
```

### Chi tiết từng thành phần

**1. Base Score**

```
Base Score = 100 × n × (n - 1)
```

Trong đó `n` là số lượng item đúng liên tiếp cao nhất mà người chơi đạt được trong ván đó.

**2. Speed Bonus**

```
Speed Bonus = max(0, TimeLimit - TimeTaken) × Hệ số tốc độ
```

Hệ số tốc độ theo thể loại:
- Numbers Game: **8** điểm / giây
- Alphabet Game: **10** điểm / giây
- Grid Number Game: **12** điểm / giây

**3. Difficulty Multiplier**

| Mode       | Hệ số |
|------------|-------|
| Easy       | × 1.0 |
| Medium     | × 1.3 |
| Hard       | × 1.7 |
| Super Hard | × 2.2 |

**4. Perfect Bonus**
- Nếu người chơi không sai lần nào trong toàn bộ ván → nhân thêm **× 1.25**
- Nếu có sai → nhân **× 1.0**

**5. Completion Multiplier**
- Hoàn thành toàn bộ ván / level: **× 1.0**
- Thất bại giữa chừng: **× 0.6**

Điểm cuối cùng được **làm tròn thành số nguyên**.

---

## 8. Hệ thống Elo

Game sử dụng công thức Elo chuẩn (giống cờ vua).

### Công thức

**Điểm kỳ vọng của người chơi A:**

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
```

**Elo mới của A:**

```
R_A_new = R_A + K × (S_A - E_A)
```

Trong đó:
- `R_A`, `R_B`: Elo hiện tại của hai người chơi
- `S_A`: Kết quả thực tế (1 = thắng, 0.5 = hòa, 0 = thua)
- `K`: Hệ số biến động

### Hệ số K động theo Elo

| Elo hiện tại của người chơi | Giá trị K |
|------------------------------|-----------|
| Dưới 1200                    | 40        |
| 1200 – 1599                  | 32        |
| 1600 – 1999                  | 24        |
| Từ 2000 trở lên              | 16        |

### Các quy tắc bổ sung

- Mỗi thể loại (Numbers / Alphabet / Grid) có **Elo riêng**.
- Có thêm **Elo tổng** (tính trung bình có trọng số từ 3 Elo riêng).
- Elo khởi đầu của người chơi mới: **1000**.
- Elo có **sàn tối thiểu** là **100** (không cho phép về số âm hoặc quá thấp).
- Chỉ các trận **Versus Ranked** mới ảnh hưởng đến Elo.

---

## 9. Leaderboard và Hệ thống Kỷ lục

### Các loại bảng xếp hạng

- **Global All-time**: Xếp hạng theo Best Score và theo Elo của từng thể loại (không giới hạn thời gian).
- **Weekly Leaderboard**: Xếp hạng trong tuần, reset vào đầu tuần.
- **Monthly Leaderboard**: Xếp hạng trong tháng, reset vào đầu tháng.
- **Friends Leaderboard**: Chỉ hiển thị những người nằm trong danh sách bạn bè.
- **Top User từng game**: Top 100 người chơi xuất sắc nhất của từng thể loại.

### Dữ liệu kỷ lục được lưu cho mỗi người chơi

- Best Score cao nhất của từng thể loại + từng Mode
- Thời điểm đạt được kỷ lục
- Level cao nhất từng đạt được
- Elo hiện tại và Peak Elo (Elo cao nhất từng có)
- Tổng số trận, Win rate Versus
- Lịch sử chi tiết khoảng 100 trận gần nhất

**Lưu ý quan trọng:** Chỉ các ván chơi ở chế độ **Ranked** mới được ghi nhận vào kỷ lục và Leaderboard.

---

## 10. Luồng người dùng chính (User Flow)

1. Người chơi truy cập website → màn hình Landing / Login.
2. Đăng nhập thành công (hoặc chọn chơi Guest) → vào **Lobby**.
3. Tại Lobby có các lựa chọn chính:
   - Solo
   - Versus
   - Bạn bè
   - Leaderboard
   - Hồ sơ cá nhân
4. Người chơi chọn thể loại game + Mode độ khó + loại trận (Ranked / Unranked / Practice).
5. Nếu chọn Versus Ranked → vào hàng đợi Matchmaking, hoặc mời bạn, hoặc tạo phòng.
6. Bắt đầu ván chơi:
   - Hiện pha **Viewing**
   - Chuyển sang pha **Answering**
   - Hiện kết quả của từng lượt
7. Kết thúc ván → màn hình **Result**:
   - Hiển thị điểm số đạt được
   - Thay đổi Elo (nếu có)
   - Thông báo kỷ lục mới (nếu phá)
   - Các nút: Chơi lại / Về Lobby / Xem chi tiết
8. Từ Lobby người chơi có thể vào xem hồ sơ, quản lý bạn bè, hoặc xem các bảng xếp hạng.

---

## 11. Các quy tắc kỹ thuật bắt buộc khi triển khai

- Trong chế độ Versus, hai người chơi **bắt buộc** phải sử dụng chung một `seed` để đảm bảo đề bài được sinh ra giống hệt nhau.
- Thời gian đếm ngược của pha Viewing và Answering nên được kiểm soát phía server hoặc sử dụng cơ chế timer đáng tin cậy để hạn chế gian lận (tua thời gian phía client).
- Cần có các biện pháp chống gian lận cơ bản: giới hạn tốc độ click/bấm, phát hiện pattern bất thường của bot.
- Dữ liệu cấu hình (số level, thời gian, mode…) nên được lưu ở `localStorage` cho người chơi Guest, và đồng bộ lên server khi người chơi đã đăng nhập.
- Giao diện phải **responsive**, hoạt động tốt trên cả máy tính và điện thoại (đặc biệt quan trọng với Grid Number Game và bàn phím Numbers).
- Nên có cơ chế Reconnect: nếu người chơi mất kết nối trong Versus, cho phép quay lại trong khoảng 45–60 giây, quá thời gian sẽ bị xử thua.

---

## 12. Ghi chú triển khai cho AI / Developer

Tài liệu này được viết với mục tiêu **không mơ hồ**. Khi implement, nên ưu tiên theo thứ tự:

1. Xây dựng 3 game cốt lõi (Numbers → Alphabet → Grid) chạy được ở chế độ Solo Practice trước.
2. Thêm hệ thống tài khoản và lưu dữ liệu cơ bản.
3. Implement công thức tính điểm và lưu Best Score.
4. Xây dựng Versus + đồng bộ seed.
5. Thêm Elo + Matchmaking.
6. Xây dựng hệ thống bạn bè và Leaderboard.
7. Tối ưu responsive + anti-cheat cơ bản.

Mọi con số (thời gian, số lượt, hệ số điểm, K-factor…) đều có thể điều chỉnh sau thông qua trang Settings hoặc config file, không nên hard-code cứng trong logic cốt lõi.

---

## 13. Mobile UX Guidelines (Version 1)

Game được thiết kế **Mobile-first**, ưu tiên portrait.

### 13.1. Quy tắc bố cục bắt buộc
- Khóa hướng dọc (portrait) trên điện thoại.
- Hỗ trợ landscape trên tablet và desktop.
- Tất cả nút bấm tối thiểu **48×48px**, khoảng cách giữa các nút ≥ 8px.
- Nội dung quan trọng phải nằm trong safe-area (tránh notch, Dynamic Island, thanh điều hướng ảo).
- Mặc định dùng **Dark Mode**.
- Font tối thiểu 14px.

### 13.2. Bàn phím & Input
**Numbers Game:**
- Lưới 3×3 chiếm gần hết chiều rộng màn hình (trừ padding 16px mỗi bên).
- Nút số đủ lớn, có hiệu ứng nhấn rõ ràng.

**Alphabet Game:**
- Layout QWERTY 4 hàng.
- Nút đủ lớn để bấm thoải mái bằng ngón tay.

**Grid Number Game:**
- Ô lưới tối thiểu khoảng 36–40px.
- Lưới lớn (8×8 trở lên) ở Version 1 chưa cần zoom/pan phức tạp.
- Khi bấm sai: ô nhấp nháy đỏ.

### 13.3. Feedback cơ bản
- Bấm đúng/sai có thay đổi màu rõ ràng.
- Khi hoàn thành level hoặc phá kỷ lục có hiệu ứng nổi bật.
- Haptic (rung) khi bấm sai và khi thắng level (nếu thiết bị hỗ trợ).

### 13.4. Các màn hình chính
- **Lobby**: Thanh điều hướng dưới cố định (Solo / Versus / Friends / Rank / Profile).
- **In-game**: Header mỏng chứa level + timer, khu vực chơi chiếm tối đa không gian.
- **Result**: Điểm số lớn ở giữa, nút “Chơi lại” nổi bật.

---

## 14. Onboarding & First-time Experience (Version 1)

### 14.1. Lần đầu mở game
- Hiện 2 lựa chọn rõ ràng:
  - **Chơi ngay (Guest)**
  - **Đăng nhập**
- Guest chỉ được chơi Solo Practice, không lưu dữ liệu lên server, không chơi Versus.

### 14.2. Tutorial đơn giản
Tutorial rất ngắn (3 bước), có nút **Bỏ qua**, chỉ hiện **một lần**:
- **Numbers / Alphabet**: Nhìn dãy → Dãy biến mất → Nhập lại đúng thứ tự.
- **Grid**: Nhìn vị trí các số → Số biến mất → Bấm theo thứ tự từ 1 → n.

### 14.3. Chuyển Guest sang tài khoản
Khi Guest đăng nhập thành công:
- Hỏi “Bạn có muốn giữ level cao nhất và best score đã chơi không?”
- Nếu đồng ý → merge dữ liệu (giữ giá trị cao hơn).
- Versus và Elo chỉ bắt đầu sau khi có tài khoản.

---

## 15. Content & Progression (Version 1)

### 15.1. Hệ thống 10 level cố định
Giữ nguyên bảng level như mục 2 của tài liệu gốc.

### 15.2. Endless Mode (mở khóa sau Level 10)
Sau khi người chơi hoàn thành **Level 10** của bất kỳ thể loại nào:

- Mở khóa **Endless Mode**.
- **Numbers / Alphabet**: Số ký tự bắt đầu từ 16 và tăng thêm +1 sau mỗi 3 lượt thắng liên tiếp.
- **Grid**: Sau lưới 10×10, `beginCount` tiếp tục tăng thêm 2 mỗi lần thắng đủ 3 lượt. Có thể mở rộng lên lưới 11×11, 12×12… ở các phiên bản sau.
- Có bảng xếp hạng Endless riêng (xếp theo số item / beginCount cao nhất đạt được).
- Endless Mode chỉ áp dụng cho Solo Ranked và Solo Practice (chưa hỗ trợ Versus ở Version 1).

### 15.3. Những gì chưa làm ở Version 1
- Daily Challenge / Weekly Challenge
- Achievement / Badge system
- Season / Soft reset Elo
- Cosmetics / Theme cửa hàng

---

## 16. Tech Stack (Version 1 → Scale)

> Mục tiêu:
>
> - ✅ Chi phí khởi đầu: **0đ**
> - ✅ Web Game Mobile First
> - ✅ Dễ phát triển
> - ✅ Dễ mở rộng sau này
> - ✅ Tận dụng React + .NET hiện có

### 16.1. Frontend

| Công nghệ       | Lựa chọn                        | Lý do                          |
|-----------------|---------------------------------|--------------------------------|
| Framework       | React 19 + Vite                 | Nhanh, nhẹ, SPA phù hợp game   |
| Language        | TypeScript                      | Type-safe                      |
| Styling         | Tailwind CSS                    | Responsive nhanh               |
| UI              | shadcn/ui                       | Dễ custom giao diện game       |
| State           | Zustand                         | Đơn giản, đủ mạnh              |
| Server State    | TanStack Query                  | Cache API, Retry, Loading      |
| Form            | React Hook Form + Zod           | Validate form                  |
| Animation       | Motion (Framer Motion)          | Countdown, Popup, Transition   |
| Icon            | Lucide React                    | Nhẹ                            |
| PWA             | vite-plugin-pwa                 | Cài lên điện thoại như App     |

### 16.2. Backend

| Công nghệ       | Lựa chọn                        |
|-----------------|---------------------------------|
| Framework       | ASP.NET Core 9 Web API          |
| Realtime        | SignalR                         |
| ORM             | Entity Framework Core           |
| Validation      | FluentValidation                |
| Authentication  | Google OAuth + JWT              |
| Logging         | Serilog                         |

### 16.3. Database & Cache

| Công nghệ       | Lựa chọn                        |
|-----------------|---------------------------------|
| Database        | PostgreSQL                      |
| Cache           | Redis                           |

### 16.4. Cloud Storage

| Thành phần      | Lựa chọn                        |
|-----------------|---------------------------------|
| Avatar          | Cloudflare R2                   |

### 16.5. DevOps

| Công nghệ       | Lựa chọn                        |
|-----------------|---------------------------------|
| Source Control  | GitHub                          |
| CI/CD           | GitHub Actions                  |
| Container       | Docker                          |
| Orchestration   | Docker Compose                  |

### 16.6. Free Hosting (Version 1)

**Frontend**
- Vercel
- hoặc Cloudflare Pages

**Database**
- Neon PostgreSQL (Free)
- hoặc Supabase PostgreSQL (Free)

**Redis**
- Upstash Redis Free

**Backend**
- Giai đoạn phát triển: Chạy Local bằng Docker
- Demo online: Railway Free hoặc Render Free

### 16.7. Local Development

```text
Docker Compose
├── Frontend
├── ASP.NET Core API
├── PostgreSQL
└── Redis
```

Chỉ cần chạy:

```bash
docker compose up
```

Là có toàn bộ môi trường.

### 16.8. Kiến trúc Version 1

```text
                React + Vite (PWA)
                        │
        TanStack Query │ SignalR
                        │
               ASP.NET Core API
                 ├──────────────┐
                 │              │
            PostgreSQL        Redis
```

### 16.9. Các tính năng Version 1

**Authentication**
- Google Login
- Guest Login

**Gameplay**
- Numbers
- Alphabet
- Grid

**Mode**
- Solo Practice
- Solo Ranked
- Versus Ranked / Unranked (cơ bản)
- Endless Mode (sau Level 10)

**User**
- Profile
- Best Score
- Elo
- Match History

**Ranking**
- Global Leaderboard
- Friends Leaderboard

**Mobile**
- Responsive
- PWA
- Fullscreen

**UX**
- Animation
- Loading
- Error State
- Haptic feedback cơ bản

### 16.10. Khi có khoảng 100 người chơi
Không đổi công nghệ. Deploy lên VPS.

```text
Ubuntu VPS
Docker Compose
├── React
├── ASP.NET Core
├── PostgreSQL
├── Redis
└── Nginx
```

### 16.11. Khi có khoảng 1.000 người chơi
Bổ sung:
- HTTPS
- Cloudflare CDN
- Backup Database
- Monitoring

```text
Cloudflare
↓
Nginx
↓
ASP.NET Core
↓
PostgreSQL
↓
Redis
```

Không cần đổi framework.

### 16.12. Khi có khoảng 10.000 người chơi
Tách service.

```text
                  React
                     │
               API Gateway
        ┌────────────┴────────────┐
     User API                 Game API
        │                         │
   PostgreSQL               SignalR Hub
                                   │
                                Redis
```

**User API**
- Login, Profile, Friend, History, Leaderboard

**Game API**
- Match, Room, Realtime, Countdown

### 16.13. Khi có khoảng 100.000 người chơi
Nếu SignalR trở thành bottleneck → chỉ tách Game Server.

```text
                   React
                      │
               Load Balancer
          ┌───────────┴────────────┐
   ASP.NET Core API          Go Game Server
          │                         │
     PostgreSQL              Redis Pub/Sub
```

ASP.NET Core vẫn giữ: Login, User, Profile, History, Ranking.  
Go chỉ xử lý: Matchmaking, Room, WebSocket, Tournament.  
⇒ Không phải viết lại toàn bộ hệ thống.

### 16.14. Sau này có thể bổ sung
- RabbitMQ / Kafka / BackgroundService
- Sentry / Grafana / Prometheus
- MinIO / Cloudflare R2
- Kubernetes (chỉ khi thật sự cần)

### 16.15. Những công nghệ KHÔNG sử dụng ở Version 1

**Frontend**
- ❌ Next.js (không cần SSR/SEO, game là SPA)
- ❌ Redux (Zustand đơn giản hơn)

**Backend**
- ❌ NestJS / Fastify (đã có kinh nghiệm ASP.NET Core)

**Database**
- ❌ Firebase / MongoDB (dữ liệu quan hệ mạnh → PostgreSQL phù hợp hơn)

**Game Engine**
- ❌ Unity / Godot / Phaser (game thiên về UI + Logic, React đủ đáp ứng)

### 16.16. Stack cuối cùng

| Layer          | Technology                      |
|----------------|---------------------------------|
| Frontend       | React 19 + Vite                 |
| Language       | TypeScript                      |
| UI             | Tailwind CSS + shadcn/ui        |
| State          | Zustand                         |
| API State      | TanStack Query                  |
| Form           | React Hook Form + Zod           |
| Animation      | Motion                          |
| Backend        | ASP.NET Core 9                  |
| Realtime       | SignalR                         |
| ORM            | Entity Framework Core           |
| Validation     | FluentValidation                |
| Authentication | Google OAuth + JWT              |
| Database       | PostgreSQL                      |
| Cache          | Redis                           |
| Storage        | Cloudflare R2                   |
| Logging        | Serilog                         |
| PWA            | vite-plugin-pwa                 |
| CI/CD          | GitHub Actions                  |
| Container      | Docker Compose                  |

### 16.17. Roadmap triển khai

**Phase 1 (0đ – Local)**
- React + Vite
- ASP.NET Core
- PostgreSQL
- Redis
- Docker Compose
- Chạy Local

**Phase 2 – Demo online**
- Vercel (Frontend)
- Railway / Render (Backend)
- Neon PostgreSQL
- Upstash Redis

**Phase 3 – Có người chơi**
- Thuê VPS
- Deploy bằng Docker Compose

**Phase 4 – Nhiều người chơi**
- Cloudflare + Nginx
- Monitoring + Backup

**Phase 5 – Scale lớn**
- Tách Game API
- Redis Pub/Sub
- Load Balancer
- Go Game Server (nếu cần)

Không phải rewrite toàn bộ dự án.

---

## 17. Quy tắc kỹ thuật bổ sung cho Version 1

- Versus **bắt buộc** dùng chung một `seed` do server tạo.
- Timer Viewing & Answering do **server kiểm soát** (client chỉ hiển thị).
- Reconnect window trong Versus: **60 giây**. Hết thời gian → xử thua.
- Guest dùng `localStorage`. Khi đăng nhập → đồng bộ level cao nhất và best score.
- Rate-limit cơ bản số lần bấm để hạn chế bot.
- Dữ liệu cấu hình game (thời gian, số lượt, hệ số…) lưu ở server, có thể chỉnh mà không cần deploy lại.

---

## 18. Thứ tự triển khai Version 1 (khuyến nghị)

1. 3 game cốt lõi chạy được ở **Solo Practice** (Numbers → Alphabet → Grid).
2. Mobile UX cơ bản + Haptic.
3. Onboarding + Tutorial ngắn.
4. Hệ thống tài khoản (Guest + Google Login).
5. Lưu Best Score + Level cao nhất.
6. Công thức tính điểm + Solo Ranked.
7. Endless Mode (mở sau Level 10).
8. Versus cơ bản (tạo phòng bằng mã + shared seed + server timer).
9. Elo đơn giản + Global Leaderboard.
10. Bạn bè (kết bạn + mời đấu).
11. PWA + tối ưu mobile.
12. Sửa lỗi và chuẩn bị demo.

---

**Kết thúc tài liệu thiết kế Memory Arena (Version 1).**
