# Mock Auth API — học cách giả lập backend trước khi có backend thật

Tài liệu này giải thích phần mock API đăng nhập vừa được setup, để hiểu **vì sao** làm vậy và
**từng mảnh khớp với nhau thế nào** — không chỉ chép lại code.

---

## 1. Vấn đề cần giải quyết

Theo [`docs/technical/README.md`](README.md), Version 1 dự định dùng **ASP.NET Core Web API** làm
backend thật, nhưng backend đó **chưa tồn tại**. Trong lúc chờ, frontend vẫn cần:

- Gọi API theo đúng hình dạng (shape) sẽ dùng sau này (HTTP, JSON, status code, JWT-style token).
- Test được cả đường thành công lẫn đường lỗi (sai mật khẩu, mất mạng...).
- Khi backend thật xong, chỉ cần đổi 1 chỗ (base URL) — không phải viết lại `authService`.

Cách sai (đã sửa): trước đây `authService` **không gọi mạng thật**, chỉ ghi thẳng
`localStorage.setItem('ma_session', ...)`. Trông có vẻ "hoạt động" nhưng không dạy được gì về cách
frontend thật sự nói chuyện với backend, và không có chỗ để tách riêng "server trả lỗi" khỏi
"code React xử lý lỗi sai".

**Giải pháp:** để `authService` gọi HTTP thật (qua Axios) tới `/api/auth/*`, và có một "server giả"
đứng ra trả lời các request đó. Có 2 cách làm "server giả" — dự án này setup cả 2 để so sánh.

---

## 2. Hai cách giả lập server

### Cách 1 — MSW (Mock Service Worker)

File: [`src/mocks/handlers.ts`](../../frontend/src/mocks/handlers.ts),
[`src/mocks/browser.ts`](../../frontend/src/mocks/browser.ts)

MSW cài một **Service Worker** vào trình duyệt. Khi code gọi `axios.post('/api/auth/guest')`,
request này **thật sự đi ra qua network stack của browser** (thấy được trong tab Network của
DevTools) — nhưng Service Worker chặn nó lại trước khi ra khỏi máy, và tự trả JSON giả về.

```text
React component
      │  axios.post('/api/auth/guest')
      ▼
Service Worker (chạy trong browser, ngoài luồng JS chính)
      │  khớp URL với handlers.ts → trả response giả
      ▼
Promise resolve trong axios y như gọi server thật
```

Ưu điểm: không cần chạy thêm process nào, không cần lo CORS (cùng origin `/api`), request vẫn
"thật" ở tầng network nên debug bằng DevTools y hệt sau này.

Nhược điểm: chỉ hoạt động trong browser (không dùng được nếu muốn test bằng `curl` hay Postman),
và người mới dễ thấy "ảo" vì không có server nào thật sự chạy.

### Cách 2 — Standalone mock server (Node/Express)

File: [`mock-server/index.mjs`](../../frontend/mock-server/index.mjs)

Đây là một **process Node thật**, nghe ở một port riêng (`4310`), y như một backend thật — chỉ
khác là data toàn bộ là giả, không có database.

```text
React component (chạy ở port Vite, vd 5173)
      │  axios.post('http://localhost:4310/api/auth/guest')
      ▼
Node/Express process riêng (port 4310)
      │  route khớp → trả JSON giả
      ▼
Response quay lại qua network thật, phải có CORS vì khác origin/port
```

Ưu điểm: đúng nghĩa đen "có một server" — dễ hình dung, test được bằng `curl`/Postman độc lập với
frontend, gần với việc chạy backend thật (`docker compose up` sau này) hơn.

Nhược điểm: phải nhớ start/stop thêm 1 process, phải tự cấu hình CORS (xem middleware trong
`index.mjs`), có thể đụng port với process khác trên máy (đây là lý do port đổi từ `4000` sang
`4310` — máy đang có sẵn thứ gì đó chiếm `4000`).

### Chọn chế độ nào đang chạy

Biến môi trường `VITE_MOCK_MODE` (đọc trong [`src/main.tsx`](../../frontend/src/main.tsx) và
[`src/services/http/api-client.ts`](../../frontend/src/services/http/api-client.ts)):

| `VITE_MOCK_MODE` | `VITE_API_BASE_URL` | Ai trả lời |
|---|---|---|
| `msw` (mặc định, [`.env.development`](../../frontend/.env.development)) | `/api` | Service Worker |
| `server` | `http://localhost:4310/api` | `mock-server/index.mjs` |

Đổi sang `server`: tạo file `frontend/.env.development.local` (đã gitignore, không commit) — chi
tiết ở [`mock-server/README.md`](../../frontend/mock-server/README.md).

---

## 3. Contract chung — cả 2 cách phải trả lời giống nhau

| Method | Path | Trả về khi thành công | Trả về khi lỗi |
|---|---|---|---|
| POST | `/api/auth/guest` | `{ user, token }` | — |
| POST | `/api/auth/login` | `{ user, token }` | `401 { message }` nếu email/password sai |
| POST | `/api/auth/oauth/:provider` | `{ user, token }` | — |
| GET | `/api/auth/session` | `{ user }` (đọc token từ header `Authorization`) | `401` nếu token thiếu/hỏng |
| POST | `/api/auth/logout` | `204` | — |

Vì 2 backend giả là 2 runtime tách biệt (browser vs Node process riêng), logic tạo user/token
được **viết trùng lặp có chủ đích** ở 2 nơi:

- [`src/mocks/fake-users.ts`](../../frontend/src/mocks/fake-users.ts) — dùng cho MSW (TypeScript,
  nằm trong bundle Vite).
- [`mock-server/fake-users.mjs`](../../frontend/mock-server/fake-users.mjs) — dùng cho standalone
  server (plain JS, Node chạy trực tiếp, không qua build của Vite nên không import được file `.ts`
  kia).

Đây là một ví dụ hợp lệ của "trùng lặp có chủ đích": tách 1 module dùng chung sẽ cần thêm bước
build/transpile cho 1 file JS nhỏ — không đáng, nên chấp nhận giữ 2 bản gần giống nhau, có comment
trỏ qua lại để ai sửa 1 bên thì nhớ sửa bên kia.

---

## 4. Mock token — thay thế cho JWT thật

`docs/technical/README.md` ghi backend thật dùng "Google OAuth + JWT". Ở bản mock, để mô phỏng
hình dạng đó mà không cần ký (sign) thật:

```
mock.<base64(JSON.stringify(user))>
```

Không có chữ ký, không hết hạn — chỉ là JSON của `user` được encode base64, tiền tố `mock.` để
nhận biết. Client chỉ lưu **token** vào `localStorage` (key `ma_token`), không lưu `user` trực
tiếp — mọi lần cần biết "ai đang đăng nhập", client gửi token lên `GET /api/auth/session`, và
server (giả) tự decode token ra `user`. Đây là lý do `checkSession()` giờ là một request mạng thật,
không phải đọc thẳng localStorage như bản cũ.

---

## 5. Đường đi của một request thật (ví dụ: bấm "Play Now")

```text
LandingScreen.tsx
  → handlePlayNow()
  → useAuthStore.loginAsGuest()          (Zustand — quản lý isLoading/errorMessage)
  → authService.loginAsGuest()           (src/services/auth/auth.service.ts)
  → apiClient.post('/auth/guest')        (src/services/http/api-client.ts — instance Axios)
  → [MSW hoặc mock-server trả JSON giả]
  → saveToken(data.token)                (ghi vào localStorage key 'ma_token')
  → return data.user                     (Zustand set({ user, isLoading: false }))
```

`apiClient` (trong `api-client.ts`) có một request interceptor tự gắn header
`Authorization: Bearer <token>` từ `localStorage` vào **mọi** request — đây là lý do
`authService` không cần tự thêm header đó ở từng hàm.

---

## 6. Cơ chế online/offline — event-driven, không phải polling

`isOffline` (dùng trong `LandingScreen`/`LoginScreen` để disable nút, hiện banner) **không hề gọi
API định kỳ để kiểm tra mạng**. Toàn bộ nằm trong
[`src/stores/network.store.ts`](../../frontend/src/stores/network.store.ts):

```ts
window.addEventListener('online', () => set({ isOffline: false, isOnline: true }))
window.addEventListener('offline', () => set({ isOffline: true, isOnline: false }))
```

- Giá trị ban đầu lấy từ `navigator.onLine` — thuộc tính có sẵn của browser.
- Sau đó chỉ **đăng ký lắng nghe** 2 sự kiện native `online`/`offline`. Chính **trình duyệt** tự bắn
  2 sự kiện này khi hệ điều hành báo card mạng đổi trạng thái (rút dây LAN, tắt WiFi, bật chế độ
  máy bay...) — code không chủ động hỏi, chỉ ngồi chờ callback. Không `setInterval`, không `fetch`
  lặp lại, không tốn băng thông.

**Giới hạn cần nhớ:** `navigator.onLine` chỉ nói "card mạng có đang bật", **không đảm bảo có
Internet thật** hay server đích có sống không. Ví dụ vẫn báo `isOffline = false` dù:
- Đang ở mạng WiFi có captive portal (khách sạn/quán cà phê) nhưng chưa qua bước đăng nhập cổng.
- Mạng vẫn thông nhưng đúng lúc mock server / API thật bị sập.

Vì vậy trong code có **2 tầng xử lý offline tách biệt, không thay thế cho nhau**:

| Tầng | Ở đâu | Phát hiện được gì |
|---|---|---|
| `isOffline` (network.store) | Trước khi bấm nút — disable UI, hiện banner sớm | Chỉ "card mạng có bật không", rẻ và tức thời |
| Lỗi thật của request | [`auth.service.ts`](../../frontend/src/services/auth/auth.service.ts) → `toFriendlyError`, bắt `axios.isAxiosError(err)` mà `!err.response` | Ground truth: request có thật sự tới được server hay không |

`isOffline` chỉ để chặn sớm cho đỡ phí 1 request khi gần như chắc chắn không có mạng, và cho UX
mượt hơn (disable nút ngay). Việc xác nhận "server có trả lời không" luôn phải dựa vào kết quả
request thật — đây là lý do dù `isOffline` báo sai (false negative), app vẫn không "toang": request
cứ đi, rớt thì rơi vào nhánh `catch` của `authService` và hiện "Network error. Please check your
connection."

---

## 7. Khi có backend ASP.NET Core thật

1. Đổi `VITE_API_BASE_URL` trỏ vào URL API thật.
2. Xoá đoạn bootstrap MSW trong `main.tsx` (khối `if (useMsw) { ... }`).
3. Xoá thư mục `mock-server/` và `src/mocks/` nếu không cần nữa.
4. `authService` và `apiClient` **không cần sửa gì** — đó chính là lý do tách API call ra khỏi
   logic giả lập ngay từ đầu.
