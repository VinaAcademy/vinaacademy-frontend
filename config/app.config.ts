export const APP_CONFIG = {
    APP_NAME: 'VinaAcademy',
    APP_TITLE: 'VinaAcademy - Nền tảng học trực tuyến',
    APP_DESCRIPTION: 'Học mọi lúc, mọi nơi với VinaAcademy',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    COURSES: {
        RECENT_COURSES_LIMIT: 5,
        USER_LEARNING_LIMIT: 5
    },
    HIDE_LAYOUT_ROUTES: [
        "/conversations/",
        "/instructor",
        "/instructor/dashboard",
        "/instructor/courses",
        "/instructor/students",
        "/instructor/earnings",
        "/instructor/profile-settings",
        "/instructors/become-instructor"],
    LOADING_IGNORE_ROUTES: [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password"
    ],
    WS_HEARTBEAT_INTERVAL: 60000 // 60 seconds
}