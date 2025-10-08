export const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.8; // âm lượng 80%
    audio.play().catch((err) => {
        console.warn('Không thể phát âm thanh (có thể do autoplay bị chặn):', err);
    });
};