# Pages Component Kit Refactor Guide

Tài liệu này tổng hợp các cụm UI trong `frontend/src/pages` có thể tách thành component kit dùng lại. Mục tiêu là giúp Claude refactor theo hướng giảm lặp, giữ đúng design system hiện có, và không đổi hành vi screen.

## Mục tiêu

- Gom các pattern lặp lại ở cấp screen thành component kit tái sử dụng.
- Giữ nguyên layout, nội dung, và flow đã có trong UI docs.
- Ưu tiên tách các khối có nhiều màn hình dùng chung trước, sau đó mới tới các khối chỉ xuất hiện ở một nhóm màn hình nhỏ.

## Nguyên tắc refactor

- Không tách atom nhỏ nếu đã có sẵn trong `components/ui`.
- Không redesign lại màn hình trong lúc tách component.
- Không đổi luồng sản phẩm hoặc gameplay.
- Mỗi component kit nên bao phủ một pattern rõ ràng, không ôm quá nhiều trách nhiệm.

## Ưu tiên tách trước

### 1. Page shell / screen wrapper

Pattern lặp lại ở nhiều màn:

- `frontend/src/pages/home/HomeScreen.tsx`
- `frontend/src/pages/lobby/LobbyScreen.tsx`
- `frontend/src/pages/game-select/GameSelectScreen.tsx`
- `frontend/src/pages/leaderboard/LeaderboardScreen.tsx`
- `frontend/src/pages/profile/ProfileScreen.tsx`
- `frontend/src/pages/result/ResultScreen.tsx`
- `frontend/src/pages/auth/LoginScreen.tsx`
- `frontend/src/pages/settings/SettingsScreen.tsx`

Nên tách thành:

- `ScreenShell`
- `ScreenSurface`
- `ScreenContentStack`

Lý do:

- Các màn này thường lặp `min-h-dvh`, background, padding, spacing đáy cho nav/overlay, và cấu trúc cột chính.
- Đây là lớp wrapper có giá trị tái sử dụng cao nhất.

### 2. Screen header / top bar

Pattern lặp ở:

- `frontend/src/pages/home/HomeScreen.tsx`
- `frontend/src/pages/lobby/LobbyScreen.tsx`
- `frontend/src/pages/leaderboard/LeaderboardScreen.tsx`
- `frontend/src/pages/profile/ProfileScreen.tsx`
- `frontend/src/pages/game-select/GameSelectScreen.tsx`

Nên tách thành:

- `ScreenHeader`
- `ScreenHeaderWithBack`
- `ScreenHeaderAction`

Lý do:

- Cùng kiểu: back button, title, subtitle, action phụ.
- Đây là một trong những pattern dễ chuẩn hóa nhất.

### 3. Empty / error / offline state card

Pattern lặp ở:

- `frontend/src/pages/home/HomeScreen.tsx`
- `frontend/src/pages/lobby/LobbyScreen.tsx`
- `frontend/src/pages/leaderboard/LeaderboardScreen.tsx`
- `frontend/src/pages/game/SequenceMemoryScreen.tsx`

Nên tách thành:

- `EmptyStateCard`
- `ErrorStateCard`
- `OfflineStateCard`

Lý do:

- Cùng cấu trúc: icon, title, short description, action.
- Dễ dùng lại cho screen, dialog, và trạng thái mạng.

### 4. Chip / segmented filter bar

Pattern lặp ở:

- `frontend/src/pages/leaderboard/LeaderboardScreen.tsx`
- `frontend/src/pages/game-select/GameSelectScreen.tsx`

Nên tách thành:

- `SegmentedControl`
- `ChipGroup`
- `FilterPills`

Lý do:

- Cùng là nhóm lựa chọn một trong nhiều trạng thái.
- Có thể dùng cho mode/game/time-range/tab filters.

### 5. Summary / hero stat card

Pattern lặp ở:

- `frontend/src/pages/home/HomeScreen.tsx`
- `frontend/src/pages/game-select/GameSelectScreen.tsx`
- `frontend/src/pages/result/ResultScreen.tsx`
- `frontend/src/pages/profile/ProfileScreen.tsx`

Nên tách thành:

- `HeroSummaryCard`
- `StatCard`
- `StatRow`

Lý do:

- Các màn này đều có khối tổng kết: score, progress, best score, rank, streak, mode info.
- Nếu gom đúng, có thể tái dùng cho Home, Result, Profile, Leaderboard.

### 6. Shortcut grid / action grid

Pattern lặp ở:

- `frontend/src/pages/home/HomeScreen.tsx`
- `frontend/src/pages/lobby/LobbyScreen.tsx`

Nên tách thành:

- `ShortcutGrid`
- `ShortcutTile`
- `IconActionGrid`

Lý do:

- Cùng kiểu layout icon + label + action.
- Dễ scale cho Home, Lobby, Settings entry, social actions.

## Ưu tiên tách tiếp theo

### 7. Game card / mode card

Pattern lặp rõ ở:

- `frontend/src/pages/game-select/GameSelectScreen.tsx`

Có thể mở rộng về sau cho:

- `frontend/src/pages/home/HomeScreen.tsx`
- `frontend/src/pages/result/ResultScreen.tsx`

Nên tách thành:

- `GameCard`
- `ModeCard`
- `GameMetaRow`

Lý do:

- Card này chứa icon, title, description, best score, difficulty, CTA.
- Theo design system, đây là component chuẩn để hiển thị lựa chọn game.

### 8. Auth form block

Pattern lặp ở:

- `frontend/src/pages/auth/LoginScreen.tsx`

Nên tách thành:

- `AuthPanel`
- `LabeledField`
- `FieldWithTrailingAction`

Lý do:

- Hiện tại phần auth có shell, form, message, and action riêng.
- Dù chưa lặp nhiều, đây là nơi dễ chuẩn hóa nếu sau này thêm register hoặc forgot password.

### 9. Settings composition

**Cập nhật:** Dọn xong — chỉ còn **một** implementation Settings. `SettingsScreenV1.tsx` đã xoá (mồ côi, không được import ở đâu). `SettingsScreenV2.tsx` đã xoá — UI của nó được merge vào `pages/settings/SettingsScreen.tsx` (giữ ProfileCard XP/Level/progress bar của bản gốc `settings` theo quyết định của chủ dự án, bổ sung thêm Login methods, Terms of service, và Session/Log out từ `SettingsScreenV2` cũ). `pages/settings/` (bản `SettingsScreen.tsx` không version cùng `SettingsSection`/`SettingsRow`/`SettingsToggle` riêng của nó) đã bị xoá toàn bộ folder — không còn trùng lặp nào ở cấp Settings. `App.tsx` giờ import thẳng `SettingsScreen` từ `pages/settings/SettingsScreen.tsx`, screen id `'settings'`, label "Settings".

**Lưu ý vi phạm Design Bible đã biết:** `ProfileCard` trong `pages/settings/SettingsScreen.tsx` hiển thị XP/Level/progress bar — vi phạm rõ `01-design-philosophy.md`/`11-screen-guidelines.md` ("Settings chỉ là cấu hình, không trộn gameplay"). Đây là quyết định có chủ đích của chủ dự án khi merge, không phải sai sót — giữ nguyên trừ khi có quyết định khác.

File còn lại (chỉ còn ở `pages/settings/`, không còn bản song song để so sánh):

- `frontend/src/pages/settings/SettingsScreen.tsx`
- `frontend/src/pages/settings/SettingsSection.tsx`
- `frontend/src/pages/settings/SettingsRow.tsx`
- `frontend/src/pages/settings/SettingsToggle.tsx`

Vẫn nên tách thành (không còn là "hợp nhất", giờ chỉ là tách kit như các mục #1–#8 phía trên):

- `SettingsPageShell`
- `SettingsSection`
- `SettingsRow`
- `SettingsToggle`
- `SettingsActionRow`

Lý do:

- Trùng lặp cấp screen đã hết. Việc còn lại chỉ là tách các file `Settings*.tsx` hiện có trong `pages/settings/` ra `components/ui/settings/` theo đúng cấu trúc kit đã đề xuất ở trên, không khác gì các screen khác trong danh sách.
- Thư mục `pages/settings/` giữ tên "2" dù giờ là bản duy nhất — cân nhắc đổi tên folder thành `pages/settings/` ở một bước dọn dẹp riêng (rename, không phải nội dung) để tên không còn gây hiểu lầm; chưa làm ở bước này vì chưa có yêu cầu.

## Không nên tách riêng lúc này

Các khối sau đã đủ nhỏ hoặc chỉ là atom level, nên giữ nguyên (không đổi vị trí file):

- `Input`
- `Dialog`
- `StatusBanner`
- `BottomNavBar`
- `StatePill`

Lý do:

- Chúng đã gần với component kit level sẵn có.
- Tách thêm lúc này dễ làm rối kiến trúc hơn là giảm lặp.

`Button` và `Card` **không** nằm trong nhóm giữ nguyên này — xem "Đề xuất cấu trúc thư mục kit" ngay dưới đây, cả hai được chuyển vào kit folder (`button/`, `card/`) ngay trong đợt refactor này.

## Đề xuất cấu trúc thư mục kit

Mục tiêu của cấu trúc này là tránh gom quá nhiều file vào một chỗ, và để mỗi kit có không gian riêng. Cách tổ chức nên ưu tiên theo component thay vì theo screen.

`Button` (hiện tại: `frontend/src/components/ui/button.tsx`) và `Card` (hiện tại: `frontend/src/components/ui/Card.tsx`) được di chuyển vào `ui/button/` và `ui/card/` như phần cấu trúc dưới đây ngay trong đợt refactor này — đây là quyết định đã chốt, không phải định hướng tương lai.

### Cấu trúc gợi ý

```text
frontend/src/components/
	ui/
		button/
			Button.tsx
			ButtonIcon.tsx
			button.types.ts
			index.ts
		card/
			Card.tsx
			HeroSummaryCard.tsx
			StatCard.tsx
			EmptyStateCard.tsx
			index.ts
		layout/
			ScreenShell.tsx
			ScreenHeader.tsx
			ScreenContentStack.tsx
			index.ts
		controls/
			SegmentedControl.tsx
			ChipGroup.tsx
			FilterPills.tsx
			index.ts
		grid/
			ShortcutGrid.tsx
			ShortcutTile.tsx
			index.ts
		form/
			LabeledField.tsx
			FieldWithTrailingAction.tsx
			AuthPanel.tsx
			index.ts
		settings/
			SettingsPageShell.tsx
			SettingsSection.tsx
			SettingsRow.tsx
			SettingsToggle.tsx
			SettingsActionRow.tsx
			index.ts
```

### Quy ước tổ chức

- Mỗi folder kit chỉ nên đại diện cho một nhóm trách nhiệm rõ ràng.
- Nếu một component có variant hoặc helper đi kèm, để chung trong cùng folder của kit đó.
- Mỗi folder nên có `index.ts` để export công khai, tránh import sâu lan man.
- Tên folder nên là số ít, ngắn, dễ đoán: `button`, `card`, `layout`, `controls`, `grid`, `form`, `settings`.

### Áp dụng cho `button`

Ví dụ bạn đưa ra là đúng hướng: `button` nên là một folder riêng, không để lẫn với các kit khác.

Nên hiểu theo mô hình:

- `button/` chứa mọi biến thể liên quan tới nút.
- Nếu sau này có `icon-button`, `split-button`, hoặc `button-group`, ưu tiên đặt cùng kit `button/` nếu nó cùng ngữ nghĩa.
- Không nên nhét `button` vào một file tổng kiểu `ui.ts` vì sẽ nhanh phình và khó bảo trì.

### Mapping giữa folder và pattern

- `button/` cho hành động cơ bản và biến thể nút.
- `card/` cho game card, summary card, empty state card, stat card.
- `layout/` cho screen shell, header, content stack.
- `controls/` cho chip, segmented control, filter pill.
- `grid/` cho shortcut/action grid.
- `form/` cho auth và field primitives.
- `settings/` cho toàn bộ hệ settings đang lặp.

### Điều cần tránh

- Không đặt mọi thứ vào một folder `components` phẳng rồi để 20 file cạnh nhau.
- Không tạo folder quá sâu như `components/ui/home/screen/header/` nếu nó chỉ phục vụ một màn.
- Không tách folder theo tên screen khi bản chất là một pattern dùng lại.

## Chuẩn hóa `enum`, `interface`, `api`, và `mock`

Ngoài component con, page file cũng thường bị phình vì chứa type, interface, mock data, và API stub. Các phần này nên tách theo quy ước cố định để Claude refactor dễ hơn.

### `enum`

- Ưu tiên gom enum dùng chung vào một file chia sẻ: `frontend/src/configs/enum.ts`.
- Các shared enum được định nghĩa bằng TypeScript `enum` (ví dụ `export enum ScreenState { NORMAL = 'normal', ... }`).
- **Tuyệt đối không so sánh bằng string literal thô** (ví dụ: `screenState === 'loading'`). Bắt buộc so sánh và gán bằng Enum member (ví dụ: `screenState === ScreenState.LOADING`).
- Nếu enum thực sự là domain-wide, đặt ở đây để tránh tạo nhiều `enum.ts` nhỏ lẻ rải theo feature.
- Chỉ tạo enum local trong feature khi có yêu cầu rõ ràng và enum đó không dùng nơi khác.

### `interface`

- Đặt interface theo feature, cùng folder với phần sử dụng chính của nó.
- Tên file nên dùng dạng rõ nghĩa như `xxx.interface.ts`.
- Nếu một feature có nhiều interface liên quan, gom chúng vào một file interface riêng thay vì để chung với component.

### `api`

- Mỗi feature nên có file API riêng, ví dụ `xxx.api.ts`.
- File này chỉ nên chứa logic gọi dữ liệu, adapter, mapper, và các hàm liên quan đến network hoặc service.
- Không để fetch logic trong component file nếu đã có thể chuyển sang API layer.

### `mock`

- Mock data nên để riêng, ví dụ `xxx.mock.ts` hoặc `mocks/xxx.mock.ts` nếu feature có nhiều mock.
- Mock chỉ dùng cho preview, story, test, hoặc screen prototype.
- Không để mock data nằm lẫn trong page file nếu nó có thể tái dùng hoặc làm file quá dày.

### Quy ước thực dụng

**Cập nhật (đã chốt, thay thế quy ước cũ ở trên):** `interface`/`api`/`mock` không đặt trong `pages/<feature>/` nữa — tất cả chuyển vào một thư mục riêng `frontend/src/services/<feature>/`, chia theo tên page giống hệt `pages/`, tách biệt hoàn toàn khỏi cả `pages/` lẫn `components/ui/`. Component con của page cũng không đặt phẳng ngay trong `pages/<feature>/` — phải nằm trong `pages/<feature>/components/`.

- `enum` dùng chung: `frontend/src/configs/enum.ts`
- `interface` theo feature: `frontend/src/services/<feature>/xxx.interface.ts`
- `api` theo feature: `frontend/src/services/<feature>/xxx.api.ts`
- `mock` theo feature: `frontend/src/services/<feature>/xxx.mock.ts` (dùng `.mock.tsx` nếu mock data có chứa JSX, ví dụ icon node)
- Component con của page: `frontend/src/pages/<feature>/components/xxx.tsx`

### Điều cần tránh

- Không giữ `type`, `interface`, `mock`, và `api` trong cùng một page file nếu page đó đã quá dày.
- Không nhân bản nhiều file `enum.ts` theo từng feature nếu enum có thể dùng chung.
- Không để API stub, mock data, và UI component trộn lẫn trong cùng một file screen.

## Khi 1 page có quá nhiều component con trong cùng file

Nếu một page file đang ôm nhiều component con nội bộ, nên tách các component đó ra file riêng ngay khi chúng có thể tự mang trách nhiệm riêng. Mục tiêu là để page chỉ còn đóng vai trò orchestration, còn logic hiển thị nằm ở component con.

### Quy tắc tách file

- Nếu component có thể đặt tên rõ ràng và có thể dùng lại hoặc test riêng, tách ra file riêng.
- Nếu component đang chứa markup lớn hơn một khối rõ ràng, tách trước khi tiếp tục thêm logic mới.
- Nếu component chỉ là helper icon SVG rất nhỏ, có thể giữ lại trong file cha cho đến khi cần reuse.
- Nếu page có 6 đến 10 component con trở lên, coi đó là tín hiệu mạnh để chia file.

### Ưu tiên tách trước

#### 1. Gameplay screen

File:

- [frontend/src/pages/gameplay/GameplayScreen.tsx](../../frontend/src/pages/gameplay/GameplayScreen.tsx)

Nên tách ra trước:

- `StatePill`
- `GameTypePill`
- `CountdownRing`
- `PhaseBanner`
- `StatRow`
- `NumberBoard`
- `KeypadButton`
- `AlphabetBoard`
- `GridBoard`
- `SequenceBoard`
- `PauseOverlay`
- `TutorialOverlay`
- `LoadingSkeleton`

Lý do:

- Đây là file densest và có nhiều pattern chơi game khác nhau cùng tồn tại.
- Page này nên trở thành orchestrator cho gameplay state, không nên giữ toàn bộ render tree trong một file.

#### 2. Sequence memory screen

File:

- [frontend/src/pages/game/SequenceMemoryScreen.tsx](../../frontend/src/pages/game/SequenceMemoryScreen.tsx)

Nên tách ra trước:

- `StatePill`
- `SkeletonTile`
- `EmptyState`
- `ErrorState`
- `OfflineBanner`
- `ProgressDots`
- `ScoreBadge`
- `PhaseLabel`
- `GameTile`
- `LoadingSkeleton`

Lý do:

- Có nhiều state UI khác nhau trong cùng một file.
- Những khối này tách ra sẽ giúp screen chính dễ đọc hơn rất nhiều.

#### 3. Leaderboard screen

File:

- [frontend/src/pages/leaderboard/LeaderboardScreen.tsx](../../frontend/src/pages/leaderboard/LeaderboardScreen.tsx)

Nên tách ra trước:

- `LeaderboardHeader`
- `BoardTabs`
- `FilterRow`
- `RankBadge`
- `InitialsAvatar`
- `LeaderboardRow`
- `SkeletonRows`
- `PinnedPlayerRow`
- `ListHeader`
- `ResetLabel`
- `EmptyState`
- `ErrorState`

Lý do:

- Cấu trúc list screen rất rõ ràng, tách theo row/header/state sẽ sạch hơn.
- Đây là ứng viên tốt cho component row-level và state-level reuse.

#### 4. Profile screen

File:

- [frontend/src/pages/profile/ProfileScreen.tsx](../../frontend/src/pages/profile/ProfileScreen.tsx)

Nên tách ra trước:

- `ProfileHeader`
- `AvatarHero`
- `EloCard`
- `BestScoresCard`
- `RecordStatsCard`
- `FriendRow`
- `FriendsCard`
- `MatchRow`
- `MatchHistoryCard`
- `GuestWall`
- `LoadingIndicator`
- `ErrorState`

Lý do:

- Màn này là một tập hợp nhiều card và row, không nên để trong một file quá dày.

#### 5. Result screen

File:

- [frontend/src/pages/result/ResultScreen.tsx](../../frontend/src/pages/result/ResultScreen.tsx)

Nên tách ra trước:

- `StatePill`
- `ScoreHero`
- `NewRecordBadge`
- `EloChangeCard`
- `RankedBreakdownCard`
- `BestComparison`
- `GuestNotice`
- `SavingOverlay`
- `SaveErrorCard`

Lý do:

- Screen này có nhiều card summary và state overlay, phù hợp để chia theo khối hiển thị.

#### 6. Game select screen

File:

- [frontend/src/pages/game-select/GameSelectScreen.tsx](../../frontend/src/pages/game-select/GameSelectScreen.tsx)

Nên tách ra trước:

- `BackRow`
- `GameCard`
- `ModeChip`
- `DifficultyChip`
- `StartButton`
- icon helpers SVG nhỏ nếu bắt đầu được reuse

Lý do:

- File này đang gom khá nhiều pattern chọn game/mode/difficulty trong cùng một nơi.

#### 7. Versus Room screen

File:

- [frontend/src/pages/versus-room/VersusRoomScreen.tsx](../../frontend/src/pages/versus-room/VersusRoomScreen.tsx) (1214 dòng)

Nên tách ra trước:

- `RoomHeader`
- `ModeSummaryCard`
- `InlineError`
- `CreateRoomForm`
- `JoinRoomForm`
- `PlayerSlotCard`
- `RoomCodeBar`
- `ReadyRoomView`
- `EmptyChoiceView`
- `OfflineWall`

Lý do:

- File này dày hơn cả `GameplayScreen.tsx`, gom nhiều pattern form/state (create, join, ready room, offline, error) trong cùng một nơi.
- `InlineError`/`OfflineWall` có thể tái dùng chung với `ErrorStateCard`/`OfflineStateCard` ở mục ưu tiên #3 phía trên.

#### 8. Versus Gameplay screen

File:

- [frontend/src/pages/versus-gameplay/VersusGameplayScreen.tsx](../../frontend/src/pages/versus-gameplay/VersusGameplayScreen.tsx) (1376 dòng)

Nên tách ra trước:

- `MatchupHeader`
- `RoundBanner`
- `SeedBadge`
- `KeypadButton`
- `NumberBoard`
- `AlphabetBoard`
- `GridBoard`
- `SequenceBoard`
- `WaitingState`
- `ReconnectingOverlay`
- `ErrorOverlay`
- `ResultTransition`
- `PromptBar`
- `LoadingSkeleton`

Lý do:

- File dày nhất trong toàn bộ `pages`, có 4 loại board game (Number/Alphabet/Grid/Sequence) cùng nhiều overlay trạng thái (reconnect, error, result) trong một file.
- `KeypadButton`, `NumberBoard`, `AlphabetBoard`, `GridBoard`, `SequenceBoard` trùng vai trò với board tương ứng trong `GameplayScreen.tsx` (mục ưu tiên #1) — nên soát trùng lặp giữa 2 file này khi tách, ưu tiên dùng chung nếu logic giống nhau.

### Các screen khác có thể tách sau

- `frontend/src/pages/lobby/LobbyScreen.tsx`
- `frontend/src/pages/home/HomeScreen.tsx`
- `frontend/src/pages/auth/LoginScreen.tsx`
- `frontend/src/pages/landing/LandingScreen.tsx`

## Đề xuất cấu trúc thư mục cho các component con đã tách

**Cập nhật (đã chốt, thay thế toàn bộ mapping cũ ở mục này):** mapping ban đầu bên dưới ("XScreen components → `components/ui/x/`") là **sai** — `components/ui/` chỉ dành cho kit dùng chung từ 2 page trở lên. Component con chỉ phục vụ đúng 1 page phải nằm trong `pages/<page>/components/`, không đưa lên `components/ui/`.

### Mapping đúng

- Component con **chỉ dùng cho 1 page** → `frontend/src/pages/<page>/components/`
  - `GameplayScreen` (trừ board dùng chung, xem dưới) → `pages/gameplay/components/`
  - `SequenceMemoryScreen` → `pages/game/components/`
  - `LeaderboardScreen` → `pages/leaderboard/components/`
  - `ProfileScreen` → `pages/profile/components/`
  - `ResultScreen` → `pages/result/components/`
  - `GameSelectScreen` → `pages/game-select/components/`
  - `VersusRoomScreen` → `pages/versus-room/components/`
  - `VersusGameplayScreen` (trừ board dùng chung) → `pages/versus-gameplay/components/`
- Component con **dùng chung từ 2 page trở lên** → `frontend/src/components/ui/<kit>/`
  - Duy nhất một trường hợp ở nhóm màn hình này: `KeypadButton`, `NumberBoard`, `AlphabetBoard`, `GridBoard`, `SequenceBoard` (+ `Phase` type) dùng chung giữa `GameplayScreen` và `VersusGameplayScreen` → ở lại `frontend/src/components/ui/gameplay/`. Mọi thứ khác của hai screen này (header, overlay, prompt bar, state pill...) là local, đưa vào `components/` riêng của từng page.
- `interface`/`mock`/`api` của mỗi page → `frontend/src/services/<page>/` (xem mục "Chuẩn hóa `enum`, `interface`, `api`, và `mock`" phía trên), không đặt trong `pages/` và không đặt trong `components/ui/`.

### Gợi ý cấu trúc

```text
frontend/src/
	pages/
		gameplay/
			GameplayScreen.tsx
			components/
				StatePill.tsx
				GameTypePill.tsx
				CountdownRing.tsx
				PhaseBanner.tsx
				StatRow.tsx
				PauseOverlay.tsx
				TutorialOverlay.tsx
				LoadingSkeleton.tsx
				ErrorState.tsx
				PromptBar.tsx
		leaderboard/
			LeaderboardScreen.tsx
			components/
				LeaderboardHeader.tsx
				BoardTabs.tsx
				FilterRow.tsx
				LeaderboardRow.tsx
				SkeletonRows.tsx
				EmptyState.tsx
				ErrorState.tsx
	services/
		gameplay/
			gameplay-screen.types.ts
		leaderboard/
			leaderboard.interface.ts
			leaderboard.mock.ts
	components/
		ui/
			gameplay/
				NumberBoard.tsx
				AlphabetBoard.tsx
				GridBoard.tsx
				SequenceBoard.tsx
				KeypadButton.tsx
				board.types.ts
				index.ts
```

### Component Card Dùng Chung (`components/ui/card/`)
- `Card.tsx`: Generic surface container với border, shadow, và padding configurable.
- `CollapsibleCard.tsx`: Wrapper dùng chung cho tất cả các Card có tiêu đề thu gọn/mở rộng. Quản lý trạng thái `isCollapsed`, animation xoay **Icon Chevron SVG (`IconChevronDown`)** 90°, và hỗ trợ linh hoạt các props `title`, `subtitle`, `action`. Được áp dụng đồng bộ cho:
  - `EloCard` (Profile)
  - `BestScoresCard` (Profile)
  - `RecordStatsCard` (Profile)
  - `FriendsCard` (Profile)
  - `MatchHistoryCard` (Profile)
  - `AvailableRoomsCard` (Lobby)

### Quy ước thực tế

- Page file (`<Page>Screen.tsx`) chỉ nên giữ logic state, data fetching, and composition.
- Component con lớn nên được chuyển ra file riêng trong `pages/<page>/components/` của chính page đó.
- Nếu component con bắt đầu bị dùng lại ở 2 page trở lên, lúc đó mới chuyển nó sang `components/ui/<kit>/` — không chuyển sớm hơn.

## Map nhanh theo file

### High value

- [frontend/src/pages/home/HomeScreen.tsx](../../frontend/src/pages/home/HomeScreen.tsx)
- [frontend/src/pages/lobby/LobbyScreen.tsx](../../frontend/src/pages/lobby/LobbyScreen.tsx)
- [frontend/src/pages/game-select/GameSelectScreen.tsx](../../frontend/src/pages/game-select/GameSelectScreen.tsx)
- [frontend/src/pages/leaderboard/LeaderboardScreen.tsx](../../frontend/src/pages/leaderboard/LeaderboardScreen.tsx)
- [frontend/src/pages/profile/ProfileScreen.tsx](../../frontend/src/pages/profile/ProfileScreen.tsx)
- [frontend/src/pages/result/ResultScreen.tsx](../../frontend/src/pages/result/ResultScreen.tsx)
- [frontend/src/pages/auth/LoginScreen.tsx](../../frontend/src/pages/auth/LoginScreen.tsx)
- [frontend/src/pages/settings/SettingsScreen.tsx](../../frontend/src/pages/settings/SettingsScreen.tsx) (Settings duy nhất còn lại, đã merge V1+V2+V3 — xem mục #9)
- [frontend/src/pages/versus-room/VersusRoomScreen.tsx](../../frontend/src/pages/versus-room/VersusRoomScreen.tsx)
- [frontend/src/pages/versus-gameplay/VersusGameplayScreen.tsx](../../frontend/src/pages/versus-gameplay/VersusGameplayScreen.tsx)

### Medium value

- [frontend/src/pages/game/SequenceMemoryScreen.tsx](../../frontend/src/pages/game/SequenceMemoryScreen.tsx)
- [frontend/src/pages/dialog/DialogDemoScreen.tsx](../../frontend/src/pages/dialog/DialogDemoScreen.tsx)

## Thứ tự refactor đề xuất

1. Chuyển `Button` và `Card` vào kit folder (`button/`, `card/`) trước — các bước sau (StatCard, HeroSummaryCard, EmptyStateCard...) đều nằm trong `card/` nên cần nền này trước.
2. Tạo `ScreenShell` và `ScreenHeader`.
3. Tách `EmptyStateCard` và `ErrorStateCard`.
4. Tách `SegmentedControl` / `ChipGroup`.
5. Gom `StatCard` / `HeroSummaryCard`.
6. Gom `ShortcutGrid`.
7. ~~Dọn `Settings` thành một implementation duy nhất~~ — **Xong.** `SettingsScreenV1.tsx` đã xoá (mồ côi), `SettingsScreenV2.tsx` đã xoá (UI merge vào `pages/settings/SettingsScreen.tsx`), và toàn bộ folder `pages/settings/` (bản `SettingsScreen.tsx` không version) đã xoá. Chỉ còn `pages/settings/SettingsScreen.tsx`, `App.tsx` import thẳng làm `SettingsScreen`, screen id `'settings'`. Việc còn lại (tách `Settings*.tsx` ra `components/ui/settings/`) nằm trong nhóm #1–#8 phía trên như mọi screen khác, xem mục #9.
8. Tách `VersusRoomScreen.tsx` và `VersusGameplayScreen.tsx` — xem mục "Ưu tiên tách trước" #7 và #8 bên trên.

## Ghi chú cho Claude

- Ưu tiên reuse từ `components/ui` trước khi tạo component mới.
- Nếu một block chỉ dùng ở 1 screen nhưng có cấu trúc rõ ràng và theo design system, vẫn có thể tách ra nếu nó làm screen sạch hơn.
- Nếu gặp chỗ thiếu spec, dừng lại và ghi rõ: "Missing in source documentation." thay vì tự đoán.

## Kết luận

Nếu refactor theo đúng tài liệu này, phần `pages` sẽ chuyển từ các screen tự ôm layout sang một lớp component kit rõ ràng hơn, dễ reuse hơn, và dễ giữ consistency hơn mà không thay đổi behavior hiện có.