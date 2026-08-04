import { useState } from 'react'
import { ModalBackdrop } from '@/components/ui/ModalBackdrop'
import {
  IconCategoryNumber,
  IconCategoryAlphabet,
  IconCategoryGrid,
  IconCategorySequence,
  IconCategoryColor,
  IconSparkles,
  IconSwords,
  IconTrophy16 as IconTrophy,
} from '@/components/ui/icons'
import { useTranslation } from '@/i18n/useTranslation'

interface Props {
  visible: boolean
  onClose: () => void
  onStartPlaying?: () => void
}

export function WelcomeOnboardingModal({ visible, onClose, onStartPlaying }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  if (!visible) return null

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3)
    } else {
      onClose()
      onStartPlaying?.()
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <ModalBackdrop show={visible} onClose={onClose}>
      <div
        className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md max-h-[78dvh] sm:max-h-[85vh] flex flex-col overflow-hidden p-4 sm:p-5 transition-all relative"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--ma-surface-raised)',
          border: '1px solid var(--ma-border)',
          boxShadow: 'var(--ma-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Step Indicator */}
        <div className="flex items-center justify-between pb-3 shrink-0 border-b border-[var(--ma-border-subtle)]">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: step === i ? '1.5rem' : '0.5rem',
                  background: step === i ? 'var(--ma-brand)' : 'var(--ma-border)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-[12px] font-semibold text-[var(--ma-fg-subtle)] hover:text-[var(--ma-fg)] transition-colors px-2 py-1 rounded-lg"
          >
            {(t.common as Record<string, string>).skip || 'Bỏ qua'}
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col items-center text-center gap-4 animate-in fade-in duration-200">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                style={{
                  background: 'var(--ma-brand-soft)',
                  color: 'var(--ma-brand)',
                  border: '1px solid oklch(0.76 0.14 74 / 0.3)',
                }}
              >
                <IconSparkles width={32} height={32} />
              </div>

              <div className="space-y-1">
                <h2 className="text-[20px] font-bold text-[var(--ma-fg)] tracking-tight">
                  Chào mừng đến với GameBoard! 👋
                </h2>
                <p className="text-[13px] text-[var(--ma-fg-muted)] leading-relaxed px-2">
                  Nền tảng rèn luyện trí nhớ và thi đấu đối kháng 1v1 thời gian thực chuẩn quốc tế.
                </p>
              </div>

              <div className="w-full flex flex-col gap-2.5 pt-2 text-left">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <span className="text-lg shrink-0">🧠</span>
                  <div>
                    <div className="font-bold text-[13px] text-[var(--ma-fg)]">5 Thể loại Game Trí nhớ</div>
                    <div className="text-[12px] text-[var(--ma-fg-subtle)]">Số, Chữ cái, Lưới ma trận, Chuỗi nhịp điệu & Màu sắc.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <span className="text-lg shrink-0">⚔️</span>
                  <div>
                    <div className="font-bold text-[13px] text-[var(--ma-fg)]">Đấu đối kháng 1v1 PvP</div>
                    <div className="text-[12px] text-[var(--ma-fg-subtle)]">Thách đấu bạn bè hoặc Tìm trận xếp hạng Elo thời gian thực.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <span className="text-lg shrink-0">🏆</span>
                  <div>
                    <div className="font-bold text-[13px] text-[var(--ma-fg)]">Hệ thống Rating Elo & Rank</div>
                    <div className="text-[12px] text-[var(--ma-fg-subtle)]">Điểm Elo chuẩn Chess, vinh danh trên Bảng xếp hạng toàn cầu.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center text-center gap-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-[18px] font-bold text-[var(--ma-fg)]">
                  🧠 5 Thể loại Game & Hệ thống Elo
                </h2>
                <p className="text-[12px] text-[var(--ma-fg-muted)]">
                  Mỗi thể loại đại diện cho một kỹ năng trí nhớ chuyên biệt:
                </p>
              </div>

              <div className="w-full grid grid-cols-1 gap-2 text-left">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ma-surface-raised)] text-[var(--ma-brand)] shrink-0">
                    <IconCategoryNumber width={16} height={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-[var(--ma-fg)]">Trí Nhớ Số (Number Memory)</div>
                    <div className="text-[11px] text-[var(--ma-fg-subtle)]">Nhớ chuỗi chữ số & nhập lại chuẩn xác</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ma-surface-raised)] text-[var(--ma-brand)] shrink-0">
                    <IconCategoryAlphabet width={16} height={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-[var(--ma-fg)]">Trí Nhớ Chữ Cái (Alphabet Memory)</div>
                    <div className="text-[11px] text-[var(--ma-fg-subtle)]">Kết hợp chữ cái + con số phản xạ nhanh</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ma-surface-raised)] text-[var(--ma-brand)] shrink-0">
                    <IconCategoryGrid width={16} height={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-[var(--ma-fg)]">Trí Nhớ Lưới (Grid Memory)</div>
                    <div className="text-[11px] text-[var(--ma-fg-subtle)]">Nhớ vị trí ô số & bấm tăng dần</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ma-surface-raised)] text-[var(--ma-brand)] shrink-0">
                    <IconCategorySequence width={16} height={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-[var(--ma-fg)]">Trí Nhớ Chuỗi (Sequence Memory)</div>
                    <div className="text-[11px] text-[var(--ma-fg-subtle)]">Theo dõi & tái tạo thứ tự ô phát sáng</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ma-surface-raised)] text-[var(--ma-brand)] shrink-0">
                    <IconCategoryColor width={16} height={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-[var(--ma-fg)]">Trí Nhớ Màu Sắc (Color Memory)</div>
                    <div className="text-[11px] text-[var(--ma-fg-subtle)]">Nhớ giai điệu chuỗi màu sắc Simon</div>
                  </div>
                </div>
              </div>

              <div className="w-full p-3 rounded-xl text-left bg-[oklch(0.76_0.14_74_/_0.10)] border border-[oklch(0.76_0.14_74_/_0.25)]">
                <div className="text-[11px] font-bold text-[var(--ma-brand)] uppercase tracking-wider flex items-center gap-1">
                  <IconTrophy /> Elo Tổng Thể
                </div>
                <div className="text-[12px] text-[var(--ma-fg)] mt-0.5 leading-snug">
                  Elo tổng thể là <strong>trung bình cộng Elo của 5 game</strong>. Hãy thi đấu đều cả 5 môn để nâng Rank nhanh nhất!
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-4 animate-in fade-in duration-200">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                style={{
                  background: 'var(--ma-brand-soft)',
                  color: 'var(--ma-brand)',
                  border: '1px solid oklch(0.76 0.14 74 / 0.3)',
                }}
              >
                <IconSwords className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-[18px] font-bold text-[var(--ma-fg)]">
                  Sẵn sàng bắt đầu! 🚀
                </h2>
                <p className="text-[12px] text-[var(--ma-fg-muted)]">
                  Chọn chế độ chơi phù hợp với bạn:
                </p>
              </div>

              <div className="w-full flex flex-col gap-2 text-left">
                <div className="p-3 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="font-bold text-[13px] text-[var(--ma-fg)]">🎯 Luyện tập tự do (Solo Practice)</div>
                  <div className="text-[12px] text-[var(--ma-fg-subtle)] mt-0.5">Không tính thời gian, có nút hiển thị đáp án sau mỗi vòng.</div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="font-bold text-[13px] text-[var(--ma-fg)]">🏆 Xếp hạng cá nhân (Solo Ranked)</div>
                  <div className="text-[12px] text-[var(--ma-fg-subtle)] mt-0.5">Thi đấu tính điểm kỷ lục và lưu kết quả vào Bảng xếp hạng.</div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--ma-surface)] border border-[var(--ma-border-subtle)]">
                  <div className="font-bold text-[13px] text-[var(--ma-fg)]">⚔️ Thi đấu 1v1 (Versus PvP)</div>
                  <div className="text-[12px] text-[var(--ma-fg-subtle)] mt-0.5">Tạo phòng thách đấu bạn bè hoặc Tìm trận nhanh theo điểm Elo.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 shrink-0 border-t border-[var(--ma-border-subtle)] flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="py-2.5 px-4 rounded-xl font-semibold text-[13px] bg-[var(--ma-surface)] text-[var(--ma-fg-muted)] hover:bg-[var(--ma-surface-raised)] transition-colors border border-[var(--ma-border)]"
            >
              Quay lại
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-2.5 rounded-xl font-bold text-[14px] transition-all shadow-md active:scale-[0.98]"
            style={{
              background: 'var(--ma-brand)',
              color: 'var(--ma-brand-fg, #ffffff)',
            }}
          >
            {step < 3 ? 'Tiếp theo →' : 'Bắt đầu ngay 🚀'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
