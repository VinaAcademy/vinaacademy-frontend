"use client";

interface WelcomeSectionProps {
    userName: string;
    userAvatar: string;
}

const WelcomeSection = ({userName, userAvatar}: WelcomeSectionProps) => {
    return (
        <div className="flex items-center justify-start gap-4 py-2 mt-5 sm:mt-6 md:mt-8 w-full px-5">
            {/* Avatar */}
            {userAvatar ? (
                <img
                    src={userAvatar}
                    alt="User Avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300"
                />
            ) : (
                <div
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-300 border-2 border-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a9 9 0 0115 0"
                        />
                    </svg>
                </div>
            )}

            {/* Welcome Text */}
            <span className="text-lg sm:text-xl font-semibold text-black">Chào mừng trở lại, {userName}! 👋</span>
        </div>
    );
};

export default WelcomeSection;