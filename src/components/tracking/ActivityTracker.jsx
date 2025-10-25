import { useAuth } from "@/hooks/useAuth";

export const useActivityTracker = () => {
  const { user, isLoaded, isSignedIn } = useAuth();

  const trackActivity = async (activityType, activityData = {}) => {
    // Guard: only track when user is signed in
    if (!isLoaded || !isSignedIn || !user?.id) return;

    try {
      await UserActivity.create({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking activity:", error);
    }
  };

  return { trackActivity, user };
};

export default function ActivityTracker({ children }) {
  const { trackActivity } = useActivityTracker();

  return (
    <div
      onClick={() => trackActivity("page_interaction")}
      onKeyDown={() => trackActivity("page_interaction")}
    >
      {children}
    </div>
  );
}
