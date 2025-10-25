// Utility functions to standardize user data fetching across the app

const isValidUserId = (userId) => {
  return userId && typeof userId === 'string' && userId.trim() !== '' && !userId.includes(' ');
};

export const getUserDataForMessaging = async (userId) => {
  if (!isValidUserId(userId)) {
    console.error('Invalid user ID provided:', userId);
    return {
      id: userId,
      full_name: 'Specialist',
      profile_image_url: null
    };
  }

  // Try multiple methods to get user data, with fallbacks
  let userData = null;
  
  // Method 1: Try PublicUserProfile first (more likely to be accessible)
  try {
    const publicProfiles = await PublicUserProfile.filter({ user_id: userId });
    if (publicProfiles.length > 0) {
      const pp = publicProfiles[0];
      userData = {
        id: pp.user_id,
        full_name: pp.full_name || pp.public_name || 'Specialist',
        profile_image_url: pp.profile_image_url
      };
    }
  } catch (e) {
    console.log('PublicUserProfile lookup failed, trying next method');
  }

  // Method 2: Try direct User lookup (only if we have a valid ID)
  if (!userData && isValidUserId(userId)) {
    try {
      const user = await User.get(userId);
      userData = {
        id: user.id,
        full_name: user.full_name || user.public_name || 'User',
        profile_image_url: user.profile_image_url || user.picture
      };
    } catch (e) {
      console.log('Direct User lookup failed, trying freelancer profile');
    }
  }

  // Method 3: Try FreelancerProfile as fallback
  if (!userData) {
    try {
      const profiles = await FreelancerProfile.filter({ user_id: userId });
      if (profiles.length > 0) {
        userData = {
          id: userId,
          full_name: profiles[0].headline || 'Specialist',
          profile_image_url: null
        };
      }
    } catch (e) {
      console.log('FreelancerProfile lookup failed');
    }
  }

  // Final fallback - create basic user data with better naming
  if (!userData) {
    // Generate a more user-friendly name based on userId
    const userNumber = userId.substring(0, 8); // Use first 8 chars of ID
    userData = {
      id: userId,
      full_name: `Professional Specialist`,
      profile_image_url: `https://ui-avatars.com/api/?name=Professional+Specialist&background=6366f1&color=fff`
    };
  }

  return userData;
};

export const createConversationData = (currentUser, otherUser) => {
  return {
    participant_ids: [currentUser.id, otherUser.id],
    participant_info: [
      {
        user_id: currentUser.id,
        full_name: currentUser.full_name,
        profile_image_url: currentUser.profile_image_url || currentUser.picture
      },
      {
        user_id: otherUser.id,
        full_name: otherUser.full_name,
        profile_image_url: otherUser.profile_image_url
      }
    ],
    last_message: 'Start your conversation...',
    updated_date: new Date().toISOString()
  };
};